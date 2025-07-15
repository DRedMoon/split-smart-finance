
import { FinancialData } from './types';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'financial-data';

export const saveFinancialData = (data: FinancialData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    toast({
      title: "Save Error",
      description: "Failed to save financial data. Please try again.",
      variant: "destructive",
    });
  }
};

export const loadFinancialData = (): FinancialData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    toast({
      title: "Load Error",
      description: "Failed to load financial data. Using default settings.",
      variant: "destructive",
    });
    return null;
  }
};

export const getDefaultFinancialData = (): FinancialData => ({
  balance: 0,
  loans: [],
  monthlyBills: [],
  transactions: [],
  categories: [],
  profile: {
    name: 'Käyttäjä',
    email: 'user@example.com'
  },
  settings: {
    backupFrequency: 'weekly',
    errorReporting: false,
    analytics: false,
    theme: 'dark',
    fontSize: 'medium',
    highContrast: false,
    notifications: {
      upcomingPayments: true,
      backupReminders: true,
      lowBalance: false,
      monthlyReport: false,
      paymentDays: 3,
      backupDays: 7,
      balanceThreshold: 100
    }
  }
});

// Clear all data and reset to default - COMPLETELY CLEAR EVERYTHING
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    const defaultData = getDefaultFinancialData();
    saveFinancialData(defaultData);
  } catch (error) {
    toast({
      title: "Clear Data Error",
      description: "Failed to clear all data. Please try again.",
      variant: "destructive",
    });
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
