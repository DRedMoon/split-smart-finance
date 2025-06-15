
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import { useToast } from '@/hooks/use-toast';

export const usePaymentToggleLogic = () => {
  const { toast } = useToast();

  const handleTogglePaid = (billId: string | number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    console.log('PaymentToggleLogic - Toggling payment for bill ID:', billId);
    
    const data = loadFinancialData();
    if (!data) {
      console.error('No financial data found');
      return;
    }

    // Handle loan payment bills (generated from loans)
    if (typeof billId === 'string' && billId.startsWith('loan-')) {
      const loanId = parseInt(billId.replace('loan-', ''));
      const loan = data.loans.find((l: any) => l.id === loanId);
      
      if (!loan) {
        console.error('Loan not found for ID:', loanId);
        return;
      }

      console.log('PaymentToggleLogic - Processing loan payment for:', loan.name);

      // Find or create the monthly bill for this loan
      let billIndex = data.monthlyBills.findIndex((b: any) => b.name === loan.name);
      
      if (billIndex === -1) {
        // Create the bill if it doesn't exist
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
        data.monthlyBills.push(newBill);
        billIndex = data.monthlyBills.length - 1;
        console.log('PaymentToggleLogic - Created new bill for loan:', newBill);
      }

      const bill = data.monthlyBills[billIndex];
      const newPaidStatus = !bill.paid;

      if (newPaidStatus) {
        if (data.balance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${data.balance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        data.monthlyBills[billIndex].paid = true;
        data.balance -= bill.amount;
        
        // Update loan current amount
        const loanToUpdate = data.loans.find((l: any) => l.id === loanId);
        if (loanToUpdate) {
          loanToUpdate.currentAmount = Math.max(0, loanToUpdate.currentAmount - bill.amount);
          loanToUpdate.lastPayment = new Date().toISOString().split('T')[0];
        }
        
        toast({
          title: 'Maksu käsitelty',
          description: `${bill.name} merkitty maksetuksi`
        });
      } else {
        data.monthlyBills[billIndex].paid = false;
        data.balance += bill.amount;
        
        // Restore loan current amount
        const loanToUpdate = data.loans.find((l: any) => l.id === loanId);
        if (loanToUpdate) {
          loanToUpdate.currentAmount += bill.amount;
        }
        
        toast({
          title: 'Maksu peruutettu',
          description: `${bill.name} merkitty maksamattomaksi`
        });
      }
    } else {
      // Handle regular monthly bills
      const billIndex = data.monthlyBills.findIndex((b: any) => b.id === billId);
      if (billIndex === -1) {
        console.error('Bill not found for ID:', billId);
        return;
      }

      const bill = data.monthlyBills[billIndex];
      const newPaidStatus = !bill.paid;

      console.log('PaymentToggleLogic - Processing regular bill payment for:', bill.name, 'New status:', newPaidStatus);

      if (newPaidStatus) {
        if (data.balance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${data.balance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        data.monthlyBills[billIndex].paid = true;
        data.balance -= bill.amount;
        
        toast({
          title: 'Maksu käsitelty',
          description: `${bill.name} merkitty maksetuksi`
        });
      } else {
        data.monthlyBills[billIndex].paid = false;
        data.balance += bill.amount;
        
        toast({
          title: 'Maksu peruutettu',
          description: `${bill.name} merkitty maksamattomaksi`
        });
      }
    }
    
    console.log('PaymentToggleLogic - Saving updated data and triggering refresh');
    saveFinancialData(data);
    window.dispatchEvent(new CustomEvent('financial-data-updated'));
  };

  return { handleTogglePaid };
};
