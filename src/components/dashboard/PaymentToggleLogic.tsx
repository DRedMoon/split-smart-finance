
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import { useToast } from '@/hooks/use-toast';
import { getCurrentMonthYear, isPaymentPaidForMonth, setPaymentStatusForMonth, migratePaymentDataToMonthSpecific } from '@/utils/paymentUtils';
import { calculateBalanceForValidation } from '@/services/balanceService';

export const usePaymentToggleLogic = () => {
  const { toast } = useToast();

  // Use centralized balance calculation for consistency
  const calculateCurrentBalance = (data: any) => {
    return calculateBalanceForValidation(data);
  };

  const handleTogglePaid = (billId: string | number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    console.log('PaymentToggleLogic - Toggling payment for bill ID:', billId);
    
    let data = loadFinancialData();
    if (!data) {
      toast({
        title: "Error",
        description: "Could not load financial data. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Migrate data to month-specific format
    data = migratePaymentDataToMonthSpecific(data);

    // Calculate the actual current balance including transactions
    const currentBalance = calculateCurrentBalance(data);
    console.log('PaymentToggleLogic - Current calculated balance:', currentBalance);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Handle loan payment bills (generated from loans)
    if (typeof billId === 'string' && billId.startsWith('loan-')) {
      const loanId = parseInt(billId.replace('loan-', ''));
      const loan = data.loans.find((l: any) => l.id === loanId);
      
      if (!loan) {
        toast({
          title: 'Error',
          description: `Loan not found for ID: ${loanId}`,
          variant: "destructive"
        });
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
      const currentPaidStatus = isPaymentPaidForMonth(bill, currentYear, currentMonth);
      const newPaidStatus = !currentPaidStatus;

      if (newPaidStatus) {
        if (currentBalance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${currentBalance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        setPaymentStatusForMonth(data.monthlyBills[billIndex], currentYear, currentMonth, true);
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
        setPaymentStatusForMonth(data.monthlyBills[billIndex], currentYear, currentMonth, false);
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
        toast({
          title: 'Error',
          description: `Bill not found for ID: ${billId}`,
          variant: "destructive"
        });
        return;
      }

      const bill = data.monthlyBills[billIndex];
      const currentPaidStatus = isPaymentPaidForMonth(bill, currentYear, currentMonth);
      const newPaidStatus = !currentPaidStatus;

      console.log('PaymentToggleLogic - Processing regular bill payment for:', bill.name, 'New status:', newPaidStatus);

      if (newPaidStatus) {
        if (currentBalance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${currentBalance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        setPaymentStatusForMonth(data.monthlyBills[billIndex], currentYear, currentMonth, true);
        data.balance -= bill.amount;
        
        toast({
          title: 'Maksu käsitelty',
          description: `${bill.name} merkitty maksetuksi`
        });
      } else {
        setPaymentStatusForMonth(data.monthlyBills[billIndex], currentYear, currentMonth, false);
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
