import { useCallback } from 'react';

export const usePaymentDataProcessor = (financialData: any) => {
  const processPaymentData = useCallback(() => {
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

    console.log('🔧 Processing payment data - starting migration check');

    const allLoans = financialData?.loans || [];
    const allLoanPayments: any[] = [];
    
    // Get existing loan bills and standardize their IDs
    const existingLoanBills = (financialData.monthlyBills || []).filter((bill: any) => 
      bill.category === 'Loan' || bill.category === 'Credit Card' || 
      bill.type === 'loan_payment' || bill.type === 'credit_payment'
    );
    
    console.log('🔍 Found existing loan bills:', existingLoanBills.map(b => ({ id: b.id, name: b.name, type: typeof b.id })));
    
    // Process existing loan bills and standardize their IDs
    existingLoanBills.forEach(bill => {
      // Find the corresponding loan to get the proper loan ID
      const correspondingLoan = allLoans.find(loan => loan.name === bill.name);
      
      if (correspondingLoan) {
        // Standardize the bill ID to use loan-{loanId} format
        const standardizedBill = {
          ...bill,
          id: `loan-${correspondingLoan.id}`
        };
        console.log('📋 Standardized existing bill ID:', bill.name, 'from', bill.id, 'to', standardizedBill.id);
        allLoanPayments.push(standardizedBill);
      } else {
        // Keep original bill if no matching loan found
        allLoanPayments.push(bill);
      }
    });
    
    // Add missing loan payments from loans that don't have bills yet
    allLoans.forEach(loan => {
      const existingBill = existingLoanBills.find(bill => bill.name === loan.name);
      if (!existingBill && loan.monthly > 0) {
        console.log('➕ Adding missing loan payment for:', loan.name, 'with standardized ID');
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

    console.log('✅ Final processed loan/credit payments:', loanCreditPayments.map(p => ({ id: p.id, name: p.name })));

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

  return { processPaymentData };
};
