
import React from 'react';
import { CreditCard, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateInterestFromPayments } from '@/services/calculationService';

interface LoanCardProps {
  loan: any;
  calculateLoanDetails: (loan: any) => {
    monthlyPayment: number;
    totalPayback: number;
    interestAmount: number;
    remainingMonths: number | string;
  };
}

const LoanCard = ({ loan, calculateLoanDetails }: LoanCardProps) => {
  const { t } = useLanguage();
  
  const details = calculateLoanDetails(loan);
  const isCredit = loan.remaining === 'Credit Card';
  const progress = loan.totalAmount > 0 ? ((loan.totalAmount - loan.currentAmount) / loan.totalAmount) * 100 : 0;

  // Calculate the display rate using the same logic as ManageLoansCredits
  const calculateDisplayRate = () => {
    if (!isCredit && loan.totalAmount > 0 && loan.monthly > 0 && loan.remaining) {
      const termMonths = parseInt(loan.remaining.match(/\d+/)?.[0] || '12');
      if (termMonths > 0) {
        const calculation = calculateInterestFromPayments(
          loan.totalAmount,
          loan.monthly,
          loan.managementFee || 0,
          termMonths
        );
        return calculation.yearlyRate || 0;
      }
    }
    
    // Fallback to stored rate or calculated rate
    return (loan.euriborRate && loan.personalMargin) 
      ? loan.euriborRate + loan.personalMargin 
      : (loan.rate || loan.yearlyInterestRate || 0);
  };

  const displayRate = calculateDisplayRate();

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isCredit ? <CreditCard size={20} /> : <Coins size={20} />}
            <span>{loan.name}</span>
          </div>
          <Badge variant={isCredit ? 'secondary' : 'default'} className="text-xs">
            {isCredit ? t('credit_card') : t('loan')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/70">
            <span>{isCredit ? t('used_credit') : t('paid_off')}</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${isCredit ? 'bg-red-400' : 'bg-green-400'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Amount Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/70">{isCredit ? t('credit_limit') : t('original_amount')}</p>
            <p className="text-white font-medium">€{loan.totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-white/70">{isCredit ? t('available_credit') : t('remaining_balance')}</p>
            <p className="text-white font-medium">€{loan.currentAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/70">{t('monthly_payment')}</p>
            <p className="text-white font-medium">€{details.monthlyPayment.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-white/70">{t('interest_rate')}</p>
            <p className="text-white font-medium">{displayRate.toFixed(2)}%</p>
          </div>
        </div>

        {/* Advanced Details */}
        <div className="border-t border-white/20 pt-3 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/70">{t('total_payback')}</p>
              <p className="text-white font-bold">€{details.totalPayback.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white/70">{t('total_interest')}</p>
              <p className="text-red-300 font-medium">€{details.interestAmount.toFixed(2)}</p>
            </div>
          </div>
          
          {!isCredit && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/70">{t('remaining_months')}</p>
                <p className="text-white font-medium">{details.remainingMonths}</p>
              </div>
              <div>
                <p className="text-white/70">{t('due_date')}</p>
                <p className="text-white font-medium">{loan.dueDate}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCard;
