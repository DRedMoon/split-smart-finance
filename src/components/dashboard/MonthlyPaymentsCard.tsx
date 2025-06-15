
import React, { useState } from 'react';
import { ArrowRight, Calendar, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import { useToast } from '@/hooks/use-toast';

interface MonthlyPaymentsCardProps {
  monthlyBills: any[];
  totalBillsAmount: number;
}

const MonthlyPaymentsCard = ({ monthlyBills, totalBillsAmount }: MonthlyPaymentsCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);

  const handleTogglePaid = (billId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation when clicking the button
    event.preventDefault();  // Also prevent default behavior
    
    const data = loadFinancialData();
    if (!data) return;

    const billIndex = data.monthlyBills.findIndex((b: any) => b.id === billId);
    if (billIndex === -1) return;

    const bill = data.monthlyBills[billIndex];
    const currentPaidStatus = bill.paid || false;
    const newPaidStatus = !currentPaidStatus;

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
      
      // Mark as paid - deduct from balance
      data.monthlyBills[billIndex].paid = true;
      data.balance -= bill.amount;
      
      toast({
        title: t('payment_processed'),
        description: `${bill.name} ${t('marked_as_paid')}`
      });
    } else {
      // Mark as unpaid - add back to balance
      data.monthlyBills[billIndex].paid = false;
      data.balance += bill.amount;
      
      toast({
        title: t('payment_reversed'),
        description: `${bill.name} ${t('marked_as_unpaid')}`
      });
    }
    
    saveFinancialData(data);
    // Use a custom event to update the parent component
    window.dispatchEvent(new CustomEvent('financial-data-updated'));
  };

  const handleNavigateToMonthlyPayments = () => {
    localStorage.setItem('dashboardLastView', 'monthly-payments');
    navigate('/monthly-payments');
  };

  const displayedBills = showAll ? monthlyBills : monthlyBills.slice(0, 2);
  
  // Calculate paid and unpaid bills using only 'paid' property
  const paidBills = monthlyBills.filter((bill: any) => bill.paid);
  const unpaidBills = monthlyBills.filter((bill: any) => !bill.paid);

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <Calendar size={20} />
          <span>{t('monthly_payments')}</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNavigateToMonthlyPayments}
          className="text-white hover:bg-white/10 p-2"
        >
          <ArrowRight size={20} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-white/70 text-sm">{t('total_bills')}</p>
            <p className="text-white font-semibold">€{totalBillsAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">{t('paid')}</p>
            <p className="text-green-400 font-semibold">€{paidBills.reduce((sum: number, bill: any) => sum + bill.amount, 0).toFixed(2)}</p>
          </div>
        </div>
        
        {monthlyBills.length > 0 && (
          <div className="space-y-2 mb-4">
            {displayedBills.map((bill: any) => {
              const isPaid = bill.paid || false;
              return (
                <div key={bill.id} className={`rounded p-2 ${isPaid ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/10'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleTogglePaid(bill.id, e)}
                        className={`p-1 h-6 w-6 ${isPaid ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                      >
                        {isPaid ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
                      </Button>
                      <span className="text-white text-sm font-medium">{bill.name}</span>
                    </div>
                    <span className={`text-sm ${isPaid ? 'text-green-400' : 'text-white/70'}`}>€{bill.amount.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
            {monthlyBills.length > 2 && (
              <Button
                variant="ghost"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-white/70 hover:text-white hover:bg-white/10 text-sm"
              >
                {showAll ? t('show_less') : `+${monthlyBills.length - 2} ${t('more')}`}
              </Button>
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleNavigateToMonthlyPayments}
          className="w-full text-white hover:bg-white/10"
        >
          {t('view_all_payments')}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default MonthlyPaymentsCard;
