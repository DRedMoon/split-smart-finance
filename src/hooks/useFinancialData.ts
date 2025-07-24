
import { useState, useEffect, useMemo } from 'react';
import { loadFinancialData, saveFinancialData, getDefaultFinancialData } from '@/services/dataService';
import { getThisWeekUpcomingPayments } from '@/services/storageService';
import { isPaymentPaidForMonth } from '@/utils/paymentUtils';
import { calculateBalance } from '@/services/balanceService';

export const useFinancialData = (refreshKey: number) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    console.log('useFinancialData: Loading financial data, refreshKey:', refreshKey);
    
    try {
      let financialData = loadFinancialData();
      
      // If no data exists, create and save default data
      if (!financialData) {
        console.log('useFinancialData: No financial data found, creating default data');
        financialData = getDefaultFinancialData();
        saveFinancialData(financialData);
        console.log('useFinancialData: Default data created and saved:', financialData);
      } else {
        console.log('useFinancialData: Financial data loaded successfully');
      }
      
      setData(financialData);
    } catch (error) {
      console.error('useFinancialData: Error loading financial data:', error);
      // Fallback to default data
      const defaultData = getDefaultFinancialData();
      setData(defaultData);
      saveFinancialData(defaultData);
      console.log('useFinancialData: Fallback to default data due to error');
    }
  }, [refreshKey]);

  const { currentYear, currentMonth } = useMemo(() => {
    const now = new Date();
    return {
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth()
    };
  }, []);

  // Safe data loading with fallbacks - memoized for performance
  const { baseBalance, loans, allTransactions, monthlyBills } = useMemo(() => {
    if (!data) {
      return {
        baseBalance: 0,
        loans: [],
        allTransactions: [],
        monthlyBills: []
      };
    }
    
    return {
      baseBalance: data.balance || 0,
      loans: data.loans || [],
      allTransactions: data.transactions || [],
      monthlyBills: data.monthlyBills || []
    };
  }, [data]);

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

  // Memoized balance calculation using centralized service
  const balance = useMemo(() => {
    if (!data) return 0;
    return calculateBalance(data);
  }, [data]);

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
