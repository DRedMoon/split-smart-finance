
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import ExpenseDetails from '@/components/ExpenseDetails';
import AddExpense from '@/components/AddExpense';
import TransactionHistory from '@/components/TransactionHistory';
import Settings from '@/components/Settings';
import MonthlyPayments from '@/components/MonthlyPayments';
import UpcomingPayments from '@/components/UpcomingPayments';
import PrivacySettings from '@/components/PrivacySettings';
import SecuritySettings from '@/components/SecuritySettings';
import DataManagement from '@/components/DataManagement';
import Navigation from '@/components/Navigation';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#192E45]">
      <div className="max-w-md mx-auto bg-[#192E45] min-h-screen shadow-xl">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses/:type" element={<ExpenseDetails />} />
          <Route path="/expenses/loans" element={<ExpenseDetails />} />
          <Route path="/expenses/all" element={<ExpenseDetails />} />
          <Route path="/expenses/monthly" element={<ExpenseDetails />} />
          <Route path="/add" element={<AddExpense />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/monthly-payments" element={<MonthlyPayments />} />
          <Route path="/upcoming" element={<UpcomingPayments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<PrivacySettings />} />
          <Route path="/security" element={<SecuritySettings />} />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Navigation />
      </div>
    </div>
  );
};

export default Index;
