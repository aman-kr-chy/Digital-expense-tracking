import crypto from 'crypto';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';
import Group from '../models/Group.js';
import Invitation from '../models/Invitation.js';
import { sendInviteEmail } from '../utils/sendEmail.js';

// @desc    Read invitation details before signup
// @route   GET /api/friends/invite/:token
// @access  Public
export const getInvitationDetails = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token, status: 'PENDING' })
      .populate('group', 'name');
    if (!invitation) {
      return res.status(404).json({ message: 'This invitation is invalid or has already been used' });
    }

    res.json({ email: invitation.email, groupName: invitation.group?.name || null });
  } catch (error) {
    res.status(500).json({ message: 'Could not load invitation details' });
  }
};

// @desc    Get all friends
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email profileImage');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send friend request
// @route   POST /api/friends/request
// @access  Private
export const sendFriendRequest = async (req, res) => {
  const { receiverId } = req.body;
  
  if (req.user._id.toString() === receiverId) {
    return res.status(400).json({ message: 'Cannot send friend request to yourself' });
  }

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.friends.includes(receiverId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: 'PENDING'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const friendRequest = await FriendRequest.create({
      sender: req.user._id,
      receiver: receiverId
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept or Reject friend request
// @route   PUT /api/friends/request/:id
// @access  Private
export const updateFriendRequest = async (req, res) => {
  const { status } = req.body; // 'ACCEPTED' or 'REJECTED'

  try {
    const request = await FriendRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    if (status === 'ACCEPTED') {
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
    }

    res.json({ message: `Friend request ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:id
// @access  Private
export const removeFriend = async (req, res) => {
  const friendId = req.params.id;

  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user._id } });

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests
// @access  Private
export const getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ receiver: req.user._id, status: 'PENDING' }).populate('sender', 'name email profileImage');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send email invitation to a non-user
// @route   POST /api/friends/invite
// @access  Private
export const inviteFriendByEmail = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { groupId } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address, such as name@example.com' });
  }

  try {
    let group = null;
    if (groupId) {
      group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      if (!group.members.some((memberId) => memberId.toString() === req.user._id.toString())) {
        return res.status(401).json({ message: 'You must be a group member to invite someone' });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email already has a SplitEase account. Send them a friend request, then add them to the group.' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Save invitation to DB
    await Invitation.create({
      sender: req.user._id,
      group: group?._id,
      email,
      token
    });

    // Generate frontend register URL with invite token
    // The client url should be passed or we assume it's the referer origin
    const clientUrl = (process.env.CLIENT_URL || req.headers.origin || 'http://localhost:5173').replace(/\/$/, '');
    const inviteLink = `${clientUrl}/register?invite=${encodeURIComponent(token)}`;

    // Email is best-effort. The link is returned so it can be shared manually.
    let emailSent = false;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await sendInviteEmail(email, inviteLink, req.user.name, group?.name);
        emailSent = true;
      } catch (emailError) {
        console.error('Invite email could not be sent:', emailError.message);
      }
    }

    res.status(200).json({ 
      message: emailSent
        ? `Invitation email sent to ${email}. You can also copy the invite link to share it directly.`
        : 'Invite link created. Copy and share it with your friend.',
      inviteLink,
      emailSent
    });
  } catch (error) {
    if (error.code === 'EAUTH') {
      return res.status(502).json({ message: 'Email sign-in failed. Check the Gmail address and app password in server/.env.' });
    }
    const command = String(error.command || '').toUpperCase();
    const smtpResponse = String(error.response || error.message || '')
      .replace(/[\r\n]+/g, ' ')
      .slice(0, 240);
    if (command.includes('RCPT TO')) {
      return res.status(400).json({ message: `The recipient address was rejected by the mail provider. ${smtpResponse}` });
    }
    if (command.includes('MAIL FROM')) {
      return res.status(502).json({ message: `The Gmail sender address was rejected. Check SMTP_USER in server/.env. ${smtpResponse}` });
    }
    if (error.code === 'EENVELOPE' || error.responseCode === 550) {
      return res.status(502).json({ message: `The mail provider rejected the message. Check both the recipient address and Gmail sender settings. ${smtpResponse}` });
    }
    res.status(502).json({ message: `Could not send the invitation email. ${smtpResponse}` });
  }
};
