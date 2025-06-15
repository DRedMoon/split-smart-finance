
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';
import { addBill } from './billService';
import { FinancialData } from './types';

export const addLoan = (loan: Omit<FinancialData['loans'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  
  const newLoan = {
    ...loan,
    id: Date.now()
  };
  
  data.loans.push(newLoan);
  
  // Create monthly payment bill with proper categorization for separation
  const isCredit = loan.remaining === 'Credit Card';
  const billType = isCredit ? 'credit_payment' : 'loan_payment';
  const billCategory = isCredit ? 'Credit Card' : 'Loan';
  
  const billData = {
    name: loan.name,
    amount: loan.monthly,
    dueDate: loan.dueDate,
    type: billType,
    paid: false,
    category: billCategory
  };
  
  console.log('LoanService - Creating monthly bill:', billData);
  
  addBill(billData);
  
  saveFinancialData(data);
  
  // Trigger financial data update event
  window.dispatchEvent(new CustomEvent('financial-data-updated'));
};

export const updateLoan = (loanId: number, updates: Partial<FinancialData['loans'][0]>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const loanIndex = data.loans.findIndex(loan => loan.id === loanId);
  
  if (loanIndex !== -1) {
    const oldLoan = data.loans[loanIndex];
    data.loans[loanIndex] = { ...oldLoan, ...updates };
    
    // Update corresponding monthly bill if it exists
    const billIndex = data.monthlyBills.findIndex(bill => bill.name === oldLoan.name);
    if (billIndex !== -1) {
      const isCredit = (updates.remaining || oldLoan.remaining) === 'Credit Card';
      data.monthlyBills[billIndex] = {
        ...data.monthlyBills[billIndex],
        name: updates.name || oldLoan.name,
        amount: updates.monthly || oldLoan.monthly,
        dueDate: updates.dueDate || oldLoan.dueDate,
        type: isCredit ? 'credit_payment' : 'loan_payment',
        category: isCredit ? 'Credit Card' : 'Loan'
      };
    }
    
    saveFinancialData(data);
    window.dispatchEvent(new CustomEvent('financial-data-updated'));
  }
};

export const deleteLoan = (loanId: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const loan = data.loans.find(l => l.id === loanId);
  
  if (loan) {
    // Remove loan
    data.loans = data.loans.filter(l => l.id !== loanId);
    
    // Remove corresponding monthly bill
    data.monthlyBills = data.monthlyBills.filter(bill => bill.name !== loan.name);
    
    saveFinancialData(data);
    window.dispatchEvent(new CustomEvent('financial-data-updated'));
  }
};
