
import { useCallback } from 'react';
import { saveFinancialData } from '@/services/storageService';

export const usePaymentToggleHandler = (financialData: any, setFinancialData: any, toast: any) => {
  const calculateCurrentBalance = (data: any) => {
    const baseBalance = data?.balance || 0;
    const allTransactions = data?.transactions || [];
    const transactionSum = allTransactions.reduce((sum: number, transaction: any) => sum + transaction.amount, 0);
    return baseBalance + transactionSum;
  };

  const handleTogglePaid = useCallback((billId: string | number) => {
    if (!financialData) return;

    console.log('🔄 Toggle payment request for ID:', billId, 'Type:', typeof billId);
    
    const updatedData = { ...financialData };
    
    // Calculate the actual current balance including transactions
    const currentBalance = calculateCurrentBalance(updatedData);
    console.log('🔄 Current calculated balance:', currentBalance);

    // Handle loan payments with improved ID matching
    if ((typeof billId === 'string' && billId.startsWith('loan-')) || 
        (typeof billId === 'number' && updatedData.monthlyBills.find((b: any) => b.id === billId && (b.category === 'Loan' || b.category === 'Credit Card')))) {
      
      let targetLoan: any = null;
      let loanIdFromBill: string = '';
      
      if (typeof billId === 'string' && billId.startsWith('loan-')) {
        // Extract loan ID from loan-{loanId} format
        loanIdFromBill = billId.replace('loan-', '');
        console.log('🔍 Looking for loan with ID from bill:', loanIdFromBill);
        
        // Find loan by comparing both as strings to handle decimal precision
        targetLoan = updatedData.loans.find((l: any) => {
          const loanIdStr = l.id.toString();
          const matches = loanIdStr === loanIdFromBill;
          console.log('🔍 Comparing loan ID:', loanIdStr, 'with extracted:', loanIdFromBill, 'matches:', matches);
          return matches;
        });
      } else {
        // Legacy format: find loan by bill name
        const existingBill = updatedData.monthlyBills.find((b: any) => b.id === billId);
        if (existingBill) {
          targetLoan = updatedData.loans.find((l: any) => l.name === existingBill.name);
          loanIdFromBill = targetLoan?.id.toString() || '';
        }
      }
      
      if (!targetLoan) {
        console.error('❌ Loan not found for ID:', loanIdFromBill);
        console.log('📋 Available loan IDs:', updatedData.loans.map((l: any) => ({ id: l.id.toString(), name: l.name })));
        return;
      }

      console.log('🏦 Processing loan payment for:', targetLoan.name, 'Loan ID:', targetLoan.id);

      // Find or create the bill entry
      let billIndex = updatedData.monthlyBills.findIndex((b: any) => {
        // Match by name (most reliable) or by bill ID
        return b.name === targetLoan.name || b.id === billId;
      });
      
      if (billIndex === -1) {
        // Create new bill entry
        const isCredit = targetLoan.remaining === 'Credit Card';
        const newBill = {
          id: `loan-${targetLoan.id}`,
          name: targetLoan.name,
          amount: targetLoan.monthly,
          dueDate: targetLoan.dueDate || '1',
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
        if (currentBalance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${currentBalance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        updatedData.monthlyBills[billIndex].paid = true;
        updatedData.balance -= bill.amount;
        
        // Update loan amount using exact ID match
        const loanToUpdate = updatedData.loans.find((l: any) => l.id.toString() === targetLoan.id.toString());
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
        
        const loanToUpdate = updatedData.loans.find((l: any) => l.id.toString() === targetLoan.id.toString());
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
        if (currentBalance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${currentBalance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
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
