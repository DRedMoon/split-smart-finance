
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CreditCard, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { calculateCreditPayment } from '@/services/calculationService';

interface LoanSummaryCardProps {
  loans: any[];
}

const LoanSummaryCard = ({ loans }: LoanSummaryCardProps) => {
  const { t } = useSafeLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!loans || loans.length === 0) {
    return null;
  }

  const calculateLoanDetails = (loan: any) => {
    if (loan.remaining === 'Credit Card') {
      if (loan.currentAmount > 0 && loan.rate > 0) {
        const calculation = calculateCreditPayment(
          loan.currentAmount,
          loan.rate,
          loan.managementFee || 0,
          loan.minimumPercent || 3
        );
        return {
          monthlyPayment: calculation.monthlyMinimum,
          totalPayback: calculation.totalWithInterest,
          interestAmount: calculation.totalWithInterest - loan.currentAmount
        };
      }
    } else {
      const termMonths = parseInt(loan.remaining.match(/\d+/)?.[0] || '12');
      if (termMonths > 0 && loan.monthly > 0) {
        const totalPayback = loan.monthly * termMonths;
        return {
          monthlyPayment: loan.monthly,
          totalPayback: totalPayback,
          interestAmount: totalPayback - loan.currentAmount
        };
      }
    }
    return {
      monthlyPayment: loan.monthly || 0,
      totalPayback: 0,
      interestAmount: 0
    };
  };

  const totalMonthlyPayments = loans.reduce((sum, loan) => {
    const details = calculateLoanDetails(loan);
    return sum + details.monthlyPayment;
  }, 0);

  const totalDebt = loans.reduce((sum, loan) => sum + loan.currentAmount, 0);
  const totalInterest = loans.reduce((sum, loan) => {
    const details = calculateLoanDetails(loan);
    return sum + details.interestAmount;
  }, 0);

  const displayedLoans = isExpanded ? loans : loans.slice(0, 2);
  const remainingCount = loans.length - 2;

  return (
    <Card className="mt-6 bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white">{t('loans_summary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white/70 text-sm">{t('total_debt')}</p>
            <p className="text-white font-bold">€{totalDebt.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">{t('monthly_total')}</p>
            <p className="text-white font-bold">€{totalMonthlyPayments.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">{t('total_interest')}</p>
            <p className="text-red-300 font-bold">€{totalInterest.toFixed(2)}</p>
          </div>
        </div>

        {/* Loan List */}
        <div className="space-y-2">
          {displayedLoans.map((loan) => {
            const details = calculateLoanDetails(loan);
            const isCredit = loan.remaining === 'Credit Card';
            
            return (
              <div key={loan.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isCredit ? <CreditCard size={16} className="text-red-400" /> : <Coins size={16} className="text-blue-400" />}
                  <div>
                    <p className="text-white font-medium text-sm">{loan.name}</p>
                    <p className="text-white/60 text-xs">€{loan.currentAmount.toFixed(2)} {isCredit ? t('used') : t('remaining')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-sm">€{details.monthlyPayment.toFixed(2)}</p>
                  <p className="text-white/60 text-xs">{t('monthly')}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expand/Collapse Button */}
        {loans.length > 2 && (
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-white/70 hover:text-white hover:bg-white/10"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} className="mr-2" />
                {t('show_less')}
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-2" />
                +{remainingCount} {t('more')}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanSummaryCard;
