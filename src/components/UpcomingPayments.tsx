import React, { useState, useEffect } from 'react';
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
  const [currentView, setCurrentView] = useState<'week' | 'month' | 'all'>('week');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    let data = loadFinancialData();
    if (data) {
      data = migratePaymentDataToMonthSpecific(data);
      setFinancialData(data);
    }
  }, []);

  const getUpcomingPayments = (view: 'week' | 'month' | 'all'): NormalizedPayment[] => {
    if (!financialData?.monthlyBills) return [];

    const today = new Date();
    let endDate: Date;

    switch (view) {
      case 'week':
        endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        endDate = new Date(currentYear, currentMonth + 1, 0); // Last day of current month
        break;
      case 'all':
        return financialData.monthlyBills
          .filter(bill => !isPaymentPaidForMonth(bill, currentYear, currentMonth))
          .map(bill => ({
            id: bill.id,
            name: bill.name,
            amount: bill.amount,
            dueDate: bill.dueDate,
            type: bill.type,
            isPaid: isPaymentPaidForMonth(bill, currentYear, currentMonth)
          }));
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
    
    // Include loan/credit payments that still have amounts remaining
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

    // Regular monthly bills
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
      'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
      'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
    ];
    return months[month];
  };

  if (!financialData) {
    return <div className="p-4 text-white bg-[#192E45] min-h-screen max-w-md mx-auto">Ladataan...</div>;
  }

  const upcomingPayments = currentView === 'month' && currentMonth !== new Date().getMonth() 
    ? getNextMonthPayments() 
    : getUpcomingPayments(currentView);

  // Separate loan/credit payments from regular bills
  const loanCreditPayments = upcomingPayments.filter(bill => 
    bill.category === 'Loan' || bill.category === 'Credit Card' || 
    bill.type === 'laina' || bill.type === 'luottokortti' ||
    bill.type === 'loan_payment' || bill.type === 'credit_payment'
  );

  const regularBills = upcomingPayments.filter(bill => 
    bill.category !== 'Loan' && bill.category !== 'Credit Card' && 
    bill.type !== 'laina' && bill.type !== 'luottokortti' &&
    bill.type !== 'loan_payment' && bill.type !== 'credit_payment'
  );

  const totalAmount = upcomingPayments.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white">{t('upcoming')}</h1>
        </div>
        <Button onClick={() => navigate('/add')} size="sm" className="bg-[#294D73] hover:bg-[#1f3a5f]">
          <Plus size={16} />
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2 mb-6">
        <Button 
          variant={currentView === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('week')}
          className={currentView === 'week' ? 'bg-[#294D73]' : 'border-white/20 text-white hover:bg-white/10'}
        >
          Tämä viikko
        </Button>
        <Button 
          variant={currentView === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('month')}
          className={currentView === 'month' ? 'bg-[#294D73]' : 'border-white/20 text-white hover:bg-white/10'}
        >
          Kuukausi
        </Button>
        <Button 
          variant={currentView === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('all')}
          className={currentView === 'all' ? 'bg-[#294D73]' : 'border-white/20 text-white hover:bg-white/10'}
        >
          Kaikki
        </Button>
      </div>

      {/* Month Navigation (only for month view) */}
      {currentView === 'month' && (
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')} className="text-white hover:bg-white/10">
            <ChevronLeft size={16} />
          </Button>
          <h2 className="text-white font-semibold">{getMonthName(currentMonth)} {currentYear}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')} className="text-white hover:bg-white/10">
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Loan/Credit Payments */}
      {loanCreditPayments.length > 0 && (
        <Card className="mb-6 bg-[#294D73] border-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Calendar size={20} />
              <span>Lainat ja luotot</span>
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
              Ei maksuja
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

      {/* Summary */}
      <Card className="mt-6 bg-[#294D73] border-none">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-white">
            <span className="text-lg">
              {currentView === 'week' && 'Tällä viikolla:'}
              {currentView === 'month' && `${getMonthName(currentMonth)}:`}
              {currentView === 'all' && 'Yhteensä tulossa:'}
            </span>
            <span className="text-xl font-bold text-orange-300">
              €{totalAmount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpcomingPayments;
