import { FinancialData } from '@/services/storageService';

export const exportToJSON = (data: FinancialData, filename: string = 'financial_data.json') => {
  const exportData = {
    ...data,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: FinancialData, filename: string = 'financial_data.csv') => {
  const csvData = [];
  
  // Add headers
  csvData.push(['Type', 'Name', 'Amount', 'Date', 'Category', 'Description']);
  
  // Add transactions
  if (data.transactions) {
    data.transactions.forEach(transaction => {
      csvData.push([
        transaction.type,
        transaction.name || '',
        transaction.amount.toString(),
        transaction.date,
        transaction.category || '',
        ''
      ]);
    });
  }
  
  // Add monthly bills
  if (data.monthlyBills) {
    data.monthlyBills.forEach(bill => {
      csvData.push([
        'monthly_bill',
        bill.name,
        bill.amount.toString(),
        bill.dueDate,
        bill.type || '',
        ''
      ]);
    });
  }
  
  // Add loans
  if (data.loans) {
    data.loans.forEach(loan => {
      csvData.push([
        'loan',
        loan.name,
        loan.currentAmount.toString(),
        loan.dueDate,
        loan.remaining || '',
        `Monthly: ${loan.monthly}, Total: ${loan.totalAmount}`
      ]);
    });
  }
  
  const csvString = csvData.map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<FinancialData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Validate the imported data structure
        if (!validateImportedData(importedData)) {
          reject(new Error('Invalid file format or corrupted data'));
          return;
        }
        
        // Remove export metadata
        const { exportedAt, version, ...cleanData } = importedData;
        
        resolve(cleanData as FinancialData);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

const validateImportedData = (data: any): boolean => {
  // Basic structure validation
  if (!data || typeof data !== 'object') return false;
  
  // Validate transactions if present
  if (data.transactions && Array.isArray(data.transactions)) {
    for (const transaction of data.transactions) {
      if (!transaction.id || !transaction.amount || !transaction.date || !transaction.type) {
        return false;
      }
    }
  }
  
  // Validate monthly bills if present
  if (data.monthlyBills && Array.isArray(data.monthlyBills)) {
    for (const bill of data.monthlyBills) {
      if (!bill.id || !bill.name || !bill.amount || !bill.dueDate) {
        return false;
      }
    }
  }
  
  // Validate loans if present
  if (data.loans && Array.isArray(data.loans)) {
    for (const loan of data.loans) {
      if (!loan.id || !loan.name || typeof loan.currentAmount !== 'number') {
        return false;
      }
    }
  }
  
  return true;
};

export const mergeImportedData = (existing: FinancialData, imported: FinancialData): FinancialData => {
  // Create a merged dataset, avoiding duplicates based on IDs
  const merged: FinancialData = { ...existing };
  
  // Merge transactions
  if (imported.transactions) {
    const existingIds = new Set(existing.transactions?.map(t => t.id) || []);
    const newTransactions = imported.transactions.filter(t => !existingIds.has(t.id));
    merged.transactions = [...(existing.transactions || []), ...newTransactions];
  }
  
  // Merge monthly bills
  if (imported.monthlyBills) {
    const existingIds = new Set(existing.monthlyBills?.map(b => b.id) || []);
    const newBills = imported.monthlyBills.filter(b => !existingIds.has(b.id));
    merged.monthlyBills = [...(existing.monthlyBills || []), ...newBills];
  }
  
  // Merge loans
  if (imported.loans) {
    const existingIds = new Set(existing.loans?.map(l => l.id) || []);
    const newLoans = imported.loans.filter(l => !existingIds.has(l.id));
    merged.loans = [...(existing.loans || []), ...newLoans];
  }
  
  // Merge categories
  if (imported.categories) {
    const existingIds = new Set(existing.categories?.map(c => c.id) || []);
    const newCategories = imported.categories.filter(c => !existingIds.has(c.id));
    merged.categories = [...(existing.categories || []), ...newCategories];
  }
  
  return merged;
};