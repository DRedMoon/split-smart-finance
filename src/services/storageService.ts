// Re-export all services from modular files
export * from './types';
export * from './dataService';
export * from './calculationService';
export * from './transactionService';
export * from './loanService';
export * from './billService';

// Keep legacy functions for backward compatibility
import { exportFinancialData as exportData, importFinancialData as importData, loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';

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

// Import necessary functions
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';

// Add function to update/edit categories
export const updateCategory = (categoryId: number, updates: Partial<FinancialData['categories'][0]>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (data.categories) {
    const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex !== -1) {
      data.categories[categoryIndex] = { ...data.categories[categoryIndex], ...updates };
      saveFinancialData(data);
    }
  }
};

export const deleteCategory = (categoryId: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (data.categories) {
    data.categories = data.categories.filter(cat => cat.id !== categoryId);
    saveFinancialData(data);
  }
};
