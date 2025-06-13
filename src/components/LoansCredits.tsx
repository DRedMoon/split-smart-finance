
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, calculateLoanPayment2, calculateCreditPayment } from '@/services/storageService';
import LoanCard from './loan/LoanCard';
import LoanSummaryCard from './loan/LoanSummaryCard';

const LoansCredits = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [financialData, setFinancialData] = useState(null);

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
    localStorage.setItem('dashboardLastView', 'loans-credits');
  }, []);

  const handleBackNavigation = () => {
    navigate('/?view=loans-credits');
  };

  const calculateLoanDetails = (loan) => {
    if (loan.remaining === 'Credit Card') {
      if (loan.currentAmount > 0 && loan.rate > 0) {
        const calculation = calculateCreditPayment(
          loan.currentAmount,
          loan.rate,
          loan.managementFee || 0,
          loan.minimumPercent || 3
        );
        return {
          monthlyPayment: calculation.monthlyMinimum,
          totalPayback: calculation.totalWithInterest,
          interestAmount: calculation.totalWithInterest - loan.currentAmount,
          remainingMonths: 'N/A'
        };
      }
    } else {
      if (loan.totalAmount > 0 && loan.euriborRate >= 0 && loan.personalMargin >= 0) {
        const termMonths = parseInt(loan.remaining.match(/\d+/)?.[0] || '12');
        if (termMonths > 0) {
          const calculation = calculateLoanPayment2(
            loan.currentAmount,
            loan.euriborRate,
            loan.personalMargin,
            loan.managementFee || 0,
            termMonths
          );
          return {
            monthlyPayment: calculation.monthlyPayment,
            totalPayback: calculation.totalPayback,
            interestAmount: calculation.totalPayback - loan.currentAmount,
            remainingMonths: termMonths
          };
        }
      }
    }
    return {
      monthlyPayment: loan.monthly || 0,
      totalPayback: loan.totalPayback || 0,
      interestAmount: (loan.totalPayback || 0) - loan.currentAmount,
      remainingMonths: loan.remaining === 'Credit Card' ? 'N/A' : parseInt(loan.remaining.match(/\d+/)?.[0] || '0')
    };
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen max-w-md mx-auto">Ladataan...</div>;
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
