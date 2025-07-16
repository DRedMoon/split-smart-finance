import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, getThisWeekUpcomingPayments, type FinancialData } from '@/services/storageService';
import { isPaymentPaidForMonth, migratePaymentDataToMonthSpecific } from '@/utils/paymentUtils';

// Normalize payment type to have consistent properties
type NormalizedPayment = {
  id: string | number;
  name: string;
  amount: number;
  dueDate: string;
  type: string;
  category?: string;
  isPaid: boolean;
};

const UpcomingPayments = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [currentView, setCurrentView] = useState<'week' | 'month' | 'yearly'>('week');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Load financial data
  useEffect(() => {
    try {
      let data = loadFinancialData();
      if (data) {
        data = migratePaymentDataToMonthSpecific(data);
        setFinancialData(data);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
      setFinancialData(null);
    }
  }, []);

  // Simple helper functions without complex dependencies
  const getUpcomingPayments = (view: 'week' | 'month'): NormalizedPayment[] => {
    if (!financialData?.monthlyBills) return [];

    const today = new Date();
    let endDate: Date;

    switch (view) {
      case 'week':
        endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        endDate = new Date(currentYear, currentMonth + 1, 0);
        break;
    }

    return financialData.monthlyBills.filter(bill => {
      if (isPaymentPaidForMonth(bill, currentYear, currentMonth)) return false;
      
      const dayMatch = bill.dueDate.match(/\d+/);
      if (!dayMatch) return false;
      
      const dueDay = parseInt(dayMatch[0]);
      const dueDate = new Date(currentYear, currentMonth, dueDay);
      
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      
      return dueDate >= today && dueDate <= endDate;
    }).map(bill => ({
      id: bill.id,
      name: bill.name,
      amount: bill.amount,
      dueDate: bill.dueDate,
      type: bill.type,
      isPaid: isPaymentPaidForMonth(bill, currentYear, currentMonth)
    }));
  };

  const getNextMonthPayments = (): NormalizedPayment[] => {
    if (!financialData) return [];
    
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    const loanPayments: NormalizedPayment[] = (financialData.loans || [])
      .filter(loan => loan.currentAmount > 0)
      .map(loan => ({
        id: `loan-${loan.id}`,
        name: loan.name,
        amount: loan.monthly,
        dueDate: loan.dueDate,
        category: loan.remaining === 'Credit Card' ? 'Credit Card' : 'Loan',
        type: loan.remaining === 'Credit Card' ? 'credit_payment' : 'loan_payment',
        isPaid: false
      }));

    const regularBills: NormalizedPayment[] = (financialData.monthlyBills || [])
      .filter(bill => 
        bill.type !== 'laina' && bill.type !== 'luottokortti' && 
        bill.type !== 'loan_payment' && bill.type !== 'credit_payment'
      )
      .map(bill => ({
        id: bill.id,
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
        type: bill.type,
        isPaid: isPaymentPaidForMonth(bill, nextYear, nextMonth)
      }));

    return [...loanPayments, ...regularBills];
  };

  const getYearlyUpcomingPayments = () => {
    if (!financialData?.monthlyBills) return [];

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthlyData: Array<{ month: number; year: number; regularBills: NormalizedPayment[]; loanCreditPayments: NormalizedPayment[]; totalAmount: number }> = [];

    for (let month = currentMonth; month < 12; month++) {
      const regularBills: NormalizedPayment[] = (financialData.monthlyBills || [])
        .filter(bill => 
          bill.type !== 'laina' && bill.type !== 'luottokortti' && 
          bill.type !== 'loan_payment' && bill.type !== 'credit_payment'
        )
        .filter(bill => !isPaymentPaidForMonth(bill, currentYear, month))
        .map(bill => ({
          id: bill.id,
          name: bill.name,
          amount: bill.amount,
          dueDate: bill.dueDate,
          type: bill.type,
          isPaid: isPaymentPaidForMonth(bill, currentYear, month)
        }));

      const loanCreditPayments: NormalizedPayment[] = (financialData.loans || [])
        .filter(loan => loan.currentAmount > 0)
        .map(loan => ({
          id: `loan-${loan.id}-${month}`,
          name: loan.name,
          amount: loan.monthly,
          dueDate: loan.dueDate,
          category: loan.remaining === 'Credit Card' ? 'Credit Card' : 'Loan',
          type: loan.remaining === 'Credit Card' ? 'credit_payment' : 'loan_payment',
          isPaid: false
        }));

      const totalAmount = [...regularBills, ...loanCreditPayments].reduce((sum, bill) => sum + bill.amount, 0);

      if (regularBills.length > 0 || loanCreditPayments.length > 0) {
        monthlyData.push({
          month,
          year: currentYear,
          regularBills,
          loanCreditPayments,
          totalAmount
        });
      }
    }

    return monthlyData;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
      t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
    ];
    return months[month];
  };

  // All hooks must be called before any conditional returns
  const upcomingPayments = useMemo(() => {
    if (!financialData) return [];
    
    if (currentView === 'yearly') {
      return [];
    }
    
    if (currentView === 'month' && currentMonth !== new Date().getMonth()) {
      return getNextMonthPayments();
    }
    
    return getUpcomingPayments(currentView);
  }, [financialData, currentView, currentMonth, getNextMonthPayments, getUpcomingPayments]);

  const yearlyData = useMemo(() => {
    if (!financialData || currentView !== 'yearly') return [];
    return getYearlyUpcomingPayments();
  }, [financialData, currentView, getYearlyUpcomingPayments]);

  const loanCreditPayments = useMemo(() => {
    return upcomingPayments.filter(bill => 
      bill.category === 'Loan' || bill.category === 'Credit Card' || 
      bill.type === 'laina' || bill.type === 'luottokortti' ||
      bill.type === 'loan_payment' || bill.type === 'credit_payment'
    );
  }, [upcomingPayments]);

  const regularBills = useMemo(() => {
    return upcomingPayments.filter(bill => 
      bill.category !== 'Loan' && bill.category !== 'Credit Card' && 
      bill.type !== 'laina' && bill.type !== 'luottokortti' &&
      bill.type !== 'loan_payment' && bill.type !== 'credit_payment'
    );
  }, [upcomingPayments]);

  const totalAmount = useMemo(() => {
    if (currentView === 'yearly') {
      return yearlyData.reduce((sum, monthData) => sum + monthData.totalAmount, 0);
    }
    return upcomingPayments.reduce((sum, bill) => sum + bill.amount, 0);
  }, [currentView, yearlyData, upcomingPayments]);

  // Show loading only after all hooks are called
  if (!financialData) {
    return <div className="p-4 text-sidebar-foreground bg-sidebar min-h-screen max-w-md mx-auto">{t('loading')}</div>;
  }

  return (
    <div className="p-4 pb-20 bg-sidebar min-h-screen max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')} 
            className="text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50"
            aria-label={t('back_to_home')}
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Button>
          <h1 className="text-2xl font-bold text-white">{t('upcoming')}</h1>
        </div>
        <Button 
          onClick={() => navigate('/add')} 
          size="sm" 
          className="bg-[#294D73] hover:bg-[#1f3a5f] focus:ring-2 focus:ring-white/50"
          aria-label={t('add_new_payment')}
        >
          <Plus size={16} aria-hidden="true" />
        </Button>
      </header>

      {/* View Toggle */}
      <div className="flex space-x-2 mb-6" role="tablist" aria-label={t('view_options')}>
        <Button 
          variant={currentView === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('week')}
          className={currentView === 'week' ? 'bg-[#294D73]' : 'border-white/20 text-white hover:bg-white/10'}
          role="tab"
          aria-selected={currentView === 'week'}
          aria-controls="payment-content"
        >
          {t('this_week')}
        </Button>
        <Button 
          variant={currentView === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('month')}
          className={currentView === 'month' ? 'bg-[#294D73]' : 'border-white/20 text-white hover:bg-white/10'}
          role="tab"
          aria-selected={currentView === 'month'}
          aria-controls="payment-content"
        >
          {t('month')}
        </Button>
        <Button 
          variant={currentView === 'yearly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('yearly')}
          className={currentView === 'yearly' ? 'bg-[#294D73]' : 'border-white/20 text-white hover:bg-white/10'}
          role="tab"
          aria-selected={currentView === 'yearly'}
          aria-controls="payment-content"
        >
          {t('year')}
        </Button>
      </div>

      {/* Month Navigation (only for month view) */}
      {currentView === 'month' && (
        <div className="flex items-center justify-between mb-4" role="navigation" aria-label={t('month_navigation')}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateMonth('prev')} 
            className="text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50"
            aria-label={t('previous_month')}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </Button>
          <h2 className="text-white font-semibold" aria-live="polite">
            {getMonthName(currentMonth)} {currentYear}
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateMonth('next')} 
            className="text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50"
            aria-label={t('next_month')}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <main id="payment-content" tabIndex={-1}>
        {/* Yearly View */}
        {currentView === 'yearly' ? (
          <div className="space-y-6">
            {yearlyData.length === 0 ? (
              <Card className="bg-[#294D73] border-none">
                <CardContent className="p-4">
                  <div className="text-white/70 text-center py-4" role="status">
                    {t('no_payments_for_year')} {new Date().getFullYear()}
                  </div>
                </CardContent>
              </Card>
            ) : (
            yearlyData.map(monthData => (
              <Card key={`${monthData.year}-${monthData.month}`} className="bg-[#294D73] border-none">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{getMonthName(monthData.month)} {monthData.year}</span>
                    <Badge variant="outline" className="text-orange-300 border-orange-300">
                      €{monthData.totalAmount.toFixed(2)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Loan/Credit Payments for this month */}
                  {monthData.loanCreditPayments.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-white/80">{t('loans_and_credits')}</div>
                      {monthData.loanCreditPayments.map(bill => (
                        <div key={bill.id} className="flex justify-between items-center p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                          <div>
                            <div className="font-medium text-white">{bill.name}</div>
                            <div className="text-sm text-white/70">{t('due')} {bill.dueDate}</div>
                            {bill.category && (
                              <Badge variant="outline" className="text-xs border-red-300 text-red-300 mt-1">
                                {bill.category}
                              </Badge>
                            )}
                          </div>
                          <div className="font-bold text-red-300">€{bill.amount.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Regular Bills for this month */}
                  {monthData.regularBills.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-white/80">{t('monthly_payments')}</div>
                      {monthData.regularBills.map(bill => (
                        <div key={bill.id} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium text-white">{bill.name}</div>
                              <div className="text-sm text-white/70">{t('due')} {bill.dueDate}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="font-bold text-white">€{bill.amount.toFixed(2)}</div>
                              <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                                {bill.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Loan/Credit Payments */}
          {loanCreditPayments.length > 0 && (
            <Card className="mb-6 bg-[#294D73] border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Calendar size={20} />
                  <span>{t('loans_and_credits')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loanCreditPayments.map(bill => (
                  <div key={bill.id} className="flex justify-between items-center p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                    <div>
                      <div className="font-medium text-white">{bill.name}</div>
                      <div className="text-sm text-white/70">{t('due')} {bill.dueDate}</div>
                      {bill.category && (
                        <Badge variant="outline" className="text-xs border-red-300 text-red-300 mt-1">
                          {bill.category}
                        </Badge>
                      )}
                    </div>
                    <div className="font-bold text-red-300">€{bill.amount.toFixed(2)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Regular Monthly Payments */}
          <Card className="bg-[#294D73] border-none">
            <CardHeader>
              <CardTitle className="text-white">{t('monthly_payments')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {regularBills.length === 0 ? (
                <div className="text-white/70 text-center py-4">
                  {t('no_payments')}
                </div>
              ) : (
                regularBills.map(bill => (
                  <div key={bill.id} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium text-white">{bill.name}</div>
                        <div className="text-sm text-white/70">{t('due')} {bill.dueDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="font-bold text-white">€{bill.amount.toFixed(2)}</div>
                        <Badge variant="outline" className="text-xs border-white/30 text-white/70">
                          {bill.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          </>
        )}
      </main>

      {/* Summary */}
      <Card className="mt-6 bg-[#294D73] border-none">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-white">
            <span className="text-lg">
              {currentView === 'week' && t('this_week_colon')}
              {currentView === 'month' && `${getMonthName(currentMonth)}:`}
              {currentView === 'yearly' && `${t('year_colon')} ${new Date().getFullYear()}:`}
            </span>
            <span className="text-xl font-bold text-orange-300" aria-label={`${t('total_amount')} €${totalAmount.toFixed(2)}`}>
              €{totalAmount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpcomingPayments;
