
import React from 'react';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

interface TransactionItemProps {
  transaction: any;
  onEdit: (transaction: any) => void;
  onDelete: (id: number) => void;
}

const TransactionItem = ({ transaction, onEdit, onDelete }: TransactionItemProps) => {
  const { t } = useLanguage();

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      food: '🍔',
      transport: '🚗',
      utilities: '💡',
      shopping: '🛍️',
      loan: '🏦',
      salary: '💰',
      insurance: '🛡️',
      subscriptions: '📺',
      entertainment: '🎬',
      income: '💰',
      other: '📝'
    };
    return emojis[category] || '📝';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return t('income');
      case 'expense': return t('expense');
      case 'loan': return t('loan');
      default: return type;
    }
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getCategoryEmoji(transaction.category)}
            </div>
            <div>
              <div className="font-medium text-white">{transaction.name}</div>
              <div className="text-sm text-white/60">
                {transaction.date} • {t(transaction.category)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className={`font-bold ${
                transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
              </div>
              <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                {getTypeLabel(transaction.type)}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(transaction)}>
                  <Edit size={16} className="mr-2" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(transaction.id)}
                  className="text-red-600"
                >
                  <Trash size={16} className="mr-2" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionItem;
