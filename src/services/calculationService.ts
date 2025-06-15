
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

// Calculate interest rate from payment schedule (reverse engineering)
export const calculateInterestFromPayments = (
  principal: number,
  monthlyPayment: number,
  managementFee: number,
  termMonths: number
): { yearlyRate: number; euriborEstimate: number; marginEstimate: number } => {
  const actualPayment = monthlyPayment - managementFee;
  
  // Use Newton-Raphson method to find the monthly interest rate
  let monthlyRate = 0.005; // Initial guess (6% annual)
  const tolerance = 0.0001;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    // Present value of annuity formula
    const pv = actualPayment * ((1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate);
    const derivative = actualPayment * (
      (termMonths * Math.pow(1 + monthlyRate, -termMonths - 1)) / monthlyRate -
      ((1 - Math.pow(1 + monthlyRate, -termMonths)) / (monthlyRate * monthlyRate))
    );
    
    const newRate = monthlyRate - (pv - principal) / derivative;
    
    if (Math.abs(newRate - monthlyRate) < tolerance) {
      break;
    }
    monthlyRate = Math.max(0, newRate); // Ensure positive rate
  }
  
  const yearlyRate = monthlyRate * 12 * 100;
  
  // Estimate Euribor (current market rate ~3.5-4%)
  const currentEuribor = 3.75;
  const marginEstimate = Math.max(0, yearlyRate - currentEuribor);
  
  return {
    yearlyRate: yearlyRate,
    euriborEstimate: currentEuribor,
    marginEstimate: marginEstimate
  };
};

// Calculate amortization schedule
export const calculateAmortizationSchedule = (
  principal: number,
  yearlyRate: number,
  managementFee: number,
  termMonths: number
): Array<{
  month: number;
  principalPayment: number;
  interestPayment: number;
  managementFee: number;
  totalPayment: number;
  remainingBalance: number;
}> => {
  const monthlyRate = yearlyRate / 12 / 100;
  const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                        (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  const schedule = [];
  let remainingBalance = principal;
  
  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    remainingBalance -= principalPayment;
    
    // Ensure we don't go negative on the last payment
    if (remainingBalance < 0) {
      const adjustment = Math.abs(remainingBalance);
      remainingBalance = 0;
    }
    
    schedule.push({
      month,
      principalPayment: Math.round(principalPayment * 100) / 100,
      interestPayment: Math.round(interestPayment * 100) / 100,
      managementFee: managementFee,
      totalPayment: Math.round((monthlyPayment + managementFee) * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100
    });
  }
  
  return schedule;
};
