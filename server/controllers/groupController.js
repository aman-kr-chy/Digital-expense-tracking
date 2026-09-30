import Group from '../models/Group.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Notification from '../models/Notification.js';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res) => {
  const { name, description, category, members } = req.body;

  try {
    const validMembers = Array.isArray(members) ? [...new Set(members.map(String))] : [];
    const friendIds = req.user.friends.map((friendId) => friendId.toString());
    if (validMembers.some((memberId) => !friendIds.includes(memberId))) {
      return res.status(400).json({ message: 'Groups can only include your friends' });
    }

    if (!validMembers.includes(req.user._id.toString())) {
      validMembers.push(req.user._id.toString());
    }

    const group = await Group.create({
      name,
      description,
      category,
      createdBy: req.user._id,
      members: validMembers,
    });

    // Add group to all members
    await User.updateMany(
      { _id: { $in: validMembers } },
      { $push: { groups: group._id } }
    );

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user groups
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email profileImage')
      .populate('createdBy', 'name email');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email profileImage')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(401).json({ message: 'Not authorized to view this group' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    group.name = req.body.name || group.name;
    group.description = req.body.description || group.description;
    group.category = req.body.category || group.category;

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only creator can delete the group' });
    }

    // Remove group from all members
    await User.updateMany(
      { _id: { $in: group.members } },
      { $pull: { groups: group._id } }
    );
    
    // Also delete all expenses in this group? Or maybe just keep them as individual? Let's delete for simplicity
    await Expense.deleteMany({ group: group._id });

    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
export const addMember = async (req, res) => {
  const { userId } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.some((memberId) => memberId.toString() === req.user._id.toString())) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!req.user.friends.some((friendId) => friendId.toString() === userId)) {
      return res.status(400).json({ message: 'Add this person as a friend before adding them to the group' });
    }

    if (group.members.some((memberId) => memberId.toString() === userId)) {
      return res.status(400).json({ message: 'User already in group' });
    }

    const newMember = await User.findById(userId).select('name');
    if (!newMember) return res.status(404).json({ message: 'User not found' });

    group.members.push(userId);
    await group.save();
    
    await User.findByIdAndUpdate(userId, { $push: { groups: group._id } });
    await Notification.create({
      user: userId,
      type: 'GROUP_ADD',
      message: `${req.user.name} added you to the group "${group.name}".`,
      relatedUser: req.user._id,
      relatedGroup: group._id,
    });

    res.json(await group.populate('members', 'name email profileImage'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
export const removeMember = async (req, res) => {
  const { userId } = req.params;
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.user._id)) return res.status(401).json({ message: 'Not authorized' });

    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();
    
    await User.findByIdAndUpdate(userId, { $pull: { groups: group._id } });

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
