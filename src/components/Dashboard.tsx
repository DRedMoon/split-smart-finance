
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
  
  // Listen for financial data updates
  useEffect(() => {
    const handleDataUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('financial-data-updated', handleDataUpdate);
    return () => {
      window.removeEventListener('financial-data-updated', handleDataUpdate);
    };
  }, []);

  // Handle returnTo navigation parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const returnTo = urlParams.get('returnTo');
    
    if (returnTo && carouselApi) {
      console.log('Dashboard returnTo parameter detected:', returnTo);
      
      const viewIndex = returnTo === 'balance' ? 0 : 
                       returnTo === 'loans-credits' ? 1 : 
                       returnTo === 'monthly-payments' ? 2 : 0;
      
      console.log('Navigating to carousel index:', viewIndex);
      
      // Navigate immediately
      carouselApi.scrollTo(viewIndex);
      
      // Clear the URL parameter
      navigate('/', { replace: true });
    }
  }, [location.search, navigate, carouselApi]);
  
  // Safe data loading with fallbacks
  const data = loadFinancialData();
  const balance = data?.balance || 0;
  const loans = data?.loans || [];
  const recentTransactions = data?.transactions?.slice(0, 3) || [];
  
  const monthlyBills = data?.monthlyBills || [];

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

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">Maksut</h1>
      </div>

      {/* Main Carousel */}
      <DashboardCarousel 
        key={refreshKey}
        balance={balance}
        loans={loans}
        monthlyBills={monthlyBills}
        totalLoanAmount={totalLoanAmount}
        totalMonthlyPayments={totalMonthlyPayments}
        totalBillsAmount={totalBillsAmount}
        onApiReady={setCarouselApi}
      />

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
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

      {/* This Week's Upcoming Payments */}
      <UpcomingWeekCard filteredWeekPayments={filteredWeekPayments} />

      {/* Recent Transactions */}
      <RecentTransactionsCard recentTransactions={recentTransactions} />
    </div>
  );
};

export default Dashboard;
