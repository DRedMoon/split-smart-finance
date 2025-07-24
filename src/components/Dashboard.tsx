
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
    isTransitioning,
    swipeHandlers,
    containerRef
  } = useSwipeNavigation({
    totalViews: 3,
    currentView: currentSlide,
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
    <div 
      ref={containerRef}
      className={`h-screen bg-sidebar p-4 pb-20 max-w-md mx-auto flex flex-col overflow-hidden transition-transform duration-300 touch-pan-x ${
        isTransitioning ? 'pointer-events-none' : ''
      }`}
      {...swipeHandlers}
      style={{ touchAction: 'pan-x' }}
    >
      {/* Title */}
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-sidebar-foreground">{t('payments')}</h1>
      </div>

      {/* View Indicator Dots */}
      <div className="flex justify-center gap-2 mb-4 flex-shrink-0">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeView === index ? 'bg-sidebar-foreground' : 'bg-sidebar-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* View-specific layouts with slide animation */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${activeView * 100}%)` }}
        >
          {/* Balance View */}
          <div className="w-full flex-shrink-0 h-full">
            <BalanceView 
              balance={balance}
              currentSlide={activeView}
              filteredWeekPayments={filteredWeekPayments}
              sortedRecentTransactions={sortedRecentTransactions}
            />
          </div>
          
          {/* Loans Credits View */}
          <div className="w-full flex-shrink-0 h-full">
            <LoansCreditsView 
              loans={loans}
              totalLoanAmount={totalLoanAmount}
              totalMonthlyPayments={totalMonthlyPayments}
              currentSlide={activeView}
              sortedRecentTransactions={sortedRecentTransactions}
            />
          </div>
          
          {/* Monthly Payments View */}
          <div className="w-full flex-shrink-0 h-full">
            <MonthlyPaymentsView 
              monthlyBills={monthlyBills}
              totalBillsAmount={totalBillsAmount}
              currentSlide={activeView}
              sortedRecentTransactions={sortedRecentTransactions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
