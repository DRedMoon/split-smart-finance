
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, CreditCard, Banknote, Settings, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData } from '@/services/storageService';

const LoansCredits = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const data = loadFinancialData();
  const loans = data?.loans || [];

  const handleBackNavigation = () => {
    // Navigate back to dashboard and set it to loans & credits view
    navigate('/?view=loans-credits');
  };

  // Calculate loan details for each loan
  const calculateLoanDetails = (loan: any) => {
    const monthlyRate = loan.yearlyInterestRate / 100 / 12;
    const remainingMonths = Math.ceil(loan.currentAmount / (loan.monthly - (loan.currentAmount * monthlyRate)));
    const totalInterestRemaining = (loan.monthly * remainingMonths) - loan.currentAmount;
    const totalPayback = loan.currentAmount + totalInterestRemaining;
    
    return {
      remainingMonths: isNaN(remainingMonths) ? 0 : remainingMonths,
      totalInterestRemaining: Math.max(0, totalInterestRemaining),
      totalPayback: Math.max(loan.currentAmount, totalPayback),
      monthlyInterest: loan.currentAmount * monthlyRate,
      monthlyPrincipal: loan.monthly - (loan.currentAmount * monthlyRate)
    };
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={handleBackNavigation} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('loans_credits')}</h1>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Button
          onClick={() => navigate('/add-loan')}
          className="h-16 bg-[#294D73] text-white hover:bg-[#1f3a5f] flex items-center justify-center space-x-3"
        >
          <Banknote size={20} />
          <span>{t('add_loan')}</span>
        </Button>
        
        <Button
          onClick={() => navigate('/add-credit')}
          className="h-16 bg-[#294D73] text-white hover:bg-[#1f3a5f] flex items-center justify-center space-x-3"
        >
          <CreditCard size={20} />
          <span>{t('add_credit_card')}</span>
        </Button>
        
        <Button
          onClick={() => navigate('/manage-loans-credits')}
          className="h-16 bg-[#294D73] text-white hover:bg-[#1f3a5f] flex items-center justify-center space-x-3"
        >
          <Settings size={20} />
          <span>{t('manage_loans_credits')}</span>
        </Button>
      </div>

      {/* Detailed Loans List */}
      <div className="space-y-4">
        {loans.length === 0 ? (
          <Card className="bg-[#294D73] border-none">
            <CardContent className="p-8 text-center text-white/70">
              {t('no_loans_credits')}
            </CardContent>
          </Card>
        ) : (
          loans.map((loan) => {
            const details = calculateLoanDetails(loan);
            return (
              <Card key={loan.id} className="bg-[#294D73] border-none">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">{loan.name}</CardTitle>
                    <Badge variant="outline" className="text-white border-white/30">
                      {loan.yearlyInterestRate}% korko
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main Numbers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/70 text-sm">Jäljellä</p>
                      <p className="text-xl font-bold text-red-400">€{loan.currentAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Kuukausierä</p>
                      <p className="text-xl font-bold text-white">€{loan.monthly.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="bg-white/10 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Lyhennys/kk:</span>
                      <span className="text-white">€{details.monthlyPrincipal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Korko/kk:</span>
                      <span className="text-white">€{details.monthlyInterest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Kuukausia jäljellä:</span>
                      <span className="text-white">{details.remainingMonths} kk</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                      <span className="text-white/70">Kokonaiskorko jäljellä:</span>
                      <span className="text-red-300">€{details.totalInterestRemaining.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-white">Kokonaissumma:</span>
                      <span className="text-white">€{details.totalPayback.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70">Eräpäivä: {loan.dueDate}</span>
                    <span className="text-white/70">Viimeisin maksu: {loan.lastPayment}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-white/30 text-white hover:bg-white/10"
                      onClick={() => navigate(`/edit-loan/${loan.id}`)}
                    >
                      <Edit size={14} className="mr-1" />
                      Muokkaa
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-white/30 text-white hover:bg-white/10"
                    >
                      <Calculator size={14} className="mr-1" />
                      Maksa erä
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Card */}
      {loans.length > 0 && (
        <Card className="mt-6 bg-[#294D73] border-none">
          <CardHeader>
            <CardTitle className="text-white">Yhteenveto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-white">
              <div className="flex justify-between">
                <span>Kokonaisvelka:</span>
                <span className="font-bold text-red-400">€{loans.reduce((sum, loan) => sum + loan.currentAmount, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kuukausierät yhteensä:</span>
                <span className="font-bold">€{loans.reduce((sum, loan) => sum + loan.monthly, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Keskikorko:</span>
                <span className="font-bold">
                  {loans.length > 0 ? (loans.reduce((sum, loan) => sum + loan.yearlyInterestRate, 0) / loans.length).toFixed(1) : 0}%
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
