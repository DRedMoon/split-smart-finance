
import React, { useState } from 'react';
import { ArrowRight, CreditCard, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import { useToast } from '@/hooks/use-toast';

interface LoansCreditsCardProps {
  loans: any[];
  totalLoanAmount: number;
  totalMonthlyPayments: number;
}

const LoansCreditsCard = ({ loans, totalLoanAmount, totalMonthlyPayments }: LoansCreditsCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);

  const handleNavigateToLoans = () => {
    localStorage.setItem('dashboardLastView', 'loans-credits');
    navigate('/loans-credits');
  };

  const handleToggleLoanPayment = (loanId: number) => {
    const data = loadFinancialData();
    if (!data) return;

    const loan = data.loans?.find(l => l.id === loanId);
    if (!loan) return;

    // Find or create monthly bill for this loan
    let billIndex = data.monthlyBills.findIndex(b => b.name === loan.name && (b.type === 'laina' || b.type === 'luottokortti' || b.type === 'loan_payment' || b.type === 'credit_payment'));
    
    if (billIndex === -1) {
      // Create new monthly bill for this loan
      const newBill = {
        id: Date.now(),
        name: loan.name,
        amount: loan.monthly,
        dueDate: loan.dueDate,
        type: loan.remaining === 'Credit Card' ? 'luottokortti' : 'laina',
        paid: false
      };
      data.monthlyBills.push(newBill);
      billIndex = data.monthlyBills.length - 1;
    }

    const bill = data.monthlyBills[billIndex];
    const newPaidStatus = !bill.paid;

    if (newPaidStatus) {
      // Check if sufficient balance
      if (data.balance < bill.amount) {
        toast({
          title: t('insufficient_funds'),
          description: `${t('balance')}: €${data.balance.toFixed(2)}, ${t('required')}: €${bill.amount.toFixed(2)}`,
          variant: "destructive"
        });
        return;
      }
      
      // Mark as paid - deduct from balance and reduce loan amount
      data.monthlyBills[billIndex].paid = true;
      data.balance -= bill.amount;
      loan.currentAmount = Math.max(0, loan.currentAmount - bill.amount);
      loan.lastPayment = new Date().toISOString().split('T')[0];
      
      toast({
        title: t('payment_processed'),
        description: `${bill.name} ${t('marked_as_paid')}`
      });
    } else {
      // Mark as unpaid - add back to balance and loan amount
      data.monthlyBills[billIndex].paid = false;
      data.balance += bill.amount;
      loan.currentAmount += bill.amount;
      
      toast({
        title: t('payment_reversed'),
        description: `${bill.name} ${t('marked_as_unpaid')}`
      });
    }
    
    saveFinancialData(data);
    window.location.reload(); // Refresh to show updated data
  };

  const displayedLoans = showAll ? loans : loans.slice(0, 2);

  // Get payment status for each loan
  const getPaymentStatus = (loanId: number) => {
    const data = loadFinancialData();
    if (!data) return false;
    
    const loan = data.loans?.find(l => l.id === loanId);
    if (!loan) return false;
    
    const bill = data.monthlyBills.find(b => b.name === loan.name && (b.type === 'laina' || b.type === 'luottokortti' || b.type === 'loan_payment' || b.type === 'credit_payment'));
    return bill?.paid || false;
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <CreditCard size={20} />
          <span>{t('loans_credits')}</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNavigateToLoans}
          className="text-white hover:bg-white/10 p-2"
        >
          <ArrowRight size={20} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-white/70 text-sm">{t('total_debt')}</p>
            <p className="text-white font-semibold">€{totalLoanAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">{t('monthly_payments')}</p>
            <p className="text-white font-semibold">€{totalMonthlyPayments.toFixed(2)}</p>
          </div>
        </div>
        
        {loans.length > 0 && (
          <div className="space-y-2 mb-4">
            {displayedLoans.map((loan) => {
              const isPaid = getPaymentStatus(loan.id);
              return (
                <div key={loan.id} className={`rounded p-2 ${isPaid ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLoanPayment(loan.id)}
                        className={`p-1 h-6 w-6 ${isPaid ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                      >
                        {isPaid ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
                      </Button>
                      <span className="text-white text-sm font-medium">{loan.name}</span>
                    </div>
                    <span className={`text-sm ${isPaid ? 'text-green-400' : 'text-red-300'}`}>€{loan.currentAmount.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
            {loans.length > 2 && (
              <Button
                variant="ghost"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-white/70 hover:text-white hover:bg-white/10 text-sm"
              >
                {showAll ? 'Näytä vähemmän' : `+${loans.length - 2} lisää`}
              </Button>
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleNavigateToLoans}
          className="w-full text-white hover:bg-white/10"
        >
          {t('manage_loans_credits')}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoansCreditsCard;
