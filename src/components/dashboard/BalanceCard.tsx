
import React from 'react';
import { Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

interface BalanceCardProps {
  balance: number;
  currentSlide?: number;
}

const BalanceCard = ({ balance, currentSlide = 0 }: BalanceCardProps) => {
  const { t } = useSafeLanguage();

  return (
    <Card className="bg-gradient-to-r from-[#294D73] to-[#1f3a5f] border-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <Wallet size={20} />
          <span>{t('balance')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold text-white">
          €{balance.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
