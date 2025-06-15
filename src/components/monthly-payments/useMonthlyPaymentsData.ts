
import { useMemo } from 'react';

export const useMonthlyPaymentsData = (financialData: any) => {
  return useMemo(() => {
    if (!financialData) {
      return {
        regularBills: [],
        loanCreditPayments: [],
        totals: {
          totalRegular: 0,
          paidRegular: 0,
          remainingRegular: 0,
          totalLoanCredit: 0,
          paidLoanCredit: 0,
          remainingLoanCredit: 0
        }
      };
    }

    // Get all loans to ensure we have all loan payments
    const allLoans = financialData?.loans || [];
    
    console.log('useMonthlyPaymentsData - All loans from data:', allLoans);
    
    // Create comprehensive list of loan/credit payments
    const allLoanPayments: any[] = [];
    
    // Add existing loan bills from monthlyBills
    const existingLoanBills = (financialData.monthlyBills || []).filter((bill: any) => 
      bill.category === 'Loan' || bill.category === 'Credit Card' || 
      bill.type === 'loan_payment' || bill.type === 'credit_payment'
    );
    
    // Add all existing loan bills
    existingLoanBills.forEach(bill => {
      allLoanPayments.push(bill);
    });
    
    // Add missing loan payments from loans that don't have bills yet
    allLoans.forEach(loan => {
      const existingBill = existingLoanBills.find(bill => bill.name === loan.name);
      if (!existingBill && loan.monthly > 0) {
        console.log('useMonthlyPaymentsData - Adding missing loan payment for:', loan.name);
        const isCredit = loan.remaining === 'Credit Card';
        allLoanPayments.push({
          id: `loan-${loan.id}`,
          name: loan.name,
          amount: loan.monthly,
          dueDate: loan.dueDate || '1',
          category: isCredit ? 'Credit Card' : 'Loan',
          type: isCredit ? 'credit_payment' : 'loan_payment',
          paid: false
        });
      }
    });

    const loanCreditPayments = allLoanPayments;

    const regularBills = (financialData.monthlyBills || []).filter((bill: any) => 
      bill.category !== 'Loan' && bill.category !== 'Credit Card' && 
      bill.type !== 'loan_payment' && bill.type !== 'credit_payment'
    );

    console.log('useMonthlyPaymentsData - Final loan/credit payments:', loanCreditPayments);
    console.log('useMonthlyPaymentsData - Regular bills:', regularBills);

    // Calculate totals
    const totalRegular = regularBills.reduce((sum: number, bill: any) => sum + bill.amount, 0);
    const paidRegular = regularBills.filter((bill: any) => bill.paid).reduce((sum: number, bill: any) => sum + bill.amount, 0);
    const remainingRegular = totalRegular - paidRegular;

    const totalLoanCredit = loanCreditPayments.reduce((sum: number, bill: any) => sum + bill.amount, 0);
    const paidLoanCredit = loanCreditPayments.filter((bill: any) => bill.paid).reduce((sum: number, bill: any) => sum + bill.amount, 0);
    const remainingLoanCredit = totalLoanCredit - paidLoanCredit;

    return {
      regularBills,
      loanCreditPayments,
      totals: {
        totalRegular,
        paidRegular,
        remainingRegular,
        totalLoanCredit,
        paidLoanCredit,
        remainingLoanCredit
      }
    };
  }, [financialData]);
};
