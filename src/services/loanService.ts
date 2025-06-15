
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
  
  // Migrate existing bills to ensure proper categorization
  migrateBillCategories(data);
  
  saveFinancialData(data);
  
  // Trigger financial data update event
  window.dispatchEvent(new CustomEvent('financial-data-updated'));
};

// Migration function to fix existing bills without proper categories
const migrateBillCategories = (data: FinancialData): void => {
  if (!data.monthlyBills) return;
  
  let migrationNeeded = false;
  
  data.monthlyBills.forEach(bill => {
    // Find matching loan for this bill
    const matchingLoan = data.loans?.find(loan => loan.name === bill.name);
    
    if (matchingLoan) {
      const isCredit = matchingLoan.remaining === 'Credit Card';
      const correctType = isCredit ? 'credit_payment' : 'loan_payment';
      const correctCategory = isCredit ? 'Credit Card' : 'Loan';
      
      // Update if categorization is missing or incorrect
      if (bill.type !== correctType || bill.category !== correctCategory) {
        bill.type = correctType;
        bill.category = correctCategory;
        migrationNeeded = true;
        console.log('LoanService - Migrated bill:', bill.name, 'to category:', correctCategory);
      }
    }
  });
  
  if (migrationNeeded) {
    console.log('LoanService - Bill categorization migration completed');
  }
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
    
    // Run migration to ensure consistency
    migrateBillCategories(data);
    
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

// Export migration function for standalone use
export const migrateExistingBillCategories = (): void => {
  const data = loadFinancialData();
  if (data) {
    migrateBillCategories(data);
    saveFinancialData(data);
    window.dispatchEvent(new CustomEvent('financial-data-updated'));
  }
};
