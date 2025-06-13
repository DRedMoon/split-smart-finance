
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import PaymentItem from './payments/PaymentItem';
import PaymentSummary from './payments/PaymentSummary';

const MonthlyPayments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState(null);

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
    localStorage.setItem('dashboardLastView', 'monthly-payments');
  }, []);

  const handleBackNavigation = () => {
    navigate('/?view=monthly-payments');
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
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

    const bill = financialData.monthlyBills.find(b => b.id === billId);
    if (!bill) return;

    const newPaidStatus = !bill.isPaid;
    const updatedData = { ...financialData };
    const billIndex = updatedData.monthlyBills.findIndex(b => b.id === billId);
    
    if (billIndex !== -1) {
      if (newPaidStatus) {
        // Check if sufficient balance
        if (updatedData.currentBalance < bill.amount) {
          toast({
            title: t('insufficient_funds'),
            description: `${t('balance')}: €${updatedData.currentBalance.toFixed(2)}, ${t('required')}: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        // Mark as paid - deduct from balance
        updatedData.monthlyBills[billIndex].isPaid = true;
        updatedData.currentBalance -= bill.amount;
        
        // If it's a loan payment, reduce loan amount
        if (bill.category === 'Loan' || bill.category === 'Credit Card' || bill.type === 'laina' || bill.type === 'luottokortti') {
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
        // Mark as unpaid - add back to balance
        updatedData.monthlyBills[billIndex].isPaid = false;
        updatedData.currentBalance += bill.amount;
        
        // If it's a loan payment, add back to the loan amount
        if (bill.category === 'Loan' || bill.category === 'Credit Card' || bill.type === 'laina' || bill.type === 'luottokortti') {
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
      
      saveFinancialData(updatedData);
      setFinancialData(updatedData);
    }
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen max-w-md mx-auto">Ladataan...</div>;
  }

  const sortedBills = [...(financialData.monthlyBills || [])].sort((a, b) => {
    // Paid bills go to bottom
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? 1 : -1;
    }
    // Sort by due date
    return parseInt(a.dueDate) - parseInt(b.dueDate);
  });

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

      <PaymentSummary bills={financialData.monthlyBills || []} />

      {/* Bills List */}
      <div className="space-y-4">
        {sortedBills.length === 0 ? (
          <Card className="bg-[#294D73] border-none">
            <CardContent className="p-6 text-center text-white/70">
              {t('no_monthly_payments')}
            </CardContent>
          </Card>
        ) : (
          sortedBills.map((bill) => (
            <PaymentItem
              key={bill.id}
              bill={bill}
              onTogglePaid={handleTogglePaid}
              getDaysUntilDue={getDaysUntilDue}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MonthlyPayments;
