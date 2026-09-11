export const monthlyEquivalent = (amount, billingCycle) => {
  const numAmount = Number(amount) || 0;
  let monthlyCost = 0;

  switch (billingCycle) {
    case 'weekly':
      monthlyCost = (numAmount * 52) / 12;
      break;
    case 'monthly':
      monthlyCost = numAmount;
      break;
    case 'yearly':
      monthlyCost = numAmount / 12;
      break;
    default:
      monthlyCost = numAmount;
  }

  return Math.round(monthlyCost * 100) / 100;
};

export const addCycle = (date, billingCycle) => {
  const currentDate = new Date(date);
  const resultDate = new Date(currentDate);

  if (billingCycle === 'weekly') {
    resultDate.setDate(resultDate.getDate() + 7);
    return resultDate;
  }

  if (billingCycle === 'monthly') {
    const originalDay = currentDate.getDate();
    resultDate.setMonth(resultDate.getMonth() + 1);

    if (resultDate.getDate() !== originalDay) {
      resultDate.setDate(0);
    }
    return resultDate;
  }

  if (billingCycle === 'yearly') {
    const originalDay = currentDate.getDate();
    resultDate.setFullYear(resultDate.getFullYear() + 1);

    if (resultDate.getDate() !== originalDay) {
      resultDate.setDate(0);
    }
    return resultDate;
  }

  return resultDate;
};

export const advanceRenewalDate = (subscription) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextDate = new Date(subscription.nextRenewalDate);
  while (nextDate < today) {
    nextDate = addCycle(nextDate, subscription.billingCycle);
  }

  return nextDate;
};
