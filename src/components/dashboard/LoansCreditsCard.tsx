
import React, { useState } from 'react';
import { ArrowRight, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface LoansCreditsCardProps {
  loans: any[];
  totalLoanAmount: number;
  totalMonthlyPayments: number;
}

const LoansCreditsCard = ({ loans, totalLoanAmount, totalMonthlyPayments }: LoansCreditsCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const handleNavigateToLoans = () => {
    localStorage.setItem('dashboardLastView', 'loans-credits');
    navigate('/loans-credits');
  };

  const displayedLoans = showAll ? loans : loans.slice(0, 2);

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
            {displayedLoans.map((loan) => (
              <div key={loan.id} className="rounded p-2 bg-red-500/20 border border-red-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-medium">{loan.name}</span>
                  <span className="text-sm text-red-300">€{loan.currentAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
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
