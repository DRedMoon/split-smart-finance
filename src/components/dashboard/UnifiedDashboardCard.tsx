import React from 'react';
import BalanceCard from './BalanceCard';
import LoansCreditsCard from './LoansCreditsCard';
import MonthlyPaymentsCard from './MonthlyPaymentsCard';

interface UnifiedDashboardCardProps {
  currentSlide: number;
  balance: number;
  loans: any[];
  monthlyBills: any[];
  totalLoanAmount: number;
  totalMonthlyPayments: number;
  totalBillsAmount: number;
}

const UnifiedDashboardCard = ({
  currentSlide,
  balance,
  loans,
  monthlyBills,
  totalLoanAmount,
  totalMonthlyPayments,
  totalBillsAmount
}: UnifiedDashboardCardProps) => {
  
  if (currentSlide === 0) {
    return <BalanceCard balance={balance} currentSlide={currentSlide} />;
  } else if (currentSlide === 1) {
    return (
      <LoansCreditsCard 
        loans={loans}
        totalLoanAmount={totalLoanAmount}
        totalMonthlyPayments={totalMonthlyPayments}
        currentSlide={currentSlide}
      />
    );
  } else if (currentSlide === 2) {
    return (
      <MonthlyPaymentsCard 
        monthlyBills={monthlyBills}
        totalBillsAmount={totalBillsAmount}
        currentSlide={currentSlide}
      />
    );
  }
  
  return <BalanceCard balance={balance} currentSlide={currentSlide} />;
};

export default UnifiedDashboardCard;