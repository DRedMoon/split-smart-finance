
import { useCallback } from 'react';
import { saveFinancialData } from '@/services/storageService';

export const useMonthlyPaymentsLogic = (financialData: any, setFinancialData: any, toast: any) => {
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

    const allLoans = financialData?.loans || [];
    const allLoanPayments: any[] = [];
    
    const existingLoanBills = (financialData.monthlyBills || []).filter((bill: any) => 
      bill.category === 'Loan' || bill.category === 'Credit Card' || 
      bill.type === 'loan_payment' || bill.type === 'credit_payment'
    );
    
    existingLoanBills.forEach(bill => {
      allLoanPayments.push(bill);
    });
    
    allLoans.forEach(loan => {
      const existingBill = existingLoanBills.find(bill => bill.name === loan.name);
      if (!existingBill && loan.monthly > 0) {
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

  const handleTogglePaid = useCallback((billId: string | number) => {
    if (!financialData) return;

    console.log('Toggling payment for bill ID:', billId);
    
    const updatedData = { ...financialData };

    // Handle loan payment bills (generated from loans)
    if (typeof billId === 'string' && billId.startsWith('loan-')) {
      const loanId = parseInt(billId.replace('loan-', ''));
      const loan = updatedData.loans.find((l: any) => l.id === loanId);
      
      if (!loan) {
        console.error('Loan not found for ID:', loanId);
        return;
      }

      console.log('Processing loan payment for:', loan.name);

      let billIndex = updatedData.monthlyBills.findIndex((b: any) => b.name === loan.name);
      
      if (billIndex === -1) {
        const isCredit = loan.remaining === 'Credit Card';
        const newBill = {
          id: Date.now() + Math.random(),
          name: loan.name,
          amount: loan.monthly,
          dueDate: loan.dueDate || '1',
          category: isCredit ? 'Credit Card' : 'Loan',
          type: isCredit ? 'credit_payment' : 'loan_payment',
          paid: false
        };
        updatedData.monthlyBills.push(newBill);
        billIndex = updatedData.monthlyBills.length - 1;
        console.log('Created new bill for loan:', newBill);
      }

      const bill = updatedData.monthlyBills[billIndex];
      const newPaidStatus = !bill.paid;

      if (newPaidStatus) {
        if (updatedData.balance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${updatedData.balance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        updatedData.monthlyBills[billIndex].paid = true;
        updatedData.balance -= bill.amount;
        
        const loanToUpdate = updatedData.loans.find((l: any) => l.id === loanId);
        if (loanToUpdate) {
          loanToUpdate.currentAmount = Math.max(0, loanToUpdate.currentAmount - bill.amount);
          loanToUpdate.lastPayment = new Date().toISOString().split('T')[0];
        }
        
        toast({
          title: 'Maksu käsitelty',
          description: `${bill.name} merkitty maksetuksi`
        });
      } else {
        updatedData.monthlyBills[billIndex].paid = false;
        updatedData.balance += bill.amount;
        
        const loanToUpdate = updatedData.loans.find((l: any) => l.id === loanId);
        if (loanToUpdate) {
          loanToUpdate.currentAmount += bill.amount;
        }
        
        toast({
          title: 'Maksu peruutettu',
          description: `${bill.name} merkitty maksamattomaksi`
        });
      }
    } else {
      // Handle regular monthly bills and existing loan bills
      const billIndex = updatedData.monthlyBills.findIndex((b: any) => b.id === billId);
      if (billIndex === -1) {
        console.error('Bill not found for ID:', billId);
        return;
      }

      const bill = updatedData.monthlyBills[billIndex];
      const newPaidStatus = !bill.paid;

      console.log('Processing bill payment for:', bill.name, 'New status:', newPaidStatus);

      if (newPaidStatus) {
        if (updatedData.balance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${updatedData.balance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        updatedData.monthlyBills[billIndex].paid = true;
        updatedData.balance -= bill.amount;
        
        if (bill.category === 'Loan' || bill.category === 'Credit Card' || bill.type === 'loan_payment' || bill.type === 'credit_payment') {
          const loan = updatedData.loans?.find((l: any) => l.name === bill.name);
          if (loan) {
            loan.currentAmount = Math.max(0, loan.currentAmount - bill.amount);
            loan.lastPayment = new Date().toISOString().split('T')[0];
          }
        }
        
        toast({
          title: 'Maksu käsitelty',
          description: `${bill.name} merkitty maksetuksi`
        });
      } else {
        updatedData.monthlyBills[billIndex].paid = false;
        updatedData.balance += bill.amount;
        
        if (bill.category === 'Loan' || bill.category === 'Credit Card' || bill.type === 'loan_payment' || bill.type === 'credit_payment') {
          const loan = updatedData.loans?.find((l: any) => l.name === bill.name);
          if (loan) {
            loan.currentAmount += bill.amount;
          }
        }
        
        toast({
          title: 'Maksu peruutettu',
          description: `${bill.name} merkitty maksamattomaksi`
        });
      }
    }
    
    console.log('Saving updated data and triggering refresh');
    saveFinancialData(updatedData);
    setFinancialData(updatedData);
    window.dispatchEvent(new CustomEvent('financial-data-updated'));
  }, [financialData, setFinancialData, toast]);

  return {
    processPaymentData,
    handleTogglePaid
  };
};
