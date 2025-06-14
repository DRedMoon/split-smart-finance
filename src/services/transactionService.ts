
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';
import { FinancialData } from './types';

export const addTransaction = (transaction: Omit<FinancialData['transactions'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const newTransaction = {
    ...transaction,
    id: Date.now() + Math.random()
  };
  
  data.transactions = data.transactions || [];
  data.transactions.push(newTransaction);
  saveFinancialData(data);
};

export const updateTransaction = (transactionId: number, updates: Partial<FinancialData['transactions'][0]>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (data.transactions) {
    const transactionIndex = data.transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex !== -1) {
      data.transactions[transactionIndex] = { ...data.transactions[transactionIndex], ...updates };
      saveFinancialData(data);
    }
  }
};

export const deleteTransaction = (transactionId: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (data.transactions) {
    data.transactions = data.transactions.filter(t => t.id !== transactionId);
    saveFinancialData(data);
  }
};
