import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from './dataService';
import { FinancialData } from './types';

export interface Category {
  id: number;
  name: string;
  englishKey: string;
  description: string;
  color: string;
  isMaintenanceCharge: boolean;
  isHousingCompanyExpenditure: boolean;
  isMonthlyPayment: boolean;
  requiresDueDate: boolean;
  isLoanPayment?: boolean;
  createdAt: string;
  isDefault?: boolean;
}

// Default categories with both Finnish names and English keys
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Ruoka', englishKey: 'food', color: '#FF6B6B', description: 'Food and dining', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true },
  { id: 2, name: 'Liikenne', englishKey: 'transport', color: '#4ECDC4', description: 'Transport and travel', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true },
  { id: 3, name: 'Viihde', englishKey: 'entertainment', color: '#45B7D1', description: 'Entertainment', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true },
  { id: 4, name: 'Lasku', englishKey: 'bill', color: '#96CEB4', description: 'Bills and utilities', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: true, createdAt: '2024-01-01', isDefault: true },
  { id: 5, name: 'Vakuutus', englishKey: 'insurance', color: '#FFEAA7', description: 'Insurance', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: true, createdAt: '2024-01-01', isDefault: true },
  { id: 6, name: 'Tilaus', englishKey: 'subscription', color: '#DDA0DD', description: 'Subscriptions', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: true, createdAt: '2024-01-01', isDefault: true },
  { id: 7, name: 'Muu', englishKey: 'other', color: '#F7DC6F', description: 'Other expenses', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true },
  { id: 8, name: 'Lainan lyhennys', englishKey: 'loan_repayment', color: '#85C1E9', description: 'Loan repayment', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: false, isLoanPayment: true, createdAt: '2024-01-01', isDefault: true },
  { id: 9, name: 'Luottokorttiostos', englishKey: 'credit_purchase', color: '#F8C471', description: 'Credit card purchase', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true },
  { id: 10, name: 'Luottokortin maksu', englishKey: 'credit_repayment', color: '#82E0AA', description: 'Credit card payment', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true },
  { id: 11, name: 'Hoitovastike', englishKey: 'maintenance_charge', color: '#D7BDE2', description: 'Maintenance charge', isMaintenanceCharge: true, isHousingCompanyExpenditure: false, isMonthlyPayment: true, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true },
  { id: 12, name: 'Taloyhtiön meno', englishKey: 'housing_company_expenditure', color: '#A9DFBF', description: 'Housing company expenditure', isMaintenanceCharge: false, isHousingCompanyExpenditure: true, isMonthlyPayment: false, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true },
  { id: 13, name: 'Kuukausimaksu', englishKey: 'monthly_payment', color: '#F9E79F', description: 'Monthly payment', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: true, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true },
  { id: 14, name: 'Palkka', englishKey: 'paycheck', color: '#98FB98', description: 'Paycheck income', isMaintenanceCharge: false, isHousingCompanyExpenditure: false, isMonthlyPayment: false, requiresDueDate: false, createdAt: '2024-01-01', isDefault: true }
];

export const getAllCategories = (): Category[] => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const customCategories = data.categories || [];
  
  // Convert custom categories to the new format if needed
  const formattedCustomCategories = customCategories.map(cat => ({
    ...cat,
    englishKey: cat.name.toLowerCase().replace(/\s+/g, '_'),
    isDefault: false,
    requiresDueDate: cat.requiresDueDate || false
  }));
  
  return [...DEFAULT_CATEGORIES, ...formattedCustomCategories];
};

export const getCategoryByName = (name: string): Category | undefined => {
  const categories = getAllCategories();
  return categories.find(cat => cat.name === name);
};

export const getCategoryByKey = (key: string): Category | undefined => {
  const categories = getAllCategories();
  return categories.find(cat => cat.englishKey === key);
};

export const isLoanPaymentCategory = (categoryNameOrKey: string): boolean => {
  const category = getCategoryByName(categoryNameOrKey) || getCategoryByKey(categoryNameOrKey);
  return category?.isLoanPayment || false;
};

export const requiresDueDate = (categoryNameOrKey: string): boolean => {
  const category = getCategoryByName(categoryNameOrKey) || getCategoryByKey(categoryNameOrKey);
  return category?.requiresDueDate || false;
};

export const addCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'isDefault'>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (!data.categories) data.categories = [];
  
  const newCategory = {
    ...categoryData,
    id: Date.now() + Math.random(),
    createdAt: new Date().toISOString(),
    isDefault: false
  };
  
  data.categories.push(newCategory);
  saveFinancialData(data);
};

export const updateCategory = (categoryId: number, updates: Partial<Category>): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (!data.categories) data.categories = [];
  
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  if (categoryIndex !== -1) {
    data.categories[categoryIndex] = { ...data.categories[categoryIndex], ...updates };
    saveFinancialData(data);
  }
};

export const deleteCategory = (categoryId: number): void => {
  const data = loadFinancialData() || getDefaultFinancialData();
  if (!data.categories) return;
  
  data.categories = data.categories.filter(cat => cat.id !== categoryId);
  saveFinancialData(data);
};

export const getDefaultCategories = (): Category[] => {
  return DEFAULT_CATEGORIES;
};

export const getCustomCategories = (): Category[] => {
  const data = loadFinancialData() || getDefaultFinancialData();
  const customCategories = data.categories || [];
  
  // Convert to the new format
  return customCategories.map(cat => ({
    ...cat,
    englishKey: cat.name.toLowerCase().replace(/\s+/g, '_'),
    isDefault: false,
    requiresDueDate: cat.requiresDueDate || false
  }));
};