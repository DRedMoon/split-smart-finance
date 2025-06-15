
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
  currentSlide?: number;
}

const LoansCreditsCard = ({ loans, totalLoanAmount, totalMonthlyPayments, currentSlide = 0 }: LoansCreditsCardProps) => {
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
      <CardHeader className="pb-1 p-2">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <CreditCard size={20} />
          <span>{t('loans_credits')}</span>
        </CardTitle>
        <div className="flex items-center justify-between mt-1">
          {/* Carousel Indicators */}
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentSlide ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNavigateToLoans}
            className="text-white hover:bg-white/10 p-1"
          >
            <ArrowRight size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <p className="text-white/70 text-xs">{t('total_debt')}</p>
            <p className="text-white font-semibold text-sm">€{totalLoanAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs">{t('monthly_payments')}</p>
            <p className="text-white font-semibold text-sm">€{totalMonthlyPayments.toFixed(2)}</p>
          </div>
        </div>
        
        {loans.length > 0 && (
          <div className="space-y-1 mb-2">
            {displayedLoans.map((loan) => (
              <div key={loan.id} className="rounded p-1 bg-red-500/20 border border-red-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-white text-xs font-medium">{loan.name}</span>
                  <span className="text-xs text-red-300">€{loan.currentAmount.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {loans.length > 2 && (
              <Button
                variant="ghost"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-white/70 hover:text-white hover:bg-white/10 text-xs p-1"
              >
                {showAll ? 'Näytä vähemmän' : `+${loans.length - 2} lisää`}
              </Button>
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleNavigateToLoans}
          className="w-full text-white hover:bg-white/10 text-sm p-1"
        >
          {t('manage_loans_credits')}
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoansCreditsCard;
