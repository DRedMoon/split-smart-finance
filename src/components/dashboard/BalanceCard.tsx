
import React from 'react';
import { Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface BalanceCardProps {
  balance: number;
  currentSlide?: number;
}

const BalanceCard = ({ balance, currentSlide = 0 }: BalanceCardProps) => {
  const { t } = useLanguage();

  return (
    <Card className="bg-gradient-to-r from-[#294D73] to-[#1f3a5f] border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet size={20} />
            <span>{t('balance')}</span>
          </div>
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">
          €{balance.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
