import React from 'react';
import LoansCreditsCard from './LoansCreditsCard';
import RecentTransactionsCard from './RecentTransactionsCard';

interface LoansCreditsViewProps {
  loans: any[];
  totalLoanAmount: number;
  totalMonthlyPayments: number;
  currentSlide: number;
  sortedRecentTransactions: any[];
  className?: string;
}

const LoansCreditsView = ({ 
  loans, 
  totalLoanAmount, 
  totalMonthlyPayments, 
  currentSlide, 
  sortedRecentTransactions,
  className = ""
}: LoansCreditsViewProps) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Loans & Credits Card */}
      <div className="flex-shrink-0 mb-4">
        <LoansCreditsCard 
          loans={loans}
          totalLoanAmount={totalLoanAmount}
          totalMonthlyPayments={totalMonthlyPayments}
          currentSlide={currentSlide}
        />
      </div>

      {/* Recent Transactions - Take up ~50% of screen */}
      <div className="flex-1 min-h-0" style={{ minHeight: '50vh' }}>
        <RecentTransactionsCard 
          recentTransactions={sortedRecentTransactions} 
          isExpandedView={true}
        />
      </div>
    </div>
  );
};

export default LoansCreditsView;