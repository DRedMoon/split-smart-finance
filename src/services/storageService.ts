
// Re-export all services from modular files
export * from './types';
export * from './dataService';
export * from './calculationService';
export * from './transactionService';
export * from './loanService';
export * from './billService';

// Import necessary functions with safer imports
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';
import { addTransaction } from './transactionService';
import { addBill } from './billService';
import { FinancialData } from './types';

// Add missing functions
export const addIncome = (income: Omit<FinancialData['transactions'][0], 'id'>): void => {
  try {
    addTransaction(income);
  } catch (error) {
    console.error('Error adding income:', error);
  }
};

export const addMonthlyBill = (bill: Omit<FinancialData['monthlyBills'][0], 'id'>): void => {
  try {
    addBill(bill);
  } catch (error) {
    console.error('Error adding monthly bill:', error);
  }
};

// Store error reports locally
export const logError = (error: Error, context?: string): void => {
  try {
    const data = loadFinancialData() || getDefaultFinancialData();
    
    if (data.settings?.errorReporting) {
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
  } catch (err) {
    console.error('Error logging error:', err);
  }
};

// Store analytics locally
export const logAnalytics = (event: string, data?: any): void => {
  try {
    const financialData = loadFinancialData() || getDefaultFinancialData();
    
    if (financialData.settings?.analytics) {
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
  } catch (error) {
    console.error('Error logging analytics:', error);
  }
};

// Automatic backup function
export const performAutomaticBackup = (): void => {
  try {
    const data = loadFinancialData();
    if (!data) return;
    
    const lastBackup = localStorage.getItem('last-backup');
    const now = new Date();
    const shouldBackup = !lastBackup || (() => {
      const lastBackupDate = new Date(lastBackup);
      const daysDiff = (now.getTime() - lastBackupDate.getTime()) / (1000 * 3600 * 24);
      
      switch (data.settings?.backupFrequency) {
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
  } catch (error) {
    console.error('Error performing automatic backup:', error);
  }
};

// Add function to update/edit categories
export const updateCategory = (categoryId: number, updates: Partial<FinancialData['categories'][0]>): void => {
  try {
    const data = loadFinancialData() || getDefaultFinancialData();
    if (data.categories) {
      const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
      if (categoryIndex !== -1) {
        data.categories[categoryIndex] = { ...data.categories[categoryIndex], ...updates };
        saveFinancialData(data);
      }
    }
  } catch (error) {
    console.error('Error updating category:', error);
  }
};

export const deleteCategory = (categoryId: number): void => {
  try {
    const data = loadFinancialData() || getDefaultFinancialData();
    if (data.categories) {
      data.categories = data.categories.filter(cat => cat.id !== categoryId);
      saveFinancialData(data);
    }
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

// Get this week's upcoming payments with proper error handling
export const getThisWeekUpcomingPayments = () => {
  try {
    const data = loadFinancialData();
    if (!data?.monthlyBills) return [];

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return data.monthlyBills.filter(bill => {
      if (bill.paid) return false;
      
      // Parse due date (assuming format like "15th", "1st", etc.)
      const dayMatch = bill.dueDate?.match(/\d+/);
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
      
      return dueDate >= today && dueDate <= nextWeek;
    });
  } catch (error) {
    console.error('Error getting this week upcoming payments:', error);
    return [];
  }
};
