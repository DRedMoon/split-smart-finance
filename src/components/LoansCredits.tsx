
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Calculator, CreditCard, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, calculateLoanPayment2, calculateCreditPayment } from '@/services/storageService';

const LoansCredits = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [financialData, setFinancialData] = useState(null);

  useEffect(() => {
    const data = loadFinancialData();
    setFinancialData(data);
    // Store that we came from loans-credits view
    localStorage.setItem('dashboardLastView', 'loans-credits');
  }, []);

  const handleBackNavigation = () => {
    const lastView = localStorage.getItem('dashboardLastView') || 'loans-credits';
    navigate(`/?returnTo=${lastView}`);
  };

  const calculateLoanDetails = (loan) => {
    if (loan.remaining === 'Credit Card') {
      // Credit card calculation
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
      // Loan calculation
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
          financialData.loans?.map((loan) => {
            const details = calculateLoanDetails(loan);
            const isCredit = loan.remaining === 'Credit Card';
            const progress = loan.totalAmount > 0 ? ((loan.totalAmount - loan.currentAmount) / loan.totalAmount) * 100 : 0;
            
            return (
              <Card key={loan.id} className="bg-[#294D73] border-none">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isCredit ? <CreditCard size={20} /> : <Coins size={20} />}
                      <span>{loan.name}</span>
                    </div>
                    <Badge variant={isCredit ? 'secondary' : 'default'} className="text-xs">
                      {isCredit ? t('credit_card') : t('loan')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/70">
                      <span>{isCredit ? t('used_credit') : t('paid_off')}</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isCredit ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Amount Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">{isCredit ? t('credit_limit') : t('original_amount')}</p>
                      <p className="text-white font-medium">€{loan.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/70">{isCredit ? t('available_credit') : t('remaining_balance')}</p>
                      <p className="text-white font-medium">€{loan.currentAmount.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">{t('monthly_payment')}</p>
                      <p className="text-white font-medium">€{details.monthlyPayment.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/70">{t('interest_rate')}</p>
                      <p className="text-white font-medium">{loan.rate.toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* Advanced Details */}
                  <div className="border-t border-white/20 pt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/70">{t('total_payback')}</p>
                        <p className="text-white font-bold">€{details.totalPayback.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-white/70">{t('total_interest')}</p>
                        <p className="text-red-300 font-medium">€{details.interestAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {!isCredit && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/70">{t('remaining_months')}</p>
                          <p className="text-white font-medium">{details.remainingMonths}</p>
                        </div>
                        <div>
                          <p className="text-white/70">{t('due_date')}</p>
                          <p className="text-white font-medium">{loan.dueDate}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      onClick={() => navigate(`/edit-loan/${loan.id}`)}
                      size="sm" 
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Calculator size={14} className="mr-1" />
                      {t('edit')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Total Summary */}
      {financialData.loans?.length > 0 && (
        <Card className="mt-6 bg-[#1a4a6b] border-none">
          <CardHeader>
            <CardTitle className="text-white">{t('total_overview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-white">
              <div className="flex justify-between">
                <span>{t('total_debt')}:</span>
                <span className="font-bold">
                  €{financialData.loans.reduce((sum, loan) => sum + loan.currentAmount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('monthly_payments')}:</span>
                <span className="font-bold text-red-300">
                  €{financialData.loans.reduce((sum, loan) => sum + (loan.monthly || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoansCredits;
