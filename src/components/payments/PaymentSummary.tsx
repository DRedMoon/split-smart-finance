
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentSummaryProps {
  bills: any[];
}

const PaymentSummary = ({ bills }: PaymentSummaryProps) => {
  const { t } = useLanguage();
  
  const totalMonthly = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = bills.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
  const remainingAmount = totalMonthly - paidAmount;

  return (
    <Card className="mb-6 bg-[#1a4a6b] border-none">
      <CardHeader>
        <CardTitle className="text-white">{t('monthly_summary')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-white">
          <div className="flex justify-between">
            <span>{t('total_monthly')}:</span>
            <span className="font-bold">€{totalMonthly.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('paid')}:</span>
            <span className="font-bold text-green-400">€{paidAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('remaining')}:</span>
            <span className="font-bold text-red-300">€{remainingAmount.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
