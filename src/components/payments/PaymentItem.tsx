
import React from 'react';
import { CheckCircle, Circle, Clock, CreditCard, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentItemProps {
  bill: any;
  onTogglePaid: (billId: number) => void;
  getDaysUntilDue: (dueDate: string) => number;
}

const PaymentItem = ({ bill, onTogglePaid, getDaysUntilDue }: PaymentItemProps) => {
  const { t } = useLanguage();
  const daysUntilDue = getDaysUntilDue(bill.dueDate);
  const isOverdue = daysUntilDue < 0;
  const isDueToday = daysUntilDue === 0;
  const isDueSoon = daysUntilDue > 0 && daysUntilDue <= 3;
  const isPaid = bill.paid || false; // Use consistent 'paid' property

  const getStatusBadge = () => {
    if (isPaid) {
      return <Badge className="bg-green-500 text-white">Maksettu</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">{t('overdue')}</Badge>;
    }
    if (isDueToday) {
      return <Badge className="bg-orange-500 text-white">{t('due_today')}</Badge>;
    }
    if (isDueSoon) {
      return <Badge className="bg-yellow-500 text-black">{t('due_soon')}</Badge>;
    }
    return <Badge className="bg-red-500 text-white">Maksamaton</Badge>;
  };

  const getIcon = () => {
    if (bill.category === 'Loan' || bill.category === 'Credit Card') {
      return <CreditCard size={20} className="text-blue-400" />;
    }
    return <Receipt size={20} className="text-green-400" />;
  };

  const getStatusText = () => {
    if (isPaid) {
      return <span className="text-green-400 text-sm font-medium">Maksettu</span>;
    }
    return <span className="text-red-400 text-sm font-medium">Maksamaton</span>;
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <div>
              <h3 className="text-white font-medium">{bill.name}</h3>
              <p className="text-white/70 text-sm">{bill.category}</p>
              {getStatusText()}
            </div>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-white font-bold">€{bill.amount.toFixed(2)}</p>
              <p className="text-white/70 text-sm flex items-center">
                <Clock size={14} className="mr-1" />
                {bill.dueDate}
              </p>
            </div>
            {daysUntilDue !== null && (
              <div className="text-sm">
                {isOverdue ? (
                  <p className="text-red-400">{Math.abs(daysUntilDue)} {t('days_overdue')}</p>
                ) : isDueToday ? (
                  <p className="text-orange-400">{t('due_today')}</p>
                ) : (
                  <p className="text-white/70">{daysUntilDue} {t('days_left')}</p>
                )}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePaid(bill.id)}
            className="text-white hover:bg-white/10"
          >
            {isPaid ? (
              <CheckCircle size={20} className="text-green-400" />
            ) : (
              <Circle size={20} className="text-white/50" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentItem;
