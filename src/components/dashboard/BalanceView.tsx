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
      <div className="flex-shrink-0 mb-6">
        <BalanceCard balance={balance} currentSlide={currentSlide} />
      </div>

      {/* Empty Space for better visual balance */}
      <div className="flex-1 min-h-[60px]" />

      {/* Navigation Buttons */}
      <div className="flex-shrink-0 mb-4">
        <DashboardNavigation />
      </div>

      {/* This Week's Upcoming Payments */}
      <div className="flex-shrink-0 mb-4">
        <UpcomingWeekCard filteredWeekPayments={filteredWeekPayments} />
      </div>

      {/* Recent Transactions - Fixed height, not filling remaining space */}
      <div className="flex-shrink-0">
        <RecentTransactionsCard 
          recentTransactions={sortedRecentTransactions.slice(0, 5)} 
          isExpandedView={false}
          maxHeight="200px"
        />
      </div>
    </div>
  );
};

export default BalanceView;