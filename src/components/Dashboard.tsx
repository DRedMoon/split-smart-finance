
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, CreditCard, Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData } from '@/services/storageService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const data = loadFinancialData();
  const balance = data?.balance || 0;
  const loans = data?.loans || [];
  const recentTransactions = data?.transactions?.slice(0, 3) || [];
  const monthlyBills = data?.monthlyBills || [];

  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.currentAmount, 0);
  const totalMonthlyPayments = loans.reduce((sum, loan) => sum + loan.monthly, 0);
  const totalBillsAmount = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-r from-[#294D73] to-[#1f3a5f] border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">{t('balance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">
            €{balance.toFixed(2)}
          </div>
          <Button 
            onClick={() => navigate('/add')}
            className="w-full bg-white text-[#294D73] hover:bg-gray-100"
          >
            <Plus size={16} className="mr-2" />
            {t('quick_add')}
          </Button>
        </CardContent>
      </Card>

      {/* Loans & Credits Card */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-white text-lg">{t('loans_credits')}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/loans-credits')}
            className="text-white hover:bg-white/10 p-2"
          >
            <Plus size={20} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/70 text-sm">{t('total_debt')}</p>
              <p className="text-white font-semibold">€{totalLoanAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">{t('monthly_payments')}</p>
              <p className="text-white font-semibold">€{totalMonthlyPayments.toFixed(2)}</p>
            </div>
          </div>
          
          {loans.length > 0 && (
            <div className="space-y-2 mb-4">
              {loans.slice(0, 2).map((loan) => (
                <div key={loan.id} className="bg-white/10 rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{loan.name}</span>
                    <span className="text-white/70 text-sm">€{loan.currentAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {loans.length > 2 && (
                <p className="text-white/70 text-sm">+{loans.length - 2} more</p>
              )}
            </div>
          )}
          
          <Button
            variant="ghost"
            onClick={() => navigate('/loans-credits')}
            className="w-full text-white hover:bg-white/10"
          >
            {t('manage_loans_credits')}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Monthly Payments Card */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-white text-lg">{t('monthly_payments')}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/monthly-payments')}
            className="text-white hover:bg-white/10 p-2"
          >
            <Calendar size={20} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/70 text-sm">{t('total_bills')}</p>
              <p className="text-white font-semibold">€{totalBillsAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">{t('this_month')}</p>
              <p className="text-white font-semibold">{monthlyBills.length} {t('bills')}</p>
            </div>
          </div>
          
          {monthlyBills.length > 0 && (
            <div className="space-y-2 mb-4">
              {monthlyBills.slice(0, 2).map((bill) => (
                <div key={bill.id} className="bg-white/10 rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{bill.name}</span>
                    <span className="text-white/70 text-sm">€{bill.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {monthlyBills.length > 2 && (
                <p className="text-white/70 text-sm">+{monthlyBills.length - 2} more</p>
              )}
            </div>
          )}
          
          <Button
            variant="ghost"
            onClick={() => navigate('/monthly-payments')}
            className="w-full text-white hover:bg-white/10"
          >
            {t('view_all_payments')}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-white text-lg">{t('recent_transactions')}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transactions')}
            className="text-white hover:bg-white/10"
          >
            <ArrowRight size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-white/70 text-center py-4">{t('no_transactions')}</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {transaction.amount > 0 ? 
                        <TrendingUp size={16} className="text-green-400" /> : 
                        <TrendingDown size={16} className="text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{transaction.name}</p>
                      <p className="text-white/70 text-xs">{transaction.date}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
