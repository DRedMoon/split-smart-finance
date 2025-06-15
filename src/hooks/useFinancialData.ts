
import { useState, useEffect } from 'react';
import { loadFinancialData } from '@/services/dataService';
import { getThisWeekUpcomingPayments } from '@/services/storageService';

export const useFinancialData = (refreshKey: number) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const financialData = loadFinancialData();
    setData(financialData);
  }, [refreshKey]);

  // Safe data loading with fallbacks
  const balance = data?.balance || 0;
  const loans = data?.loans || [];
  const allTransactions = data?.transactions || [];
  const monthlyBills = data?.monthlyBills || [];

  // Enhanced recent transactions logic
  const recentTransactions = [];
  
  // Add ALL income transactions (including Paycheck)
  const incomeTransactions = allTransactions.filter(transaction => transaction.amount > 0);
  recentTransactions.push(...incomeTransactions);
  
  // Add expense transactions
  const expenseTransactions = allTransactions.filter(transaction => transaction.amount < 0);
  recentTransactions.push(...expenseTransactions);
  
  // Add paid monthly bills as expense transactions
  const paidBills = monthlyBills.filter(bill => bill.paid);
  const billTransactions = paidBills.map(bill => ({
    id: `bill-${bill.id}`,
    name: bill.name,
    amount: -bill.amount,
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: bill.type || bill.category
  }));
  
  recentTransactions.push(...billTransactions);
  
  // Sort by date and show more transactions
  const sortedRecentTransactions = recentTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);

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
