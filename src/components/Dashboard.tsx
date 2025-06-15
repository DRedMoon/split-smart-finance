
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData } from '@/services/dataService';
import { getThisWeekUpcomingPayments } from '@/services/storageService';
import DashboardCarousel from './dashboard/DashboardCarousel';
import UpcomingWeekCard from './dashboard/UpcomingWeekCard';
import RecentTransactionsCard from './dashboard/RecentTransactionsCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [carouselApi, setCarouselApi] = useState(null);
  const [initialView, setInitialView] = useState(0);
  const [navigationReady, setNavigationReady] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
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

  // Handle returnTo parameter immediately
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const returnTo = urlParams.get('returnTo');
    
    if (returnTo) {
      console.log('Dashboard - Processing returnTo:', returnTo);
      const viewIndex = returnTo === 'balance' ? 0 : 
                       returnTo === 'loans-credits' ? 1 : 
                       returnTo === 'monthly-payments' ? 2 : 0;
      
      console.log('Dashboard - Setting initial view to:', viewIndex);
      setInitialView(viewIndex);
      setCurrentSlide(viewIndex);
      
      window.history.replaceState({}, '', '/');
    } else {
      setNavigationReady(true);
    }
  }, [location.search]);

  // Navigate when carousel API is ready and we have a target view
  useEffect(() => {
    if (carouselApi && initialView !== 0) {
      console.log('Dashboard - Navigating carousel to view:', initialView);
      setTimeout(() => {
        carouselApi.scrollTo(initialView);
        setNavigationReady(true);
      }, 50);
    } else if (carouselApi) {
      setNavigationReady(true);
    }
  }, [carouselApi, initialView]);

  // Track carousel slide changes
  useEffect(() => {
    if (carouselApi) {
      carouselApi.on("select", () => {
        setCurrentSlide(carouselApi.selectedScrollSnap());
      });
    }
  }, [carouselApi]);
  
  // Safe data loading with fallbacks
  const data = loadFinancialData();
  const balance = data?.balance || 0;
  const loans = data?.loans || [];
  
  console.log('Dashboard - All loans:', loans);
  console.log('Dashboard - Monthly bills:', data?.monthlyBills);
  
  // Enhanced recent transactions logic to include all transaction types
  const allTransactions = data?.transactions || [];
  const monthlyBills = data?.monthlyBills || [];
  
  const recentTransactions = [];
  
  // Add ALL income transactions (including Paycheck)
  const incomeTransactions = allTransactions.filter(transaction => transaction.amount > 0);
  recentTransactions.push(...incomeTransactions);
  
  // Add expense transactions
  const expenseTransactions = allTransactions.filter(transaction => transaction.amount < 0);
  recentTransactions.push(...expenseTransactions);
  
  // Add paid monthly bills as expense transactions
  const paidBills = monthlyBills.filter(bill => bill.paid);
  const billTransactions = paidBills.map(bill => ({
    id: `bill-${bill.id}`,
    name: bill.name,
    amount: -bill.amount,
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: bill.type || bill.category
  }));
  
  recentTransactions.push(...billTransactions);
  
  // Sort by date and show more transactions
  const sortedRecentTransactions = recentTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);

  console.log('Dashboard - Enhanced recent transactions:', sortedRecentTransactions);

  const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.currentAmount || 0), 0);
  const totalMonthlyPayments = loans.reduce((sum, loan) => sum + (loan.monthly || 0), 0);
  const totalBillsAmount = monthlyBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

  // Get this week's upcoming payments with error handling
  let thisWeekPayments = [];
  try {
    thisWeekPayments = getThisWeekUpcomingPayments();
  } catch (error) {
    console.error('Error getting upcoming payments:', error);
  }

  const filteredWeekPayments = thisWeekPayments.filter(bill => 
    bill.type !== 'laina' && 
    bill.type !== 'luottokortti' && 
    bill.type !== 'loan_payment' && 
    bill.type !== 'credit_payment'
  );

  // Show loading while navigation is not ready
  if (!navigationReady) {
    return (
      <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Maksut</h1>
        </div>
        <div className="bg-white/10 rounded-lg h-64 mb-6 animate-pulse"></div>
      </div>
    );
  }

  // Dynamic layout based on current slide
  const showNavigationButtons = currentSlide === 0;
  const showUpcomingWeek = currentSlide === 0;
  const showRecentTransactions = true;

  // Dynamic spacing classes based on current slide
  const getCarouselSpacing = () => {
    switch (currentSlide) {
      case 0: // Balance view
        return 'mb-4';
      case 1: // Loans & Credits view
        return 'mb-2';
      case 2: // Monthly Payments view
        return 'mb-4';
      default:
        return 'mb-4';
    }
  };

  const getButtonSpacing = () => {
    return showNavigationButtons ? 'mb-4' : '';
  };

  const getUpcomingWeekSpacing = () => {
    return showUpcomingWeek ? 'mb-4' : '';
  };

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto flex flex-col">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">Maksut</h1>
      </div>

      {/* Main Carousel with dynamic spacing */}
      <div className={getCarouselSpacing()}>
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

      {/* Navigation Buttons - Only show on Balance view */}
      {showNavigationButtons && (
        <div className={`grid grid-cols-2 gap-4 ${getButtonSpacing()}`}>
          <Button
            onClick={() => navigate('/upcoming')}
            className="bg-[#294D73] hover:bg-[#1f3a5f] text-white"
          >
            {t('upcoming')}
          </Button>
          <Button
            onClick={() => navigate('/transactions')}
            className="bg-[#294D73] hover:bg-[#1f3a5f] text-white"
          >
            {t('transactions')}
          </Button>
        </div>
      )}

      {/* This Week's Upcoming Payments - Only show on Balance view */}
      {showUpcomingWeek && (
        <div className={getUpcomingWeekSpacing()}>
          <UpcomingWeekCard filteredWeekPayments={filteredWeekPayments} />
        </div>
      )}

      {/* Recent Transactions - Always show with flex-grow to fill remaining space */}
      {showRecentTransactions && (
        <div className="flex-1 min-h-0">
          <RecentTransactionsCard 
            recentTransactions={sortedRecentTransactions} 
            isExpandedView={currentSlide !== 0}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
