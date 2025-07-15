
import React from 'react';
import DashboardNavigation from './DashboardNavigation';
import UpcomingWeekCard from './UpcomingWeekCard';
import RecentTransactionsCard from './RecentTransactionsCard';

interface DashboardContentProps {
  isBalanceView: boolean;
  filteredWeekPayments: any[];
  sortedRecentTransactions: any[];
}

const DashboardContent = React.memo(({ 
  isBalanceView, 
  filteredWeekPayments, 
  sortedRecentTransactions 
}: DashboardContentProps) => {
  return (
    <>
      {/* Navigation Buttons - Only render on Balance view */}
      {isBalanceView && <DashboardNavigation />}

      {/* This Week's Upcoming Payments - Only render on Balance view */}
      {isBalanceView && (
        <div className="flex-shrink-0 mb-1">
          <UpcomingWeekCard filteredWeekPayments={filteredWeekPayments} />
        </div>
      )}

      {/* Recent Transactions - Fill remaining space */}
      <div className="flex-1 min-h-0 flex flex-col">
        <RecentTransactionsCard 
          recentTransactions={sortedRecentTransactions} 
          isExpandedView={!isBalanceView}
        />
      </div>
    </>
  );
});

export default DashboardContent;
