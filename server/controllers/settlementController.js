import Settlement from '../models/Settlement.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Add a settlement
// @route   POST /api/settlements
// @access  Private
export const addSettlement = async (req, res) => {
  const { payeeId, amount, paymentMethod, group } = req.body;

  try {
    if (req.user._id.toString() === payeeId) {
      return res.status(400).json({ message: 'Cannot settle with yourself' });
    }

    if (!payeeId || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A friend and a payment amount greater than zero are required' });
    }

    const payee = await User.findById(payeeId).select('name');
    if (!payee) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    const settlement = await Settlement.create({
      payer: req.user._id,
      payee: payeeId,
      amount,
      paymentMethod,
      group: group || null,
    });

    const payerName = req.user.name || 'Your friend';
    await Notification.insertMany([
      {
        user: payeeId,
        type: 'SETTLEMENT',
        message: `${payerName} sent you INR ${Number(amount).toFixed(2)}.`,
        relatedUser: req.user._id,
      },
      {
        user: req.user._id,
        type: 'SETTLEMENT',
        message: `You sent INR ${Number(amount).toFixed(2)} to ${payee.name}.`,
        relatedUser: payeeId,
      },
    ]);

    res.status(201).json(settlement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get settlements
// @route   GET /api/settlements
// @access  Private
export const getSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({
      $or: [
        { payer: req.user._id },
        { payee: req.user._id }
      ]
    })
    .populate('payer', 'name profileImage email')
    .populate('payee', 'name profileImage email')
    .sort({ date: -1 });

    res.json(settlements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
