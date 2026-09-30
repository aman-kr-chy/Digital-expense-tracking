import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import Notification from '../models/Notification.js';
import { validateSplits, calculateSplits } from '../utils/expenseLogic.js';

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
export const addExpense = async (req, res) => {
  const { title, amount, description, date, category, paidBy, group, splitMethod, splits } = req.body;

  try {
    if (!validateSplits(amount, splitMethod, splits)) {
      return res.status(400).json({ message: 'Invalid split amounts or configuration' });
    }

    const calculatedSplits = calculateSplits(amount, splitMethod, splits);

    const expense = await Expense.create({
      title,
      amount,
      description,
      date,
      category,
      paidBy: paidBy || req.user._id,
      group: group || null,
      splitMethod,
      splits: calculatedSplits,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user expenses
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    // Find expenses where the user is either the payer or in the splits
    const expenses = await Expense.find({
      $or: [
        { paidBy: req.user._id },
        { 'splits.user': req.user._id }
      ]
    })
    .populate('paidBy', 'name profileImage')
    .populate('splits.user', 'name profileImage')
    .populate('group', 'name')
    .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name email profileImage')
      .populate('splits.user', 'name email profileImage')
      .populate('group', 'name');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  const { title, amount, description, date, category, paidBy, splitMethod, splits } = req.body;

  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Only payer or people in the expense can update it, let's keep it simple
    if (expense.paidBy.toString() !== req.user._id.toString() && !expense.splits.some(s => s.user.toString() === req.user._id.toString())) {
      return res.status(401).json({ message: 'Not authorized to update this expense' });
    }

    if (amount || splitMethod || splits) {
       if (!validateSplits(amount || expense.amount, splitMethod || expense.splitMethod, splits || expense.splits)) {
          return res.status(400).json({ message: 'Invalid split amounts or configuration' });
       }
       expense.splits = calculateSplits(amount || expense.amount, splitMethod || expense.splitMethod, splits || expense.splits);
    }

    expense.title = title || expense.title;
    expense.amount = amount || expense.amount;
    expense.description = description || expense.description;
    expense.date = date || expense.date;
    expense.category = category || expense.category;
    expense.paidBy = paidBy || expense.paidBy;
    expense.splitMethod = splitMethod || expense.splitMethod;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only payer can delete the expense' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
