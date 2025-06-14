
export const calculateLoanPayment2 = (
  principal: number,
  euriborRate: number,
  personalMargin: number,
  managementFee: number,
  termMonths: number
) => {
  const yearlyRate = euriborRate + personalMargin;
  const monthlyRate = yearlyRate / 12 / 100;
  
  if (monthlyRate === 0) {
    const monthlyPayment = (principal / termMonths) + managementFee;
    return {
      monthlyPayment: monthlyPayment,
      totalPayback: monthlyPayment * termMonths,
      yearlyRate: 0
    };
  }
  
  const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                        (Math.pow(1 + monthlyRate, termMonths) - 1) + managementFee;
  
  return {
    monthlyPayment: monthlyPayment,
    totalPayback: monthlyPayment * termMonths,
    yearlyRate: yearlyRate
  };
};

export const calculateCreditPayment = (
  currentAmount: number,
  yearlyRate: number,
  managementFee: number,
  minimumPercent: number
) => {
  const monthlyRate = yearlyRate / 12 / 100;
  const minimumPayment = Math.max(
    (currentAmount * minimumPercent / 100),
    50 // Minimum €50
  );
  
  const monthlyMinimum = minimumPayment + managementFee;
  
  // Calculate total with interest (assuming minimum payments)
  let balance = currentAmount;
  let totalPaid = 0;
  let months = 0;
  
  while (balance > 1 && months < 600) { // Safety limit
    const interestCharge = balance * monthlyRate;
    const principalPayment = minimumPayment - interestCharge;
    
    if (principalPayment <= 0) break; // Payment doesn't cover interest
    
    balance -= principalPayment;
    totalPaid += monthlyMinimum;
    months++;
  }
  
  return {
    monthlyMinimum: monthlyMinimum,
    totalWithInterest: totalPaid,
    estimatedMonths: months
  };
};
