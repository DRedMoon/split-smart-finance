
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

  // Recent transactions logic - Show ONLY:
  // 1. Regular transactions (non-recurring)
  // 2. Recurring payments that are marked as PAID
  const recentTransactionsFromRegular = allTransactions.filter(transaction => {
    // Check if this transaction corresponds to a recurring payment
    const correspondingBill = monthlyBills.find(bill => 
      bill.name === transaction.name && Math.abs(bill.amount) === Math.abs(transaction.amount)
    );
    
    // If no corresponding bill, it's a regular transaction - show it
    if (!correspondingBill) {
      return true;
    }
    
    // If there's a corresponding bill, only show if the bill is paid
    return correspondingBill.paid;
  });

  // Add paid monthly bills as negative transactions (expenses)
  const paidBillTransactions = monthlyBills
    .filter(bill => bill.paid)
    .map(bill => ({
      id: `bill-${bill.id}`,
      name: bill.name,
      amount: -bill.amount, // Bills are expenses, so negative
      date: new Date().toISOString().split('T')[0], // Today's date when paid
      type: 'expense',
      category: bill.type || 'bill'
    }));

  // Combine and sort all recent transactions
  const allRecentTransactions = [...recentTransactionsFromRegular, ...paidBillTransactions];
  
  const sortedRecentTransactions = allRecentTransactions
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
