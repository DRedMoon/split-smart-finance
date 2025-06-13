
// Calculate precise loan payments with EURIBOR
export const calculateLoanPayment = (
  principal: number,
  euriborRate: number,
  personalMargin: number,
  managementFee: number,
  termMonths: number
): { monthlyPayment: number; totalPayback: number; yearlyRate: number } => {
  const yearlyRate = euriborRate + personalMargin;
  const monthlyRate = yearlyRate / 100 / 12;
  
  // Calculate monthly payment using standard loan formula
  const monthlyPrincipalInterest = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  const monthlyPayment = monthlyPrincipalInterest + managementFee;
  const totalPayback = (monthlyPayment * termMonths);
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayback: Math.round(totalPayback * 100) / 100,
    yearlyRate
  };
};

// Improved precise loan calculation
export const calculateLoanPayment2 = (
  principal: number,
  euriborRate: number,
  personalMargin: number,
  managementFee: number,
  termMonths: number
): { monthlyPayment: number; totalPayback: number; yearlyRate: number; monthlyPrincipalAndInterest: number } => {
  const yearlyRate = euriborRate + personalMargin;
  const monthlyRate = yearlyRate / 100 / 12;
  
  // Use the standard amortization formula
  let monthlyPrincipalInterest;
  
  if (monthlyRate === 0) {
    monthlyPrincipalInterest = principal / termMonths;
  } else {
    monthlyPrincipalInterest = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }
  
  const monthlyPayment = monthlyPrincipalInterest + managementFee;
  const totalPayback = monthlyPayment * termMonths;
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayback: Math.round(totalPayback * 100) / 100,
    yearlyRate: Math.round(yearlyRate * 100) / 100,
    monthlyPrincipalAndInterest: Math.round(monthlyPrincipalInterest * 100) / 100
  };
};

// Calculate credit card payments
export const calculateCreditPayment = (
  principal: number,
  yearlyRate: number,
  managementFee: number,
  minimumPercent: number = 3
): { monthlyMinimum: number; totalWithInterest: number } => {
  const monthlyRate = yearlyRate / 100 / 12;
  const interest = principal * monthlyRate;
  const minimumPayment = Math.max(principal * (minimumPercent / 100), 25); // Minimum 25€
  const monthlyMinimum = minimumPayment + managementFee;
  
  // Estimate total payback (simplified calculation)
  const totalWithInterest = principal * (1 + (yearlyRate / 100) * 2); // Rough estimate
  
  return {
    monthlyMinimum: Math.round(monthlyMinimum * 100) / 100,
    totalWithInterest: Math.round(totalWithInterest * 100) / 100
  };
};

// Enhanced loan calculation with alternative input methods
export const calculateLoanFromPaymentDetails = (
  loanRepayment: number,
  interest: number,
  managementFee: number,
  remainingLoanAmount: number
): { 
  monthlyTotal: number; 
  interestRate: number; 
  estimatedMonthsLeft: number;
  totalPaybackEstimate: number;
} => {
  const monthlyTotal = loanRepayment + interest + managementFee;
  
  // Calculate interest rate from payment details
  const monthlyInterestRate = interest / remainingLoanAmount;
  const yearlyInterestRate = monthlyInterestRate * 12 * 100;
  
  // Estimate months left (simplified calculation)
  const estimatedMonthsLeft = Math.ceil(remainingLoanAmount / loanRepayment);
  
  // Estimate total payback
  const totalPaybackEstimate = monthlyTotal * estimatedMonthsLeft;
  
  return {
    monthlyTotal: Math.round(monthlyTotal * 100) / 100,
    interestRate: Math.round(yearlyInterestRate * 100) / 100,
    estimatedMonthsLeft,
    totalPaybackEstimate: Math.round(totalPaybackEstimate * 100) / 100
  };
};
