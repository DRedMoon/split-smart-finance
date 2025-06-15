
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import MonthlyPaymentsHeader from './monthly-payments/MonthlyPaymentsHeader';
import MonthlyPaymentsSummary from './monthly-payments/MonthlyPaymentsSummary';
import MonthlyPaymentsList from './monthly-payments/MonthlyPaymentsList';
import { useMonthlyPaymentsData } from './monthly-payments/useMonthlyPaymentsData';

const today = new Date();

const MonthlyPayments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState(null);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showAllLoanCredit, setShowAllLoanCredit] = useState(false);

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
    localStorage.setItem('dashboardLastView', 'monthly-payments');
  }, []);

  const handleBackNavigation = () => {
    navigate('/');
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const dayMatch = dueDate.match(/\d+/);
    if (!dayMatch) return null;
    
    const dueDay = parseInt(dayMatch[0]);
    const due = new Date(today.getFullYear(), today.getMonth(), dueDay);
    if (due < today) {
      due.setMonth(due.getMonth() + 1);
    }
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleTogglePaid = (billId) => {
    if (!financialData) return;

    console.log('MonthlyPayments - Toggling payment for bill ID:', billId);
    
    const updatedData = { ...financialData };

    // Handle loan payment bills (generated from loans)
    if (typeof billId === 'string' && billId.startsWith('loan-')) {
      const loanId = parseInt(billId.replace('loan-', ''));
      const loan = updatedData.loans.find((l) => l.id === loanId);
      
      if (!loan) {
        console.error('Loan not found for ID:', loanId);
        return;
      }

      console.log('MonthlyPayments - Processing loan payment for:', loan.name);

      // Find or create the monthly bill for this loan
      let billIndex = updatedData.monthlyBills.findIndex((b) => b.name === loan.name);
      
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
        updatedData.monthlyBills.push(newBill);
        billIndex = updatedData.monthlyBills.length - 1;
        console.log('MonthlyPayments - Created new bill for loan:', newBill);
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
        
        // Update loan current amount
        const loanToUpdate = updatedData.loans.find((l) => l.id === loanId);
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
        
        // Restore loan current amount
        const loanToUpdate = updatedData.loans.find((l) => l.id === loanId);
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
      const bill = updatedData.monthlyBills.find(b => b.id === billId);
      if (!bill) {
        console.error('Bill not found for ID:', billId);
        return;
      }

      const billIndex = updatedData.monthlyBills.findIndex(b => b.id === billId);
      const newPaidStatus = !bill.paid;

      console.log('MonthlyPayments - Processing regular bill payment for:', bill.name, 'New status:', newPaidStatus);

      if (newPaidStatus) {
        if (updatedData.balance < bill.amount) {
          toast({
            title: t('insufficient_funds'),
            description: `${t('balance')}: €${updatedData.balance.toFixed(2)}, ${t('required')}: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        updatedData.monthlyBills[billIndex].paid = true;
        updatedData.balance -= bill.amount;
        
        if (bill.category === 'Loan' || bill.category === 'Credit Card' || bill.type === 'loan_payment' || bill.type === 'credit_payment') {
          const loan = updatedData.loans?.find(l => l.name === bill.name);
          if (loan) {
            loan.currentAmount = Math.max(0, loan.currentAmount - bill.amount);
            loan.lastPayment = new Date().toISOString().split('T')[0];
          }
        }
        
        toast({
          title: t('payment_processed'),
          description: `${bill.name} ${t('marked_as_paid')}`
        });
      } else {
        updatedData.monthlyBills[billIndex].paid = false;
        updatedData.balance += bill.amount;
        
        if (bill.category === 'Loan' || bill.category === 'Credit Card' || bill.type === 'loan_payment' || bill.type === 'credit_payment') {
          const loan = updatedData.loans?.find(l => l.name === bill.name);
          if (loan) {
            loan.currentAmount += bill.amount;
          }
        }
        
        toast({
          title: t('payment_reversed'),
          description: `${bill.name} ${t('marked_as_unpaid')}`
        });
      }
    }
    
    console.log('MonthlyPayments - Saving updated data and triggering refresh');
    saveFinancialData(updatedData);
    setFinancialData(updatedData);
    window.dispatchEvent(new CustomEvent('financial-data-updated'));
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen max-w-md mx-auto">Ladataan...</div>;
  }

  const { regularBills, loanCreditPayments, totals } = useMonthlyPaymentsData(financialData);

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen max-w-md mx-auto">
      <MonthlyPaymentsHeader onBack={handleBackNavigation} />
      
      <MonthlyPaymentsSummary totals={totals} />
      
      <MonthlyPaymentsList
        regularBills={regularBills}
        loanCreditPayments={loanCreditPayments}
        showAllPayments={showAllPayments}
        showAllLoanCredit={showAllLoanCredit}
        onToggleShowAllPayments={setShowAllPayments}
        onToggleShowAllLoanCredit={setShowAllLoanCredit}
        onTogglePaid={handleTogglePaid}
        getDaysUntilDue={getDaysUntilDue}
      />
    </div>
  );
};

export default MonthlyPayments;
