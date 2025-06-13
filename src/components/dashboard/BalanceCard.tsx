
import React from 'react';
import { Plus, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface BalanceCardProps {
  balance: number;
}

const BalanceCard = ({ balance }: BalanceCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-[#294D73] to-[#1f3a5f] border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <Wallet size={20} />
          <span>{t('balance')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white mb-4">
          €{balance.toFixed(2)}
        </div>
        <Button 
          onClick={() => navigate('/add')}
          className="w-full bg-white text-[#294D73] hover:bg-gray-100"
        >
          <Plus size={16} className="mr-2" />
          {t('quick_add')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
