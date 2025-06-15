
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import AddExpense from '@/components/AddExpense';
import MonthlyPayments from '@/components/MonthlyPayments';
import UpcomingPayments from '@/components/UpcomingPayments';
import LoansCredits from '@/components/LoansCredits';
import TransactionHistory from '@/components/TransactionHistory';
import Settings from '@/components/Settings';
import CategoryManager from '@/components/CategoryManager';
import ManageLoansCredits from '@/components/ManageLoansCredits';
import AddLoan from '@/components/AddLoan';
import EditLoan from '@/components/EditLoan';
import ProfileSettings from '@/components/ProfileSettings';
import NotificationSettings from '@/components/NotificationSettings';
import PrivacySettings from '@/components/PrivacySettings';
import SecuritySettings from '@/components/SecuritySettings';
import AppearanceSettings from '@/components/AppearanceSettings';
import BackupSettings from '@/components/BackupSettings';
import DataManagement from '@/components/DataManagement';
import Navigation from '@/components/Navigation';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle returnTo parameter for proper navigation back to dashboard views
    const urlParams = new URLSearchParams(location.search);
    const returnTo = urlParams.get('returnTo');
    
    if (returnTo && location.pathname === '/') {
      // Set the dashboard to the correct view based on the returnTo parameter
      const dashboard = document.querySelector('[data-dashboard-carousel]');
      if (dashboard) {
        const viewIndex = returnTo === 'balance' ? 0 : 
                         returnTo === 'loans-credits' ? 1 : 
                         returnTo === 'monthly-payments' ? 2 : 0;
        
        // Trigger carousel navigation to the correct view
        const event = new CustomEvent('navigate-dashboard', {
          detail: { index: viewIndex }
        });
        dashboard.dispatchEvent(event);
      }
      
      // Clean up the URL
      navigate('/', { replace: true });
    }

    // Handle legacy view parameter for dashboard navigation
    const view = urlParams.get('view');
    if (view && location.pathname === '/') {
      const dashboard = document.querySelector('[data-dashboard-carousel]');
      if (dashboard) {
        const viewIndex = view === 'balance' ? 0 : 
                         view === 'loans-credits' ? 1 : 
                         view === 'monthly-payments' ? 2 : 0;
        
        const event = new CustomEvent('navigate-dashboard', {
          detail: { index: viewIndex }
        });
        dashboard.dispatchEvent(event);
      }
      
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#192E45]">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddExpense />} />
        <Route path="/monthly-payments" element={<MonthlyPayments />} />
        <Route path="/upcoming" element={<UpcomingPayments />} />
        <Route path="/loans-credits" element={<LoansCredits />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/privacy" element={<PrivacySettings />} />
        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/appearance" element={<AppearanceSettings />} />
        <Route path="/backup-settings" element={<BackupSettings />} />
        <Route path="/data-management" element={<DataManagement />} />
        <Route path="/create-category" element={<CategoryManager />} />
        <Route path="/manage-loans-credits" element={<ManageLoansCredits />} />
        <Route path="/add-loan" element={<AddLoan />} />
        <Route path="/add-credit" element={<div>Add Credit</div>} />
        <Route path="/edit-loan/:loanId" element={<EditLoan />} />
      </Routes>
      <Navigation />
    </div>
  );
};

export default Index;
