// Utilities to validate and calculate splits

export const validateSplits = (amount, splitMethod, splits) => {
  if (!splits || splits.length === 0) return false;

  let totalCalculated = 0;

  if (splitMethod === 'EQUAL') {
    return true; // We calculate EQUAL on the backend
  }

  if (splitMethod === 'EXACT') {
    totalCalculated = splits.reduce((acc, split) => acc + Number(split.amount || 0), 0);
    // JS floating point precision check
    return Math.abs(totalCalculated - amount) < 0.01;
  }

  if (splitMethod === 'PERCENTAGE') {
    const totalPercentage = splits.reduce((acc, split) => acc + Number(split.percentage || 0), 0);
    return Math.abs(totalPercentage - 100) < 0.01;
  }

  if (splitMethod === 'SHARES') {
    const totalShares = splits.reduce((acc, split) => acc + Number(split.share || 0), 0);
    return totalShares > 0;
  }

  return false;
};

export const calculateSplits = (amount, splitMethod, splits) => {
  const calculatedSplits = [];

  if (splitMethod === 'EQUAL') {
    const splitAmount = +(amount / splits.length).toFixed(2);
    // Handle precision errors by giving remainder to first person
    let total = splitAmount * splits.length;
    let diff = amount - total;
    
    splits.forEach((split, index) => {
      let finalAmount = splitAmount;
      if (index === 0 && diff !== 0) {
         finalAmount = +(finalAmount + diff).toFixed(2);
      }
      calculatedSplits.push({ user: split.user, amount: finalAmount });
    });
  } 
  else if (splitMethod === 'EXACT') {
    splits.forEach(split => {
      calculatedSplits.push({ user: split.user, amount: Number(split.amount) });
    });
  }
  else if (splitMethod === 'PERCENTAGE') {
    let currentTotal = 0;
    splits.forEach((split, index) => {
      let finalAmount = +((amount * Number(split.percentage)) / 100).toFixed(2);
      if (index === splits.length - 1) {
        finalAmount = +(amount - currentTotal).toFixed(2);
      }
      currentTotal += finalAmount;
      calculatedSplits.push({ user: split.user, amount: finalAmount, percentage: split.percentage });
    });
  }
  else if (splitMethod === 'SHARES') {
    const totalShares = splits.reduce((acc, split) => acc + Number(split.share), 0);
    let currentTotal = 0;
    splits.forEach((split, index) => {
      let finalAmount = +((amount * Number(split.share)) / totalShares).toFixed(2);
      if (index === splits.length - 1) {
        finalAmount = +(amount - currentTotal).toFixed(2);
      }
      currentTotal += finalAmount;
      calculatedSplits.push({ user: split.user, amount: finalAmount, share: split.share });
    });
  }

  return calculatedSplits;
};
