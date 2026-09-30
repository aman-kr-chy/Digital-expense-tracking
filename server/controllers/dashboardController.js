import { calculateBalances } from '../utils/balanceCalculator.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const balances = await calculateBalances(req.user._id);

    let youOwe = 0;
    let othersOweYou = 0;

    for (const id in balances) {
      if (balances[id] > 0) {
        othersOweYou += balances[id];
      } else {
        youOwe += Math.abs(balances[id]);
      }
    }

    const netBalance = othersOweYou - youOwe;

    const recentExpenses = await Expense.find({
      $or: [
        { paidBy: req.user._id },
        { 'splits.user': req.user._id }
      ]
    })
    .sort({ date: -1 })
    .limit(5)
    .populate('paidBy', 'name');

    const recentSettlements = await Settlement.find({
      $or: [
        { payer: req.user._id },
        { payee: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('payer', 'name')
    .populate('payee', 'name');

    res.json({
      youOwe,
      othersOweYou,
      netBalance,
      recentExpenses,
      recentSettlements,
      balances, // { otherUserId: amount }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
