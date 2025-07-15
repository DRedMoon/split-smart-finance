
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

  // Simplified balance calculation:
  // 1. Start with base balance
  // 2. Add all regular transactions (non-recurring)
  // 3. For recurring payments: balance is adjusted when bill is marked paid/unpaid via PaymentToggleLogic
  // 4. DON'T double-count by adding paid bills here - they're already reflected in baseBalance
  const regularTransactions = allTransactions.filter(transaction => {
    // Check if this transaction corresponds to a recurring payment
    const correspondingBill = monthlyBills.find(bill => 
      bill.name === transaction.name && Math.abs(bill.amount) === Math.abs(transaction.amount)
    );
    
    // Only include transactions that don't have corresponding bills (i.e., regular transactions)
    return !correspondingBill;
  });

  const regularTransactionSum = regularTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = baseBalance + regularTransactionSum;

  console.log('Balance calculation:', {
    baseBalance,
    regularTransactionSum,
    totalBalance: balance,
    regularTransactionCount: regularTransactions.length,
    recurringBillCount: monthlyBills.length
  });

  console.log('Monthly bills data:', {
    monthlyBills: monthlyBills.map(b => ({ name: b.name, amount: b.amount, paid: b.paid, id: b.id }))
  });

  // Recent transactions logic - Show:
  // 1. All regular transactions (non-recurring)
  // 2. Recurring payment transactions - only when their corresponding bill is marked as PAID
  const recentTransactionsFromRegular = allTransactions.filter(transaction => {
    // Check if this transaction corresponds to a recurring payment
    const correspondingBill = monthlyBills.find(bill => 
      bill.name === transaction.name && Math.abs(bill.amount) === Math.abs(transaction.amount)
    );
    
    // If no corresponding bill, it's a regular transaction - show it
    if (!correspondingBill) {
      return true;
    }
    
    // If there's a corresponding bill, only show the transaction if the bill is paid
    return correspondingBill.paid;
  });

  const sortedRecentTransactions = recentTransactionsFromRegular
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
    // Silently handle error - upcoming payments are not critical
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
