
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
    transactionCount: allTransactions.length,
    allTransactions: allTransactions.map(t => ({ name: t.name, amount: t.amount, date: t.date, id: t.id }))
  });

  // Enhanced recent transactions logic - Show all transactions with proper filtering
  const recentTransactions = [];
  
  // Add ALL transactions first (these are the actual financial movements)
  recentTransactions.push(...allTransactions);
  
  // Add paid bills as transactions (these represent money leaving the account)
  const paidBillTransactions = monthlyBills
    .filter(bill => bill.paid === true)
    .map(bill => ({
      id: `bill-${bill.id}`,
      name: bill.name,
      amount: -Math.abs(bill.amount), // Bills are always negative (money out)
      date: new Date().toISOString().split('T')[0], // Today's date when paid
      type: 'bill_payment',
      category: 'Bill Payment'
    }));
  
  recentTransactions.push(...paidBillTransactions);
  
  // Remove duplicates based on name, amount, and date
  const uniqueTransactions = recentTransactions.filter((transaction, index, array) => {
    return index === array.findIndex(t => 
      t.name === transaction.name && 
      Math.abs(t.amount) === Math.abs(transaction.amount) && 
      t.date === transaction.date
    );
  });
  
  // Sort by date and time - newest first, then by ID for same dates
  const sortedRecentTransactions = uniqueTransactions
    .sort((a, b) => {
      // First sort by date
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison === 0) {
        // If dates are the same, sort by ID (newer IDs first)
        const aId = typeof a.id === 'string' ? parseInt(a.id.split('-')[1]) || 0 : a.id || 0;
        const bId = typeof b.id === 'string' ? parseInt(b.id.split('-')[1]) || 0 : b.id || 0;
        return bId - aId;
      }
      return dateComparison;
    })
    .slice(0, 15);

  console.log('Final sorted recent transactions:', sortedRecentTransactions);

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
