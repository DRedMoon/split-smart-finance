
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData, calculateLoanPayment2, calculateCreditPayment } from '@/services/storageService';

const ManageLoansCredits = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const data = loadFinancialData();
  const loans = data?.loans || [];

  const handleDelete = (loanId: number, loanName: string) => {
    if (data) {
      data.loans = data.loans.filter(loan => loan.id !== loanId);
      data.monthlyBills = data.monthlyBills.filter(bill => bill.name !== loanName);
      saveFinancialData(data);
      
      toast({
        title: 'Deleted',
        description: `${loanName} has been removed`
      });
      
      // Refresh the page
      window.location.reload();
    }
  };

  const calculateTotalPayback = (loan: any) => {
    if (loan.remaining === 'Credit Card') {
      // Credit card calculation
      if (loan.currentAmount > 0 && loan.rate > 0) {
        const calculation = calculateCreditPayment(
          loan.currentAmount,
          loan.rate,
          loan.managementFee || 0,
          loan.minimumPercent || 3
        );
        return calculation.totalWithInterest;
      }
    } else {
      // Loan calculation
      if (loan.totalAmount > 0 && loan.euriborRate >= 0 && loan.personalMargin >= 0) {
        const termMonths = parseInt(loan.remaining.match(/\d+/)?.[0] || '12');
        if (termMonths > 0) {
          const calculation = calculateLoanPayment2(
            loan.totalAmount,
            loan.euriborRate,
            loan.personalMargin,
            loan.managementFee || 0,
            termMonths
          );
          return calculation.totalPayback;
        }
      }
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/loans-credits')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('manage_loans_credits')}</h1>
      </div>

      <div className="space-y-4">
        {loans.length === 0 ? (
          <Card className="bg-[#294D73] border-none">
            <CardContent className="p-8 text-center">
              <p className="text-white/70">{t('no_loans_credits')}</p>
            </CardContent>
          </Card>
        ) : (
          loans.map((loan) => {
            const totalPayback = calculateTotalPayback(loan);
            const isCredit = loan.remaining === 'Credit Card';
            
            return (
              <Card key={loan.id} className="bg-[#294D73] border-none">
                <CardHeader>
                  <CardTitle className="text-white flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span>{loan.name}</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">
                        {isCredit ? t('credit_card') : t('loan')}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/edit-loan/${loan.id}`)}
                        className="text-white hover:bg-white/10"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(loan.id, loan.name)}
                        className="text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">
                        {isCredit ? t('credit_limit') : t('total_amount')}
                      </p>
                      <p className="text-white font-medium">€{loan.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/70">
                        {isCredit ? t('used_credit') : t('current_amount')}
                      </p>
                      <p className="text-white font-medium">€{loan.currentAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/70">{t('monthly_payment')}</p>
                      <p className="text-white font-medium">€{loan.monthly.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/70">{t('interest_rate')}</p>
                      <p className="text-white font-medium">{loan.rate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-white/70">{t('due_date')}</p>
                      <p className="text-white font-medium">{loan.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-white/70">{t('remaining')}</p>
                      <p className="text-white font-medium">{loan.remaining}</p>
                    </div>
                  </div>
                  
                  {totalPayback > 0 && (
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/70">{t('total_payback')}</p>
                          <p className="text-white font-bold">€{totalPayback.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-white/70">{t('total_interest')}</p>
                          <p className="text-white font-medium text-red-300">
                            €{(totalPayback - loan.totalAmount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManageLoansCredits;
