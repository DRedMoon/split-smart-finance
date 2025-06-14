
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';
import { FinancialData } from './types';

export const addBill = (bill: Omit<FinancialData['monthlyBills'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const newBill = {
    ...bill,
    id: Date.now() + Math.random()
  };
  
  data.monthlyBills = data.monthlyBills || [];
  data.monthlyBills.push(newBill);
  saveFinancialData(data);
};

export const updateBill = (billId: number, updates: Partial<FinancialData['monthlyBills'][0]>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (data.monthlyBills) {
    const billIndex = data.monthlyBills.findIndex(b => b.id === billId);
    if (billIndex !== -1) {
      data.monthlyBills[billIndex] = { ...data.monthlyBills[billIndex], ...updates };
      saveFinancialData(data);
    }
  }
};

export const deleteBill = (billId: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (data.monthlyBills) {
    data.monthlyBills = data.monthlyBills.filter(b => b.id !== billId);
    saveFinancialData(data);
  }
};
