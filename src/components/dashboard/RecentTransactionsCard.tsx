
import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface RecentTransactionsCardProps {
  recentTransactions: any[];
  isExpandedView?: boolean;
}

const RecentTransactionsCard = ({ recentTransactions, isExpandedView = false }: RecentTransactionsCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // For expanded view, fill available space; for balance view, use fixed height
  const cardClasses = isExpandedView 
    ? 'bg-[#294D73] border-none h-full flex flex-col' 
    : 'bg-[#294D73] border-none flex flex-col h-full';

  return (
    <Card className={cardClasses}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 flex-shrink-0 p-2">
        <CardTitle className="text-white text-lg">{t('recent_transactions')}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/transactions')}
          className="text-white hover:bg-white/10 p-1"
        >
          <ArrowRight size={16} />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col p-2 pt-0">
        {recentTransactions.length === 0 ? (
          <p className="text-white/70 text-center py-4 text-sm">{t('no_transactions')}</p>
        ) : (
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-full ${transaction.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {transaction.amount > 0 ? 
                          <TrendingUp size={14} className="text-green-400" /> : 
                          <TrendingDown size={14} className="text-red-400" />
                        }
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{transaction.name}</p>
                        <p className="text-white/70 text-xs">{transaction.date}</p>
                      </div>
                    </div>
                    <p className={`font-semibold text-sm ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsCard;
