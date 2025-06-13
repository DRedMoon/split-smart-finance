export interface FinancialData {
  balance: number;
  loans: Array<{
    id: number;
    name: string;
    totalAmount: number;
    currentAmount: number;
    monthly: number;
    rate: number;
    euriborRate?: number;
    personalMargin?: number;
    managementFee?: number;
    remaining: string;
    dueDate: string;
    lastPayment: string;
    totalPayback: number; // Total amount to pay back including interest
    yearlyInterestRate: number;
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
  profile: {
    name: string;
    email: string;
    profilePicture?: string;
  };
  settings: {
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupPassword?: string;
    errorReporting: boolean;
    analytics: boolean;
    theme: 'light' | 'dark';
    fontSize: 'small' | 'medium' | 'large';
  };
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

export const exportFinancialData = (password?: string): void => {
  const data = loadFinancialData();
  if (data) {
    let dataToExport = data;
    
    if (password) {
      // Simple encryption for demo - in production use proper encryption
      dataToExport = {
        ...data,
        encrypted: true,
        password: btoa(password) // Base64 encoding for demo
      } as any;
    }
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const importFinancialData = (file: File, password?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target?.result as string);
        
        if (data.encrypted && password) {
          if (data.password !== btoa(password)) {
            reject(new Error('Invalid password'));
            return;
          }
          delete data.encrypted;
          delete data.password;
        }
        
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
  transactions: [],
  profile: {
    name: 'Käyttäjä',
    email: 'user@example.com'
  },
  settings: {
    backupFrequency: 'weekly',
    errorReporting: false,
    analytics: false,
    theme: 'dark',
    fontSize: 'medium'
  }
});

// Clear all data and reset to default - COMPLETELY CLEAR EVERYTHING
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    const defaultData = getDefaultFinancialData();
    saveFinancialData(defaultData);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
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

// Calculate precise loan payments with EURIBOR
export const calculateLoanPayment = (
  principal: number,
  euriborRate: number,
  personalMargin: number,
  managementFee: number,
  termMonths: number
): { monthlyPayment: number; totalPayback: number; yearlyRate: number } => {
  const yearlyRate = euriborRate + personalMargin;
  const monthlyRate = yearlyRate / 100 / 12;
  
  // Calculate monthly payment using standard loan formula
  const monthlyPrincipalInterest = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  const monthlyPayment = monthlyPrincipalInterest + managementFee;
  const totalPayback = (monthlyPayment * termMonths);
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayback: Math.round(totalPayback * 100) / 100,
    yearlyRate
  };
};

// Calculate credit card payments
export const calculateCreditPayment = (
  principal: number,
  yearlyRate: number,
  managementFee: number,
  minimumPercent: number = 3
): { monthlyMinimum: number; totalWithInterest: number } => {
  const monthlyRate = yearlyRate / 100 / 12;
  const interest = principal * monthlyRate;
  const minimumPayment = Math.max(principal * (minimumPercent / 100), 25); // Minimum 25€
  const monthlyMinimum = minimumPayment + managementFee;
  
  // Estimate total payback (simplified calculation)
  const totalWithInterest = principal * (1 + (yearlyRate / 100) * 2); // Rough estimate
  
  return {
    monthlyMinimum: Math.round(monthlyMinimum * 100) / 100,
    totalWithInterest: Math.round(totalWithInterest * 100) / 100
  };
};

// Store error reports locally
export const logError = (error: Error, context?: string): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  
  if (data.settings.errorReporting) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('error-logs') || '[]');
    existingLogs.push(errorLog);
    localStorage.setItem('error-logs', JSON.stringify(existingLogs));
  }
};

// Store analytics locally
export const logAnalytics = (event: string, data?: any): void => {
  const financialData = loadFinancialData() || getDefaultFinancialData();
  
  if (financialData.settings.analytics) {
    const analyticsEvent = {
      timestamp: new Date().toISOString(),
      event,
      data,
      page: window.location.pathname
    };
    
    const existingAnalytics = JSON.parse(localStorage.getItem('analytics-logs') || '[]');
    existingAnalytics.push(analyticsEvent);
    localStorage.setItem('analytics-logs', JSON.stringify(existingAnalytics));
  }
};

// Automatic backup function
export const performAutomaticBackup = (): void => {
  const data = loadFinancialData();
  if (!data) return;
  
  const lastBackup = localStorage.getItem('last-backup');
  const now = new Date();
  const shouldBackup = !lastBackup || (() => {
    const lastBackupDate = new Date(lastBackup);
    const daysDiff = (now.getTime() - lastBackupDate.getTime()) / (1000 * 3600 * 24);
    
    switch (data.settings.backupFrequency) {
      case 'daily': return daysDiff >= 1;
      case 'weekly': return daysDiff >= 7;
      case 'monthly': return daysDiff >= 30;
      default: return false;
    }
  })();
  
  if (shouldBackup) {
    const backupData = {
      ...data,
      backupDate: now.toISOString()
    };
    
    localStorage.setItem('auto-backup', JSON.stringify(backupData));
    localStorage.setItem('last-backup', now.toISOString());
  }
};
