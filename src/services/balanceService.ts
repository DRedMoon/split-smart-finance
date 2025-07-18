import { FinancialData } from './types';

/**
 * Centralized balance calculation service
 * Ensures consistent balance calculation across the entire application
 */

export const calculateBalance = (data: FinancialData | null): number => {
  if (!data) return 0;
  
  const baseBalance = data.balance || 0;
  const allTransactions = data.transactions || [];
  const monthlyBills = data.monthlyBills || [];
  
  // Calculate regular transactions (non-recurring)
  const regularTransactions = allTransactions.filter(transaction => {
    // Check if this transaction corresponds to a recurring payment
    const correspondingBill = monthlyBills.find(bill => 
      bill.name === transaction.name && Math.abs(bill.amount) === Math.abs(transaction.amount)
    );
    
    // Only include transactions that don't have corresponding bills (i.e., regular transactions)
    return !correspondingBill;
  });
  
  // Sum regular transactions only to avoid double-counting monthly bills
  const regularTransactionSum = regularTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const finalBalance = baseBalance + regularTransactionSum;
  
  console.log('🏦 Balance calculation:', {
    baseBalance,
    regularTransactionSum,
    finalBalance,
    totalTransactions: allTransactions.length,
    regularTransactions: regularTransactions.length
  });
  
  return finalBalance;
};

/**
 * Calculate balance for payment validation
 * Uses the same logic as display balance to ensure consistency
 */
export const calculateBalanceForValidation = (data: FinancialData | null): number => {
  return calculateBalance(data);
};

/**
 * Calculate balance including pending transactions (for advanced scenarios)
 */
export const calculateBalanceWithPendingTransactions = (data: FinancialData | null, pendingAmount: number = 0): number => {
  const currentBalance = calculateBalance(data);
  return currentBalance + pendingAmount;
};