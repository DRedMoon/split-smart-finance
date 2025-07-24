
import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useNavigate } from 'react-router-dom';

interface RecentTransactionsCardProps {
  recentTransactions: any[];
  isExpandedView?: boolean;
  maxHeight?: string;
}

const RecentTransactionsCard = ({ 
  recentTransactions, 
  isExpandedView = false, 
  maxHeight 
}: RecentTransactionsCardProps) => {
  const { t } = useSafeLanguage();
  const navigate = useNavigate();

  // Apply height constraints based on view type
  const cardStyle = maxHeight ? { maxHeight, height: maxHeight } : {};
  const cardClasses = 'bg-[#294D73] border-none flex flex-col';

  return (
    <Card className={cardClasses} style={cardStyle}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 flex-shrink-0">
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
      <CardContent className="flex-1 min-h-0 flex flex-col pt-0">
        {recentTransactions.length === 0 ? (
          <p className="text-white/70 text-center py-8">{t('no_transactions')}</p>
        ) : (
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
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
                        <p className="text-white font-medium">{transaction.name}</p>
                        <p className="text-white/70 text-sm">{transaction.date}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
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
