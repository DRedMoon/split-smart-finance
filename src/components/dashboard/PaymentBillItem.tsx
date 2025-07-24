
import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

interface PaymentBillItemProps {
  bill: any;
  isLoanPayment: boolean;
  onTogglePaid: (billId: string | number, event: React.MouseEvent) => void;
}

const PaymentBillItem = ({ bill, isLoanPayment, onTogglePaid }: PaymentBillItemProps) => {
  const { t } = useSafeLanguage();
  const isPaid = bill.paid || false;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTogglePaid(bill.id, e);
  };
  
  return (
    <div className={`rounded p-2 ${isPaid ? 'bg-green-500/20 border border-green-500/30' : isLoanPayment ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/10'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className={`p-1 h-6 w-6 ${isPaid ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {isPaid ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
          </Button>
          <div>
            <span className="text-white text-sm font-medium">{bill.name}</span>
            <div className="flex items-center space-x-2">
              {isLoanPayment && (
                <span className="text-xs bg-red-500/30 px-1 py-0.5 rounded text-red-200">
                  {bill.category === 'Credit Card' ? t('credit') : t('loan')}
                </span>
              )}
              <span className={`text-xs ${isPaid ? 'text-green-400' : 'text-red-400'}`}>
                {isPaid ? t('paid') : t('unpaid')}
              </span>
            </div>
          </div>
        </div>
        <span className={`text-sm ${isPaid ? 'text-green-400' : isLoanPayment ? 'text-red-300' : 'text-white/70'}`}>€{bill.amount.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PaymentBillItem;
