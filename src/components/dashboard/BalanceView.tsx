import React from 'react';
import BalanceCard from './BalanceCard';
import DashboardNavigation from './DashboardNavigation';
import UpcomingWeekCard from './UpcomingWeekCard';
import RecentTransactionsCard from './RecentTransactionsCard';

interface BalanceViewProps {
  balance: number;
  currentSlide: number;
  filteredWeekPayments: any[];
  sortedRecentTransactions: any[];
  className?: string;
}

const BalanceView = ({ 
  balance, 
  currentSlide, 
  filteredWeekPayments, 
  sortedRecentTransactions,
  className = ""
}: BalanceViewProps) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Balance Card */}
      <div className="flex-shrink-0 mb-4">
        <BalanceCard balance={balance} currentSlide={currentSlide} />
      </div>

      {/* Navigation Buttons */}
      <div className="flex-shrink-0 mb-4">
        <DashboardNavigation />
      </div>

      {/* This Week's Upcoming Payments */}
      <div className="flex-shrink-0 mb-4">
        <UpcomingWeekCard filteredWeekPayments={filteredWeekPayments} />
      </div>

      {/* Recent Transactions - Limit to 40% of viewport */}
      <div className="flex-1 min-h-0">
        <RecentTransactionsCard 
          recentTransactions={sortedRecentTransactions} 
          isExpandedView={false}
          maxHeight="40vh"
        />
      </div>
    </div>
  );
};

export default BalanceView;