import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';

export const calculateBalances = async (userId) => {
  try {
    const expenses = await Expense.find({
      $or: [
        { paidBy: userId },
        { 'splits.user': userId }
      ]
    });

    const settlements = await Settlement.find({
      $or: [
        { payer: userId },
        { payee: userId }
      ]
    });

    const balances = {}; // { otherUserId: amount }  positive means they owe user, negative means user owes them

    // Process expenses
    expenses.forEach(exp => {
      const isPayer = exp.paidBy.toString() === userId.toString();
      
      if (isPayer) {
        exp.splits.forEach(split => {
          const splitUserId = split.user.toString();
          if (splitUserId !== userId.toString()) {
            balances[splitUserId] = (balances[splitUserId] || 0) + split.amount;
          }
        });
      } else {
        const mySplit = exp.splits.find(s => s.user.toString() === userId.toString());
        if (mySplit) {
          const payerId = exp.paidBy.toString();
          balances[payerId] = (balances[payerId] || 0) - mySplit.amount;
        }
      }
    });

    // Process settlements
    settlements.forEach(stlt => {
      const isPayer = stlt.payer.toString() === userId.toString();
      const otherUserId = isPayer ? stlt.payee.toString() : stlt.payer.toString();
      
      if (isPayer) {
        // User paid someone (reduces what user owes them, meaning adds to balance)
        balances[otherUserId] = (balances[otherUserId] || 0) + stlt.amount;
      } else {
        // User received payment (reduces what they owe user, meaning subtracts from balance)
        balances[otherUserId] = (balances[otherUserId] || 0) - stlt.amount;
      }
    });

    // Clean up 0 balances
    for (const id in balances) {
      if (Math.abs(balances[id]) < 0.01) {
        delete balances[id];
      }
    }

    return balances;
  } catch (error) {
    throw new Error(error.message);
  }
};
