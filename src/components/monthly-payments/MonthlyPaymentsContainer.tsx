
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import MonthlyPaymentsHeader from './MonthlyPaymentsHeader';
import MonthlyPaymentsSummary from './MonthlyPaymentsSummary';
import MonthlyPaymentsList from './MonthlyPaymentsList';
import { useMonthlyPaymentsLogic } from './useMonthlyPaymentsLogic';

const today = new Date();

const MonthlyPaymentsContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState(null);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showAllLoanCredit, setShowAllLoanCredit] = useState(false);

  const { processPaymentData, handleTogglePaid: togglePayment } = useMonthlyPaymentsLogic(
    financialData,
    setFinancialData,
    toast
  );

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
    localStorage.setItem('dashboardLastView', 'monthly-payments');
  }, []);

  const handleBackNavigation = () => {
    const lastView = localStorage.getItem('dashboardLastView');
    if (lastView === 'monthly-payments') {
      navigate('/?returnTo=monthly-payments');
    } else {
      navigate('/');
    }
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const dayMatch = dueDate.match(/\d+/);
    if (!dayMatch) return null;
    
    const dueDay = parseInt(dayMatch[0]);
    const due = new Date(today.getFullYear(), today.getMonth(), dueDay);
    if (due < today) {
      due.setMonth(due.getMonth() + 1);
    }
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen max-w-md mx-auto">Ladataan...</div>;
  }

  const { regularBills, loanCreditPayments, totals } = processPaymentData();

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen max-w-md mx-auto">
      <MonthlyPaymentsHeader onBack={handleBackNavigation} />
      
      <MonthlyPaymentsSummary totals={totals} />
      
      <MonthlyPaymentsList
        regularBills={regularBills}
        loanCreditPayments={loanCreditPayments}
        showAllPayments={showAllPayments}
        showAllLoanCredit={showAllLoanCredit}
        onToggleShowAllPayments={setShowAllPayments}
        onToggleShowAllLoanCredit={setShowAllLoanCredit}
        onTogglePaid={togglePayment}
        getDaysUntilDue={getDaysUntilDue}
      />
    </div>
  );
};

export default MonthlyPaymentsContainer;
