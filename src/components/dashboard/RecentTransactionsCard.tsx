
import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface RecentTransactionsCardProps {
  recentTransactions: any[];
}

const RecentTransactionsCard = ({ recentTransactions }: RecentTransactionsCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card className="bg-[#294D73] border-none min-h-[200px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">{t('recent_transactions')}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/transactions')}
          className="text-white hover:bg-white/10"
        >
          <ArrowRight size={16} />
        </Button>
      </CardHeader>
      <CardContent className="pb-6">
        {recentTransactions.length === 0 ? (
          <p className="text-white/70 text-center py-8">{t('no_transactions')}</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {transaction.amount > 0 ? 
                      <TrendingUp size={16} className="text-green-400" /> : 
                      <TrendingDown size={16} className="text-red-400" />
                    }
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{transaction.name}</p>
                    <p className="text-white/70 text-xs">{transaction.date}</p>
                  </div>
                </div>
                <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsCard;
