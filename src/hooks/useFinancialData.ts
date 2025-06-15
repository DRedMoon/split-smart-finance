import { useState, useEffect } from 'react';
import { loadFinancialData, saveFinancialData } from '@/services/dataService';
import { getThisWeekUpcomingPayments } from '@/services/storageService';

export const useFinancialData = (refreshKey: number) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const financialData = loadFinancialData();
    setData(financialData);
  }, [refreshKey]);

  // Safe data loading with fallbacks
  const baseBalance = data?.balance || 0;
  const loans = data?.loans || [];
  const allTransactions = data?.transactions || [];
  const monthlyBills = data?.monthlyBills || [];

  // Calculate the actual balance by including all transactions
  // This should be the ACTUAL current balance: base + transactions
  const transactionSum = allTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = baseBalance + transactionSum;

  console.log('Balance calculation:', {
    baseBalance,
    transactionSum,
    totalBalance: balance,
    transactionCount: allTransactions.length
  });

  // Enhanced recent transactions logic - ONLY show paid bills and regular transactions
  const recentTransactions = [];
  
  // Add ALL regular transactions (income and expenses that are NOT bill payments)
  const regularTransactions = allTransactions.filter(transaction => {
    // Check if this transaction corresponds to a bill
    const correspondingBill = monthlyBills.find(bill => 
      bill.name === transaction.name && 
      Math.abs(bill.amount) === Math.abs(transaction.amount)
    );
    
    // If there's a corresponding bill, only show the transaction if the bill is paid
    if (correspondingBill) {
      console.log('Found corresponding bill for transaction:', transaction.name, 'Bill paid:', correspondingBill.paid);
      return correspondingBill.paid === true;
    }
    
    // If no corresponding bill, it's a regular transaction (paycheck, food, entertainment, etc.)
    return true;
  });
  
  recentTransactions.push(...regularTransactions);
  
  // Sort by date and time - newest first
  const sortedRecentTransactions = recentTransactions
    .sort((a, b) => {
      // First sort by date, then by ID (creation time) for same dates
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison === 0) {
        // If dates are the same, sort by ID (newer IDs first)
        return (b.id || 0) - (a.id || 0);
      }
      return dateComparison;
    })
    .slice(0, 15);

  console.log('Final sorted recent transactions (paid bills only):', sortedRecentTransactions);

  const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.currentAmount || 0), 0);
  const totalMonthlyPayments = loans.reduce((sum, loan) => sum + (loan.monthly || 0), 0);
  const totalBillsAmount = monthlyBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

  // Get this week's upcoming payments with error handling
  let thisWeekPayments = [];
  try {
    thisWeekPayments = getThisWeekUpcomingPayments();
  } catch (error) {
    console.error('Error getting upcoming payments:', error);
  }

  const filteredWeekPayments = thisWeekPayments.filter(bill => 
    bill.type !== 'laina' && 
    bill.type !== 'luottokortti' && 
    bill.type !== 'loan_payment' && 
    bill.type !== 'credit_payment'
  );

  return {
    balance,
    loans,
    monthlyBills,
    totalLoanAmount,
    totalMonthlyPayments,
    totalBillsAmount,
    sortedRecentTransactions,
    filteredWeekPayments
  };
};
