
import React from 'react';
import { Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

interface LoanCalculationDisplayProps {
  calculatedValues: {
    monthlyPayment: number;
    totalPayback: number;
    yearlyRate: number;
    estimatedEuribor: number;
    estimatedMargin: number;
  };
}

const LoanCalculationDisplay = ({ calculatedValues }: LoanCalculationDisplayProps) => {
  const { t } = useSafeLanguage();

  if (calculatedValues.monthlyPayment === 0 && calculatedValues.estimatedEuribor === 0) {
    return null;
  }

  return (
    <Card className="mb-4 bg-green-500/20 border-green-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Calculator size={20} className="mr-2" />
          {t('calculated_values')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {calculatedValues.monthlyPayment > 0 && (
            <div>
              <p className="text-white/70">{t('monthly_payment')}</p>
              <p className="text-white font-medium">€{calculatedValues.monthlyPayment.toFixed(2)}</p>
            </div>
          )}
          {calculatedValues.totalPayback > 0 && (
            <div>
              <p className="text-white/70">{t('total_payback')}</p>
              <p className="text-white font-medium">€{calculatedValues.totalPayback.toFixed(2)}</p>
            </div>
          )}
          {calculatedValues.estimatedEuribor > 0 && (
            <div>
              <p className="text-white/70">Arvioitu Euribor</p>
              <p className="text-white font-medium">{calculatedValues.estimatedEuribor.toFixed(2)}%</p>
            </div>
          )}
          {calculatedValues.estimatedMargin > 0 && (
            <div>
              <p className="text-white/70">Arvioitu marginaali</p>
              <p className="text-white font-medium">{calculatedValues.estimatedMargin.toFixed(2)}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCalculationDisplay;
