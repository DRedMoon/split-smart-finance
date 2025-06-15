
import React, { useEffect, useState } from 'react';
import { useDashboardCarousel } from '@/hooks/useDashboardCarousel';
import { useDashboardSpacing } from '@/hooks/useDashboardSpacing';
import { useFinancialData } from '@/hooks/useFinancialData';
import DashboardCarousel from './dashboard/DashboardCarousel';
import DashboardContent from './dashboard/DashboardContent';

const Dashboard = () => {
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
  
  // Listen for financial data updates
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log('Dashboard - Financial data updated, refreshing...');
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('financial-data-updated', handleDataUpdate);
    return () => {
      window.removeEventListener('financial-data-updated', handleDataUpdate);
    };
  }, []);

  // Show loading while navigation is not ready
  if (!navigationReady) {
    return (
      <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-white">Maksut</h1>
        </div>
        <div className="bg-white/10 rounded-lg h-64 mb-2 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto flex flex-col overflow-hidden">
      {/* Title with minimal spacing */}
      <div className="text-center mb-1 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white">Maksut</h1>
      </div>

      {/* Main Carousel with minimal spacing */}
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
