
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import PaymentItem from './payments/PaymentItem';

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
    // Direct navigation without returnTo parameter to prevent dashboard carousel slide
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

  // Get all loans to ensure we have all loan payments
  const allLoans = financialData?.loans || [];
  
  console.log('MonthlyPayments - All loans from data:', allLoans);
  
  // Create comprehensive list of loan/credit payments
  const allLoanPayments = [];
  
  // Add existing loan bills from monthlyBills
  const existingLoanBills = (financialData.monthlyBills || []).filter((bill) => 
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
      console.log('MonthlyPayments - Adding missing loan payment for:', loan.name);
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

  const regularBills = (financialData.monthlyBills || []).filter((bill) => 
    bill.category !== 'Loan' && bill.category !== 'Credit Card' && 
    bill.type !== 'loan_payment' && bill.type !== 'credit_payment'
  );

  console.log('MonthlyPayments - Final loan/credit payments:', loanCreditPayments);
  console.log('MonthlyPayments - Regular bills:', regularBills);

  const sortBills = (bills) => bills.sort((a, b) => {
    // Paid bills go to bottom
    if (a.paid !== b.paid) {
      return a.paid ? 1 : -1;
    }
    // Sort by due date
    return parseInt(a.dueDate) - parseInt(b.dueDate);
  });

  const sortedLoanCredit = sortBills([...loanCreditPayments]);
  const sortedRegular = sortBills([...regularBills]);

  // Calculate totals
  const totalRegular = regularBills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidRegular = regularBills.filter(bill => bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
  const remainingRegular = totalRegular - paidRegular;

  const totalLoanCredit = loanCreditPayments.reduce((sum, bill) => sum + bill.amount, 0);
  const paidLoanCredit = loanCreditPayments.filter(bill => bill.paid).reduce((sum, bill) => sum + bill.amount, 0);
  const remainingLoanCredit = totalLoanCredit - paidLoanCredit;

  const displayedRegular = showAllPayments ? sortedRegular : sortedRegular.slice(0, 2);
  const displayedLoanCredit = showAllLoanCredit ? sortedLoanCredit : sortedLoanCredit.slice(0, 2);
  const hasMoreRegular = sortedRegular.length > 2;
  const hasMoreLoanCredit = sortedLoanCredit.length > 2;

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackNavigation} className="text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white">{t('monthly_payments')}</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => navigate('/settings')} 
            size="sm" 
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Settings size={16} />
          </Button>
          <Button onClick={() => navigate('/add')} size="sm" className="bg-[#294D73] hover:bg-[#1f3a5f]">
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4 mb-6">
        {/* Regular Bills Summary */}
        <Card className="bg-[#1a4a6b] border-none">
          <CardContent className="p-4">
            <h3 className="text-white font-medium mb-3">{t('monthly_payments')}</h3>
            <div className="space-y-2 text-white text-sm">
              <div className="flex justify-between">
                <span>{t('total_monthly')}:</span>
                <span className="font-bold">€{totalRegular.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('paid')}:</span>
                <span className="font-bold text-green-400">€{paidRegular.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('remaining')}:</span>
                <span className="font-bold text-red-300">€{remainingRegular.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan/Credit Summary */}
        {totalLoanCredit > 0 && (
          <Card className="bg-[#1a4a6b] border-none">
            <CardContent className="p-4">
              <h3 className="text-white font-medium mb-3">{t('loans_credits')}</h3>
              <div className="space-y-2 text-white text-sm">
                <div className="flex justify-between">
                  <span>{t('total_monthly')}:</span>
                  <span className="font-bold">€{totalLoanCredit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('paid')}:</span>
                  <span className="font-bold text-green-400">€{paidLoanCredit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('remaining')}:</span>
                  <span className="font-bold text-red-300">€{remainingLoanCredit.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loan/Credit Payments */}
      {sortedLoanCredit.length > 0 && (
        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold mb-4">{t('loans_credits')}</h2>
          <div className="space-y-4">
            {displayedLoanCredit.map((bill) => (
              <PaymentItem
                key={bill.id}
                bill={bill}
                onTogglePaid={handleTogglePaid}
                getDaysUntilDue={getDaysUntilDue}
              />
            ))}
            
            {hasMoreLoanCredit && (
              <Button
                variant="ghost"
                onClick={() => setShowAllLoanCredit(!showAllLoanCredit)}
                className="w-full text-white/70 hover:text-white hover:bg-white/10"
              >
                {showAllLoanCredit ? (
                  <>
                    <ChevronUp size={16} className="mr-2" />
                    {t('show_less')}
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="mr-2" />
                    +{sortedLoanCredit.length - 2} {t('more')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Regular Monthly Payments */}
      <div>
        <h2 className="text-white text-lg font-semibold mb-4">{t('monthly_payments')}</h2>
        <div className="space-y-4">
          {displayedRegular.length === 0 ? (
            <Card className="bg-[#294D73] border-none">
              <CardContent className="p-6 text-center text-white/70">
                {t('no_monthly_payments')}
              </CardContent>
            </Card>
          ) : (
            <>
              {displayedRegular.map((bill) => (
                <PaymentItem
                  key={bill.id}
                  bill={bill}
                  onTogglePaid={handleTogglePaid}
                  getDaysUntilDue={getDaysUntilDue}
                />
              ))}
              
              {hasMoreRegular && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllPayments(!showAllPayments)}
                  className="w-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  {showAllPayments ? (
                    <>
                      <ChevronUp size={16} className="mr-2" />
                      {t('show_less')}
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className="mr-2" />
                      +{sortedRegular.length - 2} {t('more')}
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyPayments;
