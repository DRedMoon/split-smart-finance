
import { FinancialData } from './types';
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';

// Recalculate balance based on transactions
export const recalculateBalance = (): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  
  // Calculate balance from transactions
  const calculatedBalance = data.transactions.reduce((sum, transaction) => {
    return sum + transaction.amount;
  }, 0);
  
  data.balance = calculatedBalance;
  saveFinancialData(data);
};

export const addTransaction = (transaction: Omit<FinancialData['transactions'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const newTransaction = {
    ...transaction,
    id: Date.now() + Math.random()
  };
  data.transactions.unshift(newTransaction);
  
  // Handle credit/loan repayments - reduce loan amounts instead of just affecting balance
  if (transaction.category === 'credit_repayment' || transaction.category === 'loan_repayment') {
    // Find matching loan/credit and reduce its current amount
    const loanIndex = data.loans.findIndex(loan => 
      loan.name.toLowerCase().includes(transaction.name.toLowerCase().split(' - ')[0].toLowerCase())
    );
    
    if (loanIndex !== -1) {
      const paymentAmount = Math.abs(transaction.amount);
      data.loans[loanIndex].currentAmount = Math.max(0, data.loans[loanIndex].currentAmount - paymentAmount);
      data.loans[loanIndex].lastPayment = new Date().toISOString().split('T')[0];
    }
  }
  
  // Update balance
  data.balance += transaction.amount;
  
  saveFinancialData(data);
};

export const addIncome = (income: Omit<FinancialData['transactions'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const newIncome = {
    ...income,
    id: Date.now() + Math.random(),
    type: 'income'
  };
  data.transactions.unshift(newIncome);
  
  // Update balance
  data.balance += income.amount;
  
  saveFinancialData(data);
};

export const updateTransaction = (id: number, updates: Partial<FinancialData['transactions'][0]>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const index = data.transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    const oldTransaction = data.transactions[index];
    data.transactions[index] = { ...oldTransaction, ...updates };
    
    // Recalculate balance
    recalculateBalance();
  }
};

export const deleteTransaction = (id: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const transaction = data.transactions.find(t => t.id === id);
  if (transaction) {
    data.transactions = data.transactions.filter(t => t.id !== id);
    // Recalculate balance after deletion
    recalculateBalance();
  }
};
