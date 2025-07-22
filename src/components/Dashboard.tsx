
import React, { useEffect, useState } from 'react';
import { useDashboardCarousel } from '@/hooks/useDashboardCarousel';
import { useDashboardSpacing } from '@/hooks/useDashboardSpacing';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardCarousel from './dashboard/DashboardCarousel';
import DashboardContent from './dashboard/DashboardContent';

const Dashboard = () => {
  const { t } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const { 
    carouselApi, 
    setCarouselApi, 
    initialView, 
    navigationReady, 
    currentSlide 
  } = useDashboardCarousel();
  
  const { 
    isBalanceView, 
    carouselSpacing 
  } = useDashboardSpacing(currentSlide);
  
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
    return (
      <div className="min-h-screen bg-sidebar p-4 pb-20 max-w-md mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-sidebar-foreground">{t('payments')}</h1>
        </div>
        <div className="bg-sidebar-accent/50 rounded-lg h-64 mb-4 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-sidebar p-4 pb-20 max-w-md mx-auto flex flex-col overflow-hidden">
      {/* Title */}
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-sidebar-foreground">{t('payments')}</h1>
      </div>

      {/* Main Carousel */}
      <div className={`flex-shrink-0 ${carouselSpacing}`}>
        <DashboardCarousel 
          key={refreshKey}
          balance={balance}
          loans={loans}
          monthlyBills={monthlyBills}
          totalLoanAmount={totalLoanAmount}
          totalMonthlyPayments={totalMonthlyPayments}
          totalBillsAmount={totalBillsAmount}
          onApiReady={setCarouselApi}
          initialSlide={initialView}
          currentSlide={currentSlide}
        />
      </div>

      {/* Dynamic Content based on current view */}
      <DashboardContent 
        isBalanceView={isBalanceView}
        filteredWeekPayments={filteredWeekPayments}
        sortedRecentTransactions={sortedRecentTransactions}
      />
    </div>
  );
};

export default Dashboard;
