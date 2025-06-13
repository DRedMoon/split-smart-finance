
import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface MonthlyPaymentsCardProps {
  monthlyBills: any[];
  totalBillsAmount: number;
}

const MonthlyPaymentsCard = ({ monthlyBills, totalBillsAmount }: MonthlyPaymentsCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
          onClick={() => navigate('/monthly-payments')}
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
            <p className="text-white/70 text-sm">{t('this_month')}</p>
            <p className="text-white font-semibold">{monthlyBills.length} {t('bills')}</p>
          </div>
        </div>
        
        {monthlyBills.length > 0 && (
          <div className="space-y-2 mb-4">
            {monthlyBills.slice(0, 2).map((bill) => (
              <div key={bill.id} className="bg-white/10 rounded p-2">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-medium">{bill.name}</span>
                  <span className="text-white/70 text-sm">€{bill.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {monthlyBills.length > 2 && (
              <p className="text-white/70 text-sm">+{monthlyBills.length - 2} more</p>
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={() => navigate('/monthly-payments')}
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
