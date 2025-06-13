
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, CreditCard, Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, getThisWeekUpcomingPayments } from '@/services/storageService';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const data = loadFinancialData();
  const balance = data?.balance || 0;
  const loans = data?.loans || [];
  const recentTransactions = data?.transactions?.slice(0, 3) || [];
  
  // Filter monthly bills to exclude loan payments - only show actual recurring bills
  const monthlyBills = data?.monthlyBills?.filter(bill => 
    bill.type !== 'laina' && 
    bill.type !== 'luottokortti' && 
    bill.type !== 'loan_payment' && 
    bill.type !== 'credit_payment'
  ) || [];

  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.currentAmount, 0);
  const totalMonthlyPayments = loans.reduce((sum, loan) => sum + loan.monthly, 0);
  const totalBillsAmount = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0);

  // Get this week's upcoming payments
  const thisWeekPayments = getThisWeekUpcomingPayments();
  const filteredWeekPayments = thisWeekPayments.filter(bill => 
    bill.type !== 'laina' && 
    bill.type !== 'luottokortti' && 
    bill.type !== 'loan_payment' && 
    bill.type !== 'credit_payment'
  );

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      {/* Main Carousel */}
      <Carousel className="w-full mb-6">
        <CarouselContent>
          {/* Balance Card */}
          <CarouselItem>
            <Card className="bg-gradient-to-r from-[#294D73] to-[#1f3a5f] border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center space-x-2">
                  <Wallet size={20} />
                  <span>{t('balance')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-4">
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
          </CarouselItem>

          {/* Monthly Payments Card */}
          <CarouselItem>
            <Card className="bg-[#294D73] border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white text-lg flex items-center space-x-2">
                  <Calendar size={20} />
                  <span>{t('monthly_payments')}</span>
                </CardTitle>
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
          </CarouselItem>

          {/* Loans & Credits Card */}
          <CarouselItem>
            <Card className="bg-[#294D73] border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-white text-lg flex items-center space-x-2">
                  <CreditCard size={20} />
                  <span>{t('loans_credits')}</span>
                </CardTitle>
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
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="text-white border-white/20 hover:bg-white/10" />
        <CarouselNext className="text-white border-white/20 hover:bg-white/10" />
      </Carousel>

      {/* This Week's Upcoming Payments */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-white text-lg flex items-center space-x-2">
            <Calendar size={20} />
            <span>{t('upcoming_week')}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/upcoming')}
            className="text-white hover:bg-white/10"
          >
            <ArrowRight size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          {filteredWeekPayments.length === 0 ? (
            <p className="text-white/70 text-center py-4">Ei maksuja tällä viikolla</p>
          ) : (
            <div className="space-y-3">
              {filteredWeekPayments.slice(0, 3).map(bill => (
                <div key={bill.id} className="flex justify-between items-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <div>
                    <div className="font-medium text-white">{bill.name}</div>
                    <div className="text-sm text-white/70">{t('due')} {bill.dueDate}</div>
                  </div>
                  <div className="font-bold text-yellow-300">€{bill.amount}</div>
                </div>
              ))}
              {filteredWeekPayments.length > 3 && (
                <p className="text-white/70 text-sm text-center">+{filteredWeekPayments.length - 3} more this week</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          onClick={() => navigate('/upcoming')}
          className="bg-[#294D73] hover:bg-[#1f3a5f] text-white"
        >
          {t('upcoming')}
        </Button>
        <Button
          onClick={() => navigate('/transactions')}
          className="bg-[#294D73] hover:bg-[#1f3a5f] text-white"
        >
          {t('transactions')}
        </Button>
      </div>

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
