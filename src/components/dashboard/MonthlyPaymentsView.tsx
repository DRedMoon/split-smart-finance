import React from 'react';
import MonthlyPaymentsCard from './MonthlyPaymentsCard';
import RecentTransactionsCard from './RecentTransactionsCard';

interface MonthlyPaymentsViewProps {
  monthlyBills: any[];
  totalBillsAmount: number;
  currentSlide: number;
  sortedRecentTransactions: any[];
  className?: string;
}

const MonthlyPaymentsView = ({ 
  monthlyBills, 
  totalBillsAmount, 
  currentSlide, 
  sortedRecentTransactions,
  className = ""
}: MonthlyPaymentsViewProps) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Monthly Payments Card (simplified - no loans section) */}
      <div className="flex-shrink-0 mb-4">
        <MonthlyPaymentsCard 
          monthlyBills={monthlyBills}
          totalBillsAmount={totalBillsAmount}
          currentSlide={currentSlide}
        />
      </div>

      {/* Recent Transactions - Limit to 50% of viewport */}
      <div className="flex-1 min-h-0">
        <RecentTransactionsCard 
          recentTransactions={sortedRecentTransactions} 
          isExpandedView={true}
          maxHeight="50vh"
        />
      </div>
    </div>
  );
};

export default MonthlyPaymentsView;