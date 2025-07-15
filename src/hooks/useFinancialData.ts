
import { useState, useEffect, useMemo } from 'react';
import { loadFinancialData, saveFinancialData } from '@/services/dataService';
import { getThisWeekUpcomingPayments } from '@/services/storageService';
import { isPaymentPaidForMonth } from '@/utils/paymentUtils';

export const useFinancialData = (refreshKey: number) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const financialData = loadFinancialData();
    setData(financialData);
  }, [refreshKey]);

  const { currentYear, currentMonth } = useMemo(() => {
    const now = new Date();
    return {
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth()
    };
  }, []);

  // Safe data loading with fallbacks - memoized for performance
  const { baseBalance, loans, allTransactions, monthlyBills } = useMemo(() => ({
    baseBalance: data?.balance || 0,
    loans: data?.loans || [],
    allTransactions: data?.transactions || [],
    monthlyBills: data?.monthlyBills || []
  }), [data]);

  // Memoized regular transactions calculation
  const regularTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      // Check if this transaction corresponds to a recurring payment
      const correspondingBill = monthlyBills.find(bill => 
        bill.name === transaction.name && Math.abs(bill.amount) === Math.abs(transaction.amount)
      );
      
      // Only include transactions that don't have corresponding bills (i.e., regular transactions)
      return !correspondingBill;
    });
  }, [allTransactions, monthlyBills]);

  // Memoized balance calculation
  const balance = useMemo(() => {
    const regularTransactionSum = regularTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    return baseBalance + regularTransactionSum;
  }, [baseBalance, regularTransactions]);

  // Memoized recent transactions calculation
  const sortedRecentTransactions = useMemo(() => {
    // Recent transactions logic - Show:
    // 1. All regular transactions (non-recurring)
    // 2. Recurring payment transactions - only when their corresponding bill is marked as PAID for current month
    const recentTransactionsFromRegular = allTransactions.filter(transaction => {
      // Check if this transaction corresponds to a recurring payment
      const correspondingBill = monthlyBills.find(bill => 
        bill.name === transaction.name && Math.abs(bill.amount) === Math.abs(transaction.amount)
      );
      
      // If no corresponding bill, it's a regular transaction - show it
      if (!correspondingBill) {
        return true;
      }
      
      // If there's a corresponding bill, only show the transaction if the bill is paid for current month
      return isPaymentPaidForMonth(correspondingBill, currentYear, currentMonth);
    });

    return recentTransactionsFromRegular
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
  }, [allTransactions, monthlyBills, currentYear, currentMonth]);

  // Memoized totals calculation
  const { totalLoanAmount, totalMonthlyPayments, totalBillsAmount } = useMemo(() => ({
    totalLoanAmount: loans.reduce((sum, loan) => sum + (loan.currentAmount || 0), 0),
    totalMonthlyPayments: loans.reduce((sum, loan) => sum + (loan.monthly || 0), 0),
    totalBillsAmount: monthlyBills.reduce((sum, bill) => sum + (bill.amount || 0), 0)
  }), [loans, monthlyBills]);

  // Memoized filtered week payments
  const filteredWeekPayments = useMemo(() => {
    // Get this week's upcoming payments with error handling
    let thisWeekPayments = [];
    try {
      thisWeekPayments = getThisWeekUpcomingPayments();
    } catch (error) {
      // Silently handle error - upcoming payments are not critical
    }

    return thisWeekPayments.filter(bill => 
      bill.type !== 'laina' && 
      bill.type !== 'luottokortti' && 
      bill.type !== 'loan_payment' && 
      bill.type !== 'credit_payment' &&
      !isPaymentPaidForMonth(bill, currentYear, currentMonth)
    );
  }, [currentYear, currentMonth]);

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
