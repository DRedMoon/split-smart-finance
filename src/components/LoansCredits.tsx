
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { loadFinancialData } from '@/services/storageService';
import LoanCard from './loan/LoanCard';
import LoanSummaryCard from './loan/LoanSummaryCard';

const LoansCredits = () => {
  const navigate = useNavigate();
  const { t } = useSafeLanguage();
  const [financialData, setFinancialData] = useState(null);

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
    localStorage.setItem('dashboardLastView', 'loans-credits');
  }, []);

  const handleBackNavigation = () => {
    // Navigate back to dashboard with the correct view
    navigate('/?returnTo=loans-credits');
  };

  const calculateLoanDetails = (loan) => {
    // Always use the user's actual monthly payment input, not recalculated values
    const userMonthlyPayment = loan.monthly || 0;
    
    if (loan.remaining === 'Credit Card') {
      // For credit cards, use the user's input
      return {
        monthlyPayment: userMonthlyPayment,
        totalPayback: loan.totalPayback || 0,
        interestAmount: (loan.totalPayback || 0) - loan.currentAmount,
        remainingMonths: 'N/A'
      };
    } else {
      // For loans, use the user's input and their specified values
      const termMonths = parseInt(loan.remaining.match(/\d+/)?.[0] || '0');
      const totalPayback = loan.totalPayback || (userMonthlyPayment * termMonths);
      
      return {
        monthlyPayment: userMonthlyPayment, // Always use user's input
        totalPayback: totalPayback,
        interestAmount: totalPayback - loan.currentAmount,
        remainingMonths: termMonths
      };
    }
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen max-w-md mx-auto">{t('loading')}</div>;
  }

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handleBackNavigation} className="text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white">{t('loans_credits')}</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => navigate('/manage-loans-credits')} 
            size="sm" 
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Settings size={16} />
          </Button>
          <Button onClick={() => navigate('/add-loan')} size="sm" className="bg-[#294D73] hover:bg-[#1f3a5f]">
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Loans and Credits List */}
      <div className="space-y-4">
        {financialData.loans?.length === 0 ? (
          <Card className="bg-[#294D73] border-none">
            <CardContent className="p-6 text-center text-white/70">
              {t('no_loans_credits')}
            </CardContent>
          </Card>
        ) : (
          financialData.loans?.map((loan) => (
            <LoanCard 
              key={loan.id} 
              loan={loan} 
              calculateLoanDetails={calculateLoanDetails}
            />
          ))
        )}
      </div>

      <LoanSummaryCard loans={financialData.loans || []} />
    </div>
  );
};

export default LoansCredits;
