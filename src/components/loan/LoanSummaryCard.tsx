
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoanSummaryCardProps {
  loans: any[];
}

const LoanSummaryCard = ({ loans }: LoanSummaryCardProps) => {
  const { t } = useLanguage();

  if (!loans?.length) return null;

  return (
    <Card className="mt-6 bg-[#1a4a6b] border-none">
      <CardHeader>
        <CardTitle className="text-white">{t('total_overview')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-white">
          <div className="flex justify-between">
            <span>{t('total_debt')}:</span>
            <span className="font-bold">
              €{loans.reduce((sum, loan) => sum + loan.currentAmount, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('monthly_payments')}:</span>
            <span className="font-bold text-red-300">
              €{loans.reduce((sum, loan) => sum + (loan.monthly || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanSummaryCard;
