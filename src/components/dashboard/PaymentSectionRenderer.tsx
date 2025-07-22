
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import PaymentBillItem from './PaymentBillItem';

interface PaymentSectionRendererProps {
  title: string;
  bills: any[];
  totalAmount: number;
  paidAmount: number;
  showAll: boolean;
  onToggleShowAll: () => void;
  onTogglePaid: (billId: string | number, event: React.MouseEvent) => void;
  isLoanSection?: boolean;
}

const PaymentSectionRenderer = ({ 
  title, 
  bills, 
  totalAmount, 
  paidAmount, 
  showAll, 
  onToggleShowAll, 
  onTogglePaid,
  isLoanSection = false 
}: PaymentSectionRendererProps) => {
  const { t } = useLanguage();
  const displayedBills = showAll ? bills : bills.slice(0, 2);

  if (bills.length === 0 && isLoanSection) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-white font-medium mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-white/70 text-sm">{t('total')}</p>
          <p className="text-white font-semibold">€{totalAmount.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-white/70 text-sm">{t('paid')}</p>
          <p className="text-green-400 font-semibold">€{paidAmount.toFixed(2)}</p>
        </div>
      </div>
      
      {bills.length > 0 ? (
        <div className="space-y-2 mb-4">
          {displayedBills.map(bill => (
            <PaymentBillItem 
              key={bill.id} 
              bill={bill} 
              isLoanPayment={isLoanSection}
              onTogglePaid={onTogglePaid}
            />
          ))}
          {bills.length > 2 && (
            <Button
              variant="ghost"
              onClick={onToggleShowAll}
              className="w-full text-white/70 hover:text-white hover:bg-white/10 text-sm"
            >
              {showAll ? t('show_less') : `+${bills.length - 2} ${t('more')}`}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-white/60 text-sm mb-4">{t('no_bills')}</p>
      )}
    </div>
  );
};

export default PaymentSectionRenderer;
