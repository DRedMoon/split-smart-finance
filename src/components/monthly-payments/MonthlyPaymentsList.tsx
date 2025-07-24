
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import PaymentItem from '../payments/PaymentItem';

interface MonthlyPaymentsListProps {
  regularBills: any[];
  loanCreditPayments: any[];
  showAllPayments: boolean;
  showAllLoanCredit: boolean;
  onToggleShowAllPayments: (show: boolean) => void;
  onToggleShowAllLoanCredit: (show: boolean) => void;
  onTogglePaid: (billId: string | number) => void;
  getDaysUntilDue: (dueDate: string) => number | null;
}

const MonthlyPaymentsList = ({
  regularBills,
  loanCreditPayments,
  showAllPayments,
  showAllLoanCredit,
  onToggleShowAllPayments,
  onToggleShowAllLoanCredit,
  onTogglePaid,
  getDaysUntilDue
}: MonthlyPaymentsListProps) => {
  const { t } = useSafeLanguage();

  const sortBills = (bills: any[]) => bills.sort((a, b) => {
    // Paid bills go to bottom
    if (a.paid !== b.paid) {
      return a.paid ? 1 : -1;
    }
    // Sort by due date
    return parseInt(a.dueDate) - parseInt(b.dueDate);
  });

  const sortedLoanCredit = sortBills([...loanCreditPayments]);
  const sortedRegular = sortBills([...regularBills]);

  const displayedRegular = showAllPayments ? sortedRegular : sortedRegular.slice(0, 2);
  const displayedLoanCredit = showAllLoanCredit ? sortedLoanCredit : sortedLoanCredit.slice(0, 2);
  const hasMoreRegular = sortedRegular.length > 2;
  const hasMoreLoanCredit = sortedLoanCredit.length > 2;

  return (
    <>
      {/* Loan/Credit Payments */}
      {sortedLoanCredit.length > 0 && (
        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold mb-4">Lainat ja luotot</h2>
          <div className="space-y-4">
            {displayedLoanCredit.map((bill) => (
              <PaymentItem
                key={bill.id}
                bill={bill}
                onTogglePaid={onTogglePaid}
                getDaysUntilDue={getDaysUntilDue}
              />
            ))}
            
            {hasMoreLoanCredit && (
              <Button
                variant="ghost"
                onClick={() => onToggleShowAllLoanCredit(!showAllLoanCredit)}
                className="w-full text-white/70 hover:text-white hover:bg-white/10"
              >
                {showAllLoanCredit ? (
                  <>
                    <ChevronUp size={16} className="mr-2" />
                    Näytä vähemmän
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="mr-2" />
                    +{sortedLoanCredit.length - 2} lisää
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Regular Monthly Payments */}
      <div>
        <h2 className="text-white text-lg font-semibold mb-4">Kuukausimaksut</h2>
        <div className="space-y-4">
          {displayedRegular.length === 0 ? (
            <Card className="bg-[#294D73] border-none">
              <CardContent className="p-6 text-center text-white/70">
                Ei kuukausimaksuja
              </CardContent>
            </Card>
          ) : (
            <>
              {displayedRegular.map((bill) => (
                <PaymentItem
                  key={bill.id}
                  bill={bill}
                  onTogglePaid={onTogglePaid}
                  getDaysUntilDue={getDaysUntilDue}
                />
              ))}
              
              {hasMoreRegular && (
                <Button
                  variant="ghost"
                  onClick={() => onToggleShowAllPayments(!showAllPayments)}
                  className="w-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  {showAllPayments ? (
                    <>
                      <ChevronUp size={16} className="mr-2" />
                      Näytä vähemmän
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className="mr-2" />
                      +{sortedRegular.length - 2} lisää
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MonthlyPaymentsList;
