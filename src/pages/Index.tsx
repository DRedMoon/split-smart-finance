
import { Routes, Route } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import AddExpense from '@/components/AddExpense';
import TransactionHistory from '@/components/TransactionHistory';
import UpcomingPayments from '@/components/UpcomingPayments';
import Settings from '@/components/Settings';
import ProfileSettings from '@/components/ProfileSettings';
import NotificationSettings from '@/components/NotificationSettings';
import BackupSettings from '@/components/BackupSettings';
import PrivacySettings from '@/components/PrivacySettings';
import SecuritySettings from '@/components/SecuritySettings';
import AppearanceSettings from '@/components/AppearanceSettings';
import DataManagement from '@/components/DataManagement';
import CategoryCreator from '@/components/CategoryCreator';
import CategoryEditor from '@/components/CategoryEditor';
import MonthlyPayments from '@/components/MonthlyPayments';
import LoansCredits from '@/components/LoansCredits';
import AddLoan from '@/components/AddLoan';
import AddCredit from '@/components/AddCredit';
import ManageLoansCredits from '@/components/ManageLoansCredits';
import EditLoan from '@/components/EditLoan';
import Navigation from '@/components/Navigation';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddExpense />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/upcoming" element={<UpcomingPayments />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/backup-settings" element={<BackupSettings />} />
        <Route path="/privacy" element={<PrivacySettings />} />
        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/appearance" element={<AppearanceSettings />} />
        <Route path="/data-management" element={<DataManagement />} />
        <Route path="/create-category" element={<CategoryCreator />} />
        <Route path="/edit-category/:id" element={<CategoryEditor />} />
        <Route path="/monthly-payments" element={<MonthlyPayments />} />
        <Route path="/loans-credits" element={<LoansCredits />} />
        <Route path="/add-loan" element={<AddLoan />} />
        <Route path="/add-credit" element={<AddCredit />} />
        <Route path="/manage-loans-credits" element={<ManageLoansCredits />} />
        <Route path="/edit-loan/:loanId" element={<EditLoan />} />
      </Routes>
      <Navigation />
    </div>
  );
};

export default Index;
