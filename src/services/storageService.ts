
export interface FinancialData {
  balance: number;
  loans: Array<{
    id: number;
    name: string;
    totalAmount: number;
    currentAmount: number;
    monthly: number;
    rate: number;
    remaining: string;
    dueDate: string;
    lastPayment: string;
  }>;
  monthlyBills: Array<{
    id: number;
    name: string;
    amount: number;
    dueDate: string;
    type: string;
    paid?: boolean;
  }>;
  transactions: Array<{
    id: number;
    name: string;
    amount: number;
    date: string;
    type: string;
    category: string;
  }>;
}

const STORAGE_KEY = 'financial-data';

export const saveFinancialData = (data: FinancialData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving financial data:', error);
  }
};

export const loadFinancialData = (): FinancialData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading financial data:', error);
    return null;
  }
};

export const exportFinancialData = (): void => {
  const data = loadFinancialData();
  if (data) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const getDefaultFinancialData = (): FinancialData => ({
  balance: 0,
  loans: [],
  monthlyBills: [],
  transactions: []
});

// Utility functions to update financial data
export const addTransaction = (transaction: Omit<FinancialData['transactions'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const newTransaction = {
    ...transaction,
    id: Date.now() + Math.random()
  };
  data.transactions.unshift(newTransaction);
  
  // Update balance if it's income or expense
  if (transaction.type === 'income') {
    data.balance += transaction.amount;
  } else if (transaction.type === 'expense') {
    data.balance += transaction.amount; // amount is already negative
  }
  
  saveFinancialData(data);
};

export const addLoan = (loan: Omit<FinancialData['loans'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const newLoan = {
    ...loan,
    id: Date.now() + Math.random()
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

export const addMonthlyBill = (bill: Omit<FinancialData['monthlyBills'][0], 'id'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const newBill = {
    ...bill,
    id: Date.now() + Math.random()
  };
  data.monthlyBills.push(newBill);
  saveFinancialData(data);
};

export const updateTransaction = (id: number, updates: Partial<FinancialData['transactions'][0]>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const index = data.transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    data.transactions[index] = { ...data.transactions[index], ...updates };
    saveFinancialData(data);
  }
};

export const deleteTransaction = (id: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const transaction = data.transactions.find(t => t.id === id);
  if (transaction) {
    // Reverse balance change
    if (transaction.type === 'income') {
      data.balance -= transaction.amount;
    } else if (transaction.type === 'expense') {
      data.balance -= transaction.amount; // amount is already negative
    }
    data.transactions = data.transactions.filter(t => t.id !== id);
    saveFinancialData(data);
  }
};
