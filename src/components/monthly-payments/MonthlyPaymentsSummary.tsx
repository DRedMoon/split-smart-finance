
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentTotals {
  totalRegular: number;
  paidRegular: number;
  remainingRegular: number;
  totalLoanCredit: number;
  paidLoanCredit: number;
  remainingLoanCredit: number;
}

interface MonthlyPaymentsSummaryProps {
  totals: PaymentTotals;
}

const MonthlyPaymentsSummary = ({ totals }: MonthlyPaymentsSummaryProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 mb-6">
      {/* Regular Bills Summary */}
      <Card className="bg-[#1a4a6b] border-none">
        <CardContent className="p-4">
          <h3 className="text-white font-medium mb-3">Kuukausimaksut</h3>
          <div className="space-y-2 text-white text-sm">
            <div className="flex justify-between">
              <span>Yhteensä kuukaudessa:</span>
              <span className="font-bold">€{totals.totalRegular.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Maksettu:</span>
              <span className="font-bold text-green-400">€{totals.paidRegular.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Jäljellä:</span>
              <span className="font-bold text-red-300">€{totals.remainingRegular.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan/Credit Summary */}
      {totals.totalLoanCredit > 0 && (
        <Card className="bg-[#1a4a6b] border-none">
          <CardContent className="p-4">
            <h3 className="text-white font-medium mb-3">Lainat ja luotot</h3>
            <div className="space-y-2 text-white text-sm">
              <div className="flex justify-between">
                <span>Yhteensä kuukaudessa:</span>
                <span className="font-bold">€{totals.totalLoanCredit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Maksettu:</span>
                <span className="font-bold text-green-400">€{totals.paidLoanCredit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Jäljellä:</span>
                <span className="font-bold text-red-300">€{totals.remainingLoanCredit.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MonthlyPaymentsSummary;
