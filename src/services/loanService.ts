
import { FinancialData } from './types';
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';
import { calculateLoanPayment } from './calculationService';

export const addLoan = (loan: Omit<FinancialData['loans'][0], 'id' | 'totalPayback' | 'yearlyInterestRate'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  
  // Calculate precise payments if rates are provided
  let totalPayback = loan.totalAmount;
  let yearlyInterestRate = loan.rate;
  
  if (loan.euriborRate !== undefined && loan.personalMargin !== undefined) {
    const termMonths = parseInt(loan.remaining.match(/\d+/)?.[0] || '12');
    const calculation = calculateLoanPayment(
      loan.totalAmount,
      loan.euriborRate,
      loan.personalMargin,
      loan.managementFee || 0,
      termMonths
    );
    totalPayback = calculation.totalPayback;
    yearlyInterestRate = calculation.yearlyRate;
  }
  
  const newLoan = {
    ...loan,
    id: Date.now() + Math.random(),
    totalPayback,
    yearlyInterestRate
  };
  
  data.loans.push(newLoan);
  
  // Add to monthly bills
  const monthlyBill = {
    id: Date.now() + Math.random() + 1,
    name: loan.name,
    amount: loan.monthly,
    dueDate: loan.dueDate,
    type: 'laina',
    paid: false
  };
  data.monthlyBills.push(monthlyBill);
  
  saveFinancialData(data);
};

// Pay loan installment - reduces current loan amount
export const payLoanInstallment = (loanId: number, paymentAmount: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const loanIndex = data.loans.findIndex(l => l.id === loanId);
  
  if (loanIndex !== -1) {
    data.loans[loanIndex].currentAmount = Math.max(0, data.loans[loanIndex].currentAmount - paymentAmount);
    
    // Add transaction for the payment
    const transaction = {
      id: Date.now() + Math.random(),
      name: `${data.loans[loanIndex].name} - Maksu`,
      amount: -paymentAmount,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: 'loan_payment'
    };
    
    data.transactions.unshift(transaction);
    data.balance -= paymentAmount;
    
    saveFinancialData(data);
  }
};

// Add function to process loan repayment with detailed breakdown
export const addLoanRepaymentTransaction = (
  loanId: number, 
  loanRepayment: number, 
  interest: number, 
  managementFee: number
): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const loanIndex = data.loans.findIndex(l => l.id === loanId);
  
  if (loanIndex !== -1) {
    const totalPayment = loanRepayment + interest + managementFee;
    
    // Reduce the current loan amount by the principal payment
    data.loans[loanIndex].currentAmount = Math.max(0, data.loans[loanIndex].currentAmount - loanRepayment);
    
    // Update last payment date
    data.loans[loanIndex].lastPayment = new Date().toISOString().split('T')[0];
    
    // Add transaction for the payment with breakdown
    const transaction = {
      id: Date.now() + Math.random(),
      name: `${data.loans[loanIndex].name} - Lainan lyhennys (${loanRepayment.toFixed(2)}€) + Korko (${interest.toFixed(2)}€) + Hallintamaksu (${managementFee.toFixed(2)}€)`,
      amount: -totalPayment,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: 'loan_payment'
    };
    
    data.transactions.unshift(transaction);
    data.balance -= totalPayment;
    
    saveFinancialData(data);
  }
};

// Add function to handle credit card payments
export const addCreditPaymentTransaction = (
  creditName: string,
  paymentAmount: number,
  creditLimit: number
): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  
  // Find existing credit or create new entry
  let creditIndex = data.loans.findIndex(l => l.name === creditName && l.totalAmount === creditLimit);
  
  if (creditIndex === -1) {
    // Create new credit entry
    const newCredit = {
      id: Date.now() + Math.random(),
      name: creditName,
      totalAmount: creditLimit,
      currentAmount: creditLimit - paymentAmount,
      monthly: paymentAmount,
      rate: 0, // Will be updated if known
      remaining: 'N/A',
      dueDate: '20.',
      lastPayment: new Date().toISOString().split('T')[0],
      totalPayback: creditLimit,
      yearlyInterestRate: 0
    };
    data.loans.push(newCredit);
  } else {
    // Update existing credit
    data.loans[creditIndex].currentAmount = Math.max(0, data.loans[creditIndex].currentAmount - paymentAmount);
    data.loans[creditIndex].lastPayment = new Date().toISOString().split('T')[0];
  }
  
  // Add transaction
  const transaction = {
    id: Date.now() + Math.random(),
    name: `${creditName} - Luottokorttilasku`,
    amount: -paymentAmount,
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: 'credit_payment'
  };
  
  data.transactions.unshift(transaction);
  data.balance -= paymentAmount;
  
  saveFinancialData(data);
};
