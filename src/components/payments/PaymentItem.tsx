
import React from 'react';
import { Check, X, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

interface PaymentItemProps {
  bill: any;
  onTogglePaid: (billId: string | number) => void;
  getDaysUntilDue: (dueDate: string) => number | null;
}

const PaymentItem = ({ bill, onTogglePaid, getDaysUntilDue }: PaymentItemProps) => {
  const { t } = useSafeLanguage();
  const isPaid = bill.paid || false;
  const daysUntilDue = getDaysUntilDue(bill.dueDate);
  const isLoanCredit = bill.category === 'Loan' || bill.category === 'Credit Card' || 
                      bill.type === 'loan_payment' || bill.type === 'credit_payment';

  const handleTogglePaid = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTogglePaid(bill.id);
  };

  const getCardBackground = () => {
    if (isPaid) return 'bg-green-500/20 border border-green-500/30';
    if (isLoanCredit) return 'bg-red-500/20 border border-red-500/30';
    return 'bg-[#294D73] border-none';
  };

  const getDueDateColor = () => {
    if (isPaid) return 'text-green-400';
    if (daysUntilDue !== null && daysUntilDue <= 3) return 'text-red-400';
    if (daysUntilDue !== null && daysUntilDue <= 7) return 'text-orange-400';
    return 'text-white/70';
  };

  const getDueDateText = () => {
    if (daysUntilDue !== null && !isPaid) {
      if (daysUntilDue === 0) return ` (${t('today')})`;
      return ` (${daysUntilDue} ${t('days_short')})`;
    }
    return '';
  };

  return (
    <Card className={getCardBackground()}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTogglePaid}
              className={`p-2 h-8 w-8 ${isPaid ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {isPaid ? <Check size={14} className="text-white" /> : <X size={14} className="text-white" />}
            </Button>
            <div>
              <div className="font-medium text-white">{bill.name}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar size={12} className={getDueDateColor()} />
                <span className={`text-sm ${getDueDateColor()}`}>
                  {bill.dueDate}
                  {getDueDateText()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold text-lg ${isPaid ? 'text-green-400' : isLoanCredit ? 'text-red-300' : 'text-white'}`}>
              €{bill.amount.toFixed(2)}
            </div>
            <div className="flex items-center space-x-1 mt-1">
              {isLoanCredit && (
                <Badge variant="outline" className="text-xs border-red-300 text-red-300">
                  {bill.category === 'Credit Card' ? t('credit') : t('loan')}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`text-xs ${isPaid ? 'border-green-300 text-green-300' : 'border-white/30 text-white/70'}`}
              >
                {isPaid ? t('paid') : t('unpaid')}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentItem;
