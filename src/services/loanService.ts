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
  
  // Automatically create a monthly payment bill for ALL loans and credits
  const billType = loan.remaining === 'Credit Card' ? 'credit_payment' : 'loan_payment';
  const billCategory = loan.remaining === 'Credit Card' ? 'Credit Card' : 'Loan';
  
  // Create bill with all necessary properties - this should work for ALL loan types
  const billData = {
    name: loan.name,
    amount: loan.monthly,
    dueDate: loan.dueDate,
    type: billType,
    paid: false,
    category: billCategory
  };
  
  console.log('Creating monthly bill for loan:', billData); // Debug log
  
  addBill(billData);
  
  saveFinancialData(data);
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
      data.monthlyBills[billIndex] = {
        ...data.monthlyBills[billIndex],
        name: updates.name || oldLoan.name,
        amount: updates.monthly || oldLoan.monthly,
        dueDate: updates.dueDate || oldLoan.dueDate
      };
    }
    
    saveFinancialData(data);
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
  }
};
