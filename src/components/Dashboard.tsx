
import React, { useEffect, useState } from 'react';
import { useDashboardNavigation } from '@/hooks/useDashboardNavigation';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import BalanceView from './dashboard/BalanceView';
import LoansCreditsView from './dashboard/LoansCreditsView';
import MonthlyPaymentsView from './dashboard/MonthlyPaymentsView';
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
    currentView,
    isTransitioning,
    swipeHandlers,
    containerRef
  } = useSwipeNavigation({
    totalViews: 3,
    initialView,
    onViewChange: navigateToView
  });
  
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

  // Show loading while navigation is not ready
  if (!navigationReady) {
    return <DashboardSkeleton />;
  }

  // Use currentView from swipe navigation, fall back to currentSlide for initial load
  const activeView = currentView !== undefined ? currentView : currentSlide;

  return (
    <div 
      ref={containerRef}
      className={`h-screen bg-sidebar p-4 pb-20 max-w-md mx-auto flex flex-col overflow-hidden transition-transform duration-300 ${
        isTransitioning ? 'pointer-events-none' : ''
      }`}
      {...swipeHandlers}
    >
      {/* Title */}
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-sidebar-foreground">{t('payments')}</h1>
      </div>

      {/* View-specific layouts */}
      <div className="flex-1 min-h-0">
        {activeView === 0 && (
          <BalanceView 
            balance={balance}
            currentSlide={activeView}
            filteredWeekPayments={filteredWeekPayments}
            sortedRecentTransactions={sortedRecentTransactions}
          />
        )}
        
        {activeView === 1 && (
          <LoansCreditsView 
            loans={loans}
            totalLoanAmount={totalLoanAmount}
            totalMonthlyPayments={totalMonthlyPayments}
            currentSlide={activeView}
            sortedRecentTransactions={sortedRecentTransactions}
          />
        )}
        
        {activeView === 2 && (
          <MonthlyPaymentsView 
            monthlyBills={monthlyBills}
            totalBillsAmount={totalBillsAmount}
            currentSlide={activeView}
            sortedRecentTransactions={sortedRecentTransactions}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
