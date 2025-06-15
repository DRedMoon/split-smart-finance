
import { useCallback } from 'react';
import { saveFinancialData } from '@/services/storageService';

export const usePaymentToggleHandler = (financialData: any, setFinancialData: any, toast: any) => {
  const handleTogglePaid = useCallback((billId: string | number) => {
    if (!financialData) return;

    console.log('🔄 Toggle payment request for ID:', billId, 'Type:', typeof billId);
    
    const updatedData = { ...financialData };

    // Handle both loan payment formats (new loan-prefixed and legacy numeric IDs)
    if ((typeof billId === 'string' && billId.startsWith('loan-')) || 
        (typeof billId === 'number' && updatedData.monthlyBills.find((b: any) => b.id === billId && (b.category === 'Loan' || b.category === 'Credit Card')))) {
      
      let loanIdString: string;
      let loan: any;
      
      if (typeof billId === 'string' && billId.startsWith('loan-')) {
        // New format: loan-{loanId}
        loanIdString = billId.replace('loan-', '');
        loan = updatedData.loans.find((l: any) => l.id.toString() === loanIdString);
      } else {
        // Legacy format: find loan by bill name
        const existingBill = updatedData.monthlyBills.find((b: any) => b.id === billId);
        if (existingBill) {
          loan = updatedData.loans.find((l: any) => l.name === existingBill.name);
          loanIdString = loan?.id.toString() || '';
        }
      }
      
      console.log('🔍 Processing loan payment - Loan ID string:', loanIdString, 'Found loan:', loan?.name);
      
      if (!loan) {
        console.error('❌ Loan not found for ID string:', loanIdString);
        console.log('📋 Available loans:', updatedData.loans.map((l: any) => ({ id: l.id, name: l.name })));
        return;
      }

      console.log('🏦 Processing loan payment for:', loan.name, 'Loan ID:', loan.id);

      // Find or create the bill entry
      let billIndex = updatedData.monthlyBills.findIndex((b: any) => 
        b.name === loan.name || b.id === billId || b.id === `loan-${loan.id}`
      );
      
      if (billIndex === -1) {
        const isCredit = loan.remaining === 'Credit Card';
        const newBill = {
          id: `loan-${loan.id}`, // Always use standardized ID for new bills
          name: loan.name,
          amount: loan.monthly,
          dueDate: loan.dueDate || '1',
          category: isCredit ? 'Credit Card' : 'Loan',
          type: isCredit ? 'credit_payment' : 'loan_payment',
          paid: false
        };
        updatedData.monthlyBills.push(newBill);
        billIndex = updatedData.monthlyBills.length - 1;
        console.log('✅ Created new standardized bill for loan:', newBill);
      } else {
        // Migrate existing bill to use standardized ID if needed
        const existingBill = updatedData.monthlyBills[billIndex];
        if (existingBill.id !== `loan-${loan.id}`) {
          console.log('🔄 Migrating bill ID from', existingBill.id, 'to', `loan-${loan.id}`);
          updatedData.monthlyBills[billIndex].id = `loan-${loan.id}`;
        }
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
        
        // Update loan amount
        const loanToUpdate = updatedData.loans.find((l: any) => l.id.toString() === loanIdString);
        if (loanToUpdate) {
          loanToUpdate.currentAmount = Math.max(0, loanToUpdate.currentAmount - bill.amount);
          loanToUpdate.lastPayment = new Date().toISOString().split('T')[0];
          console.log('✅ Updated loan amount:', loanToUpdate.name, 'New amount:', loanToUpdate.currentAmount);
        }
        
        toast({
          title: 'Maksu käsitelty',
          description: `${bill.name} merkitty maksetuksi`
        });
      } else {
        updatedData.monthlyBills[billIndex].paid = false;
        updatedData.balance += bill.amount;
        
        const loanToUpdate = updatedData.loans.find((l: any) => l.id.toString() === loanIdString);
        if (loanToUpdate) {
          loanToUpdate.currentAmount += bill.amount;
          console.log('✅ Restored loan amount:', loanToUpdate.name, 'New amount:', loanToUpdate.currentAmount);
        }
        
        toast({
          title: 'Maksu peruutettu',
          description: `${bill.name} merkitty maksamattomaksi`
        });
      }
    } else {
      // Handle regular monthly bills
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
        
        toast({
          title: 'Maksu käsitelty',
          description: `${bill.name} merkitty maksetuksi`
        });
      } else {
        updatedData.monthlyBills[billIndex].paid = false;
        updatedData.balance += bill.amount;
        
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
