import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import generateToken from '../utils/generateToken.js';
import Group from '../models/Group.js';
import Notification from '../models/Notification.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, password, phone, inviteToken } = req.body;
  const normalizedEmail = req.body.email?.trim().toLowerCase();

  try {
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const invitation = inviteToken
      ? await Invitation.findOne({ token: inviteToken, email: normalizedEmail, status: 'PENDING' })
      : null;

    if (inviteToken && !invitation) {
      return res.status(400).json({ message: 'This invitation is invalid or was sent to a different email address.' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
    });

    if (user) {
      // Check if they registered via an invite link
      if (invitation) {
        // Add them as friends
        await User.findByIdAndUpdate(user._id, { $addToSet: { friends: invitation.sender } });
        await User.findByIdAndUpdate(invitation.sender, { $addToSet: { friends: user._id } });

        if (invitation.group) {
          const group = await Group.findById(invitation.group);
          if (group) {
            const inviter = await User.findById(invitation.sender).select('name');
            group.members.addToSet(user._id);
            await group.save();
            await User.findByIdAndUpdate(user._id, { $addToSet: { groups: group._id } });
            await Notification.insertMany([
              {
                user: user._id,
                type: 'GROUP_ADD',
                message: `${inviter?.name || 'Your friend'} added you to "${group.name}".`,
                relatedUser: invitation.sender,
                relatedGroup: group._id,
              },
              {
                user: invitation.sender,
                type: 'GROUP_ADD',
                message: `${user.name} accepted your invitation to join "${group.name}".`,
                relatedUser: user._id,
                relatedGroup: group._id,
              },
            ]);
          }
        }

        // Mark invitation as accepted
        invitation.status = 'ACCEPTED';
        await invitation.save();
      }
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        phone: user.phone,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        phone: user.phone,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        phone: user.phone,
        friends: user.friends,
        groups: user.groups,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie or token (client side clears token, here we can just send success)
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
