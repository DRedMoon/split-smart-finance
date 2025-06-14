
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';
import { FinancialData } from './types';

export const addLoan = (loan: Omit<FinancialData['loans'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const newLoan = {
    ...loan,
    id: Date.now() + Math.random()
  };
  
  data.loans = data.loans || [];
  data.loans.push(newLoan);
  saveFinancialData(data);
};

export const updateLoan = (loanId: number, updates: Partial<FinancialData['loans'][0]>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (data.loans) {
    const loanIndex = data.loans.findIndex(l => l.id === loanId);
    if (loanIndex !== -1) {
      data.loans[loanIndex] = { ...data.loans[loanIndex], ...updates };
      saveFinancialData(data);
    }
  }
};

export const deleteLoan = (loanId: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (data.loans) {
    data.loans = data.loans.filter(l => l.id !== loanId);
    saveFinancialData(data);
  }
};
