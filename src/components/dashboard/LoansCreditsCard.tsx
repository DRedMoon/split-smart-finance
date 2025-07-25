
import React, { useState } from 'react';
import { ArrowRight, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useNavigate } from 'react-router-dom';

interface LoansCreditsCardProps {
  loans: any[];
  totalLoanAmount: number;
  totalMonthlyPayments: number;
  currentSlide?: number;
}

const LoansCreditsCard = ({ loans, totalLoanAmount, totalMonthlyPayments, currentSlide = 0 }: LoansCreditsCardProps) => {
  const { t } = useSafeLanguage();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const handleNavigateToLoans = () => {
    localStorage.setItem('dashboardLastView', 'loans-credits');
    navigate('/loans-credits');
  };

  const displayedLoans = showAll ? loans : loans.slice(0, 2);

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <CreditCard size={20} />
          <span>{t('loans_credits')}</span>
        </CardTitle>
        <div className="flex items-center justify-end mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNavigateToLoans}
            className="text-white hover:bg-white/10"
          >
            <ArrowRight size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
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
              <div key={loan.id} className="rounded-md p-3 bg-red-500/20 border border-red-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{loan.name}</span>
                  <span className="text-red-300">€{loan.currentAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {loans.length > 2 && (
              <Button
                variant="ghost"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-white/70 hover:text-white hover:bg-white/10"
              >
                {showAll ? t('show_less') : `+${loans.length - 2} ${t('more')}`}
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
