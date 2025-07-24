
import React, { useEffect, useState } from 'react';
import { useDashboardNavigation } from '@/hooks/useDashboardNavigation';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { SwipeableCarousel } from './dashboard/SwipeableCarousel';
import UnifiedDashboardCard from './dashboard/UnifiedDashboardCard';
import DashboardNavigation from './dashboard/DashboardNavigation';
import UpcomingWeekCard from './dashboard/UpcomingWeekCard';
import RecentTransactionsCard from './dashboard/RecentTransactionsCard';
import DashboardSkeleton from './ui/DashboardSkeleton';

const Dashboard = () => {
  const { t } = useSafeLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const { 
    initialView, 
    navigationReady, 
    currentSlide,
    navigateToView
  } = useDashboardNavigation();
  
  
  const {
    balance,
    loans,
    monthlyBills,
    totalLoanAmount,
    totalMonthlyPayments,
    totalBillsAmount,
    sortedRecentTransactions,
    filteredWeekPayments
  } = useFinancialData(refreshKey);
  
  // Listen for financial data updates and reschedule notifications
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log('Dashboard - Financial data updated, refreshing...');
      setRefreshKey(prev => prev + 1);
      
      // Update notifications when payment data changes
      import('@/services/notificationService').then(({ notificationService }) => {
        notificationService.onPaymentDataUpdated().catch(console.error);
      });
    };

    window.addEventListener('financial-data-updated', handleDataUpdate);
    return () => {
      window.removeEventListener('financial-data-updated', handleDataUpdate);
    };
  }, []);

  // Debug logging for startup process
  console.log('Dashboard render state:', { 
    navigationReady, 
    hasBalance: balance !== undefined, 
    hasLoans: loans !== undefined,
    hasData: !!balance || !!loans?.length || !!monthlyBills?.length
  });

  // Show loading only while navigation is not ready (simplified loading condition)
  if (!navigationReady) {
    console.log('Dashboard: Showing skeleton - navigation not ready');
    return <DashboardSkeleton />;
  }

  // Use currentSlide as single source of truth
  const activeView = currentSlide;

  return (
    <div className="h-screen bg-sidebar p-4 pb-20 max-w-md mx-auto flex flex-col overflow-y-auto">
      {/* Red: Title */}
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-sidebar-foreground">{t('payments')}</h1>
      </div>

      {/* Blue: Swipeable Balance/Loans/Monthly Cards */}
      <div className="flex-shrink-0 mb-4">
        <SwipeableCarousel
          currentSlide={currentSlide}
          onSlideChange={navigateToView}
        >
          <UnifiedDashboardCard
            currentSlide={0}
            balance={balance}
            loans={loans}
            monthlyBills={monthlyBills}
            totalLoanAmount={totalLoanAmount}
            totalMonthlyPayments={totalMonthlyPayments}
            totalBillsAmount={totalBillsAmount}
          />
          <UnifiedDashboardCard
            currentSlide={1}
            balance={balance}
            loans={loans}
            monthlyBills={monthlyBills}
            totalLoanAmount={totalLoanAmount}
            totalMonthlyPayments={totalMonthlyPayments}
            totalBillsAmount={totalBillsAmount}
          />
          <UnifiedDashboardCard
            currentSlide={2}
            balance={balance}
            loans={loans}
            monthlyBills={monthlyBills}
            totalLoanAmount={totalLoanAmount}
            totalMonthlyPayments={totalMonthlyPayments}
            totalBillsAmount={totalBillsAmount}
          />
        </SwipeableCarousel>
      </div>

      {/* Purple: Empty space for visual balance */}
      <div className="flex-1 min-h-[40px] max-h-[80px]" />

      {/* Green: Navigation Buttons (Tulevat, Tapahtumat) */}
      <div className="flex-shrink-0 mb-4">
        <DashboardNavigation />
      </div>

      {/* Yellow: Upcoming Week Card */}
      <div className="flex-shrink-0 mb-4">
        <UpcomingWeekCard filteredWeekPayments={filteredWeekPayments} />
      </div>

      {/* Cyan: Recent Transactions */}
      <div className="flex-1 min-h-0">
        <RecentTransactionsCard 
          recentTransactions={sortedRecentTransactions.slice(0, 8)} 
          isExpandedView={false}
          maxHeight="300px"
        />
      </div>
    </div>
  );
};

export default Dashboard;
