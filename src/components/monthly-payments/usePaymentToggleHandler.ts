
import { useCallback } from 'react';
import { saveFinancialData } from '@/services/storageService';

export const usePaymentToggleHandler = (financialData: any, setFinancialData: any, toast: any) => {
  const handleTogglePaid = useCallback((billId: string | number) => {
    if (!financialData) return;

    console.log('🔄 Toggle payment request for ID:', billId, 'Type:', typeof billId);
    
    const updatedData = { ...financialData };

    // Handle loan payment bills (generated from loans)
    if (typeof billId === 'string' && billId.startsWith('loan-')) {
      const loanId = parseInt(billId.replace('loan-', ''));
      const loan = updatedData.loans.find((l: any) => l.id === loanId);
      
      if (!loan) {
        console.error('❌ Loan not found for ID:', loanId);
        return;
      }

      console.log('🏦 Processing loan payment for:', loan.name);

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
        console.log('✅ Created new bill for loan:', newBill);
      }

      const bill = updatedData.monthlyBills[billIndex];
      const newPaidStatus = !bill.paid;

      console.log('💰 Toggling loan payment status:', bill.name, 'from', bill.paid, 'to', newPaidStatus);

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
        console.error('❌ Bill not found for ID:', billId);
        console.log('📋 Available bills:', updatedData.monthlyBills.map((b: any) => ({ id: b.id, name: b.name })));
        return;
      }

      const bill = updatedData.monthlyBills[billIndex];
      const newPaidStatus = !bill.paid;

      console.log('📄 Processing regular bill payment for:', bill.name, 'New status:', newPaidStatus);

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
    
    console.log('💾 Saving updated data and triggering refresh');
    saveFinancialData(updatedData);
    setFinancialData(updatedData);
    window.dispatchEvent(new CustomEvent('financial-data-updated'));
  }, [financialData, setFinancialData, toast]);

  return { handleTogglePaid };
};
