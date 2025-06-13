
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

export const importFinancialData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        saveFinancialData(data);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

export const getDefaultFinancialData = (): FinancialData => ({
  balance: 0,
  loans: [],
  monthlyBills: [],
  transactions: []
});

// Clear all data and reset to default
export const clearAllData = (): void => {
  const defaultData = getDefaultFinancialData();
  saveFinancialData(defaultData);
};

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
  
  // Update balance
  data.balance += transaction.amount;
  
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

// Get this week's upcoming payments
export const getThisWeekUpcomingPayments = () => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return data.monthlyBills.filter(bill => {
    if (bill.paid) return false;
    
    // Parse due date (assuming format like "15th", "1st", etc.)
    const dayMatch = bill.dueDate.match(/\d+/);
    if (!dayMatch) return false;
    
    const dueDay = parseInt(dayMatch[0]);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create due date for current month
    const dueDate = new Date(currentYear, currentMonth, dueDay);
    
    // If due date has passed this month, check next month
    if (dueDate < today) {
      dueDate.setMonth(currentMonth + 1);
    }
    
    return dueDate >= today && dueDate <= weekFromNow;
  });
};
