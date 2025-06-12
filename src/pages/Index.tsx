
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import ExpenseDetails from '@/components/ExpenseDetails';
import AddExpense from '@/components/AddExpense';
import TransactionHistory from '@/components/TransactionHistory';
import Settings from '@/components/Settings';
import Navigation from '@/components/Navigation';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Router>
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses/:type" element={<ExpenseDetails />} />
            <Route path="/add" element={<AddExpense />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Navigation />
        </div>
      </Router>
    </div>
  );
};

export default Index;
