
import { FinancialData } from './types';

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
    console.error('Error clearing data:', error);
  }
};
