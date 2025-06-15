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

  console.log('Monthly bills data:', {
    monthlyBills: monthlyBills.map(b => ({ name: b.name, amount: b.amount, paid: b.paid, id: b.id }))
  });

  // Recent transactions logic - ONLY show actual transactions from the transactions array
  // Do NOT add any bill payments or fake transactions
  const sortedRecentTransactions = allTransactions
    .sort((a, b) => {
      // First sort by date
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison === 0) {
        // If dates are the same, sort by ID (newer IDs first)
        return (b.id || 0) - (a.id || 0);
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
