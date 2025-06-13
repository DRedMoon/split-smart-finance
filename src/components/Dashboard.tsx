
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, saveFinancialData, getDefaultFinancialData, type FinancialData } from '@/services/storageService';
import { schedulePaymentNotifications } from '@/services/notificationService';

const Dashboard = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData>(getDefaultFinancialData());
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const savedData = loadFinancialData();
    if (savedData) {
      setFinancialData(savedData);
    } else {
      const defaultData = getDefaultFinancialData();
      setFinancialData(defaultData);
      saveFinancialData(defaultData);
    }
  }, []);

  useEffect(() => {
    // Schedule notifications for upcoming payments
    const upcomingPayments = financialData.monthlyBills
      .filter(bill => !bill.paid)
      .map(bill => ({
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate
      }));
    
    schedulePaymentNotifications(upcomingPayments);
  }, [financialData.monthlyBills]);

  const totalLoansCredits = financialData.loans.reduce((sum, loan) => sum + loan.currentAmount, 0);
  const monthlyPayments = financialData.monthlyBills.reduce((sum, bill) => sum + bill.amount, 0);

  const cards = [
    {
      title: t('balance'),
      color: 'bg-[#294D73]',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">{t('current_balance')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 h-auto text-white hover:bg-white/10"
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          <div className="text-3xl font-bold text-white">
            {showBalance ? `€${financialData.balance.toLocaleString('fi-FI', { minimumFractionDigits: 2 })}` : '••••••'}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">{t('this_month')}</span>
            <span className="text-green-300">+€340,25</span>
          </div>
        </div>
      )
    },
    {
      title: t('loans_credits'),
      color: 'bg-[#294D73]',
      content: (
        <div className="space-y-3">
          <div className="text-2xl font-bold text-red-300">
            €{totalLoansCredits.toLocaleString('fi-FI', { minimumFractionDigits: 2 })}
          </div>
          <div className="space-y-2">
            {financialData.loans.map(loan => (
              <div key={loan.id} className="flex justify-between items-center p-2 bg-white/10 rounded">
                <div>
                  <div className="font-medium text-sm text-white">{loan.name}</div>
                  <div className="text-xs text-white/70">{loan.remaining} {t('remaining')}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">€{loan.currentAmount.toLocaleString('fi-FI')}</div>
                  <div className="text-xs text-white/70">€{loan.monthly}/kk</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: t('monthly_payments'),
      color: 'bg-[#294D73]',
      content: (
        <div className="space-y-3">
          <div className="text-2xl font-bold text-orange-300">
            €{monthlyPayments.toLocaleString('fi-FI', { minimumFractionDigits: 2 })}
          </div>
          <div className="space-y-2">
            {financialData.monthlyBills.slice(0, 3).map(bill => (
              <div key={bill.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs border-white/30 text-white">{bill.dueDate}</Badge>
                  <span className="text-sm text-white">{bill.name}</span>
                </div>
                <span className="font-semibold text-white">€{bill.amount}</span>
              </div>
            ))}
            <button 
              className="text-xs text-blue-300 hover:underline"
              onClick={() => navigate('/expenses/monthly')}
            >
              {t('view_all_payments')} ({financialData.monthlyBills.length})
            </button>
          </div>
        </div>
      )
    }
  ];

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleSwipe = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const target = e.currentTarget as HTMLElement;
    const touchStart = target.dataset.touchStart;
    
    if (touchStart) {
      const diff = parseInt(touchStart) - touchEnd;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextCard();
        } else {
          prevCard();
        }
      }
    }
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('financial_overview')}</h1>
          <p className="text-white/70">{t('manage_expenses')}</p>
        </div>
        <Button
          onClick={() => navigate('/add')}
          className="rounded-full w-12 h-12 p-0 bg-[#294D73] hover:bg-[#1f3a5f]"
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* Swipeable Cards */}
      <div className="relative">
        <Card 
          className={`min-h-[200px] touch-pan-y ${cards[currentCard].color} border-none text-white`}
          onTouchStart={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.dataset.touchStart = e.touches[0].clientX.toString();
          }}
          onTouchEnd={handleSwipe}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-white">
              {cards[currentCard].title}
            </CardTitle>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevCard}
                className="p-1 h-auto text-white hover:bg-white/10"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextCard}
                className="p-1 h-auto text-white hover:bg-white/10"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {cards[currentCard].content}
          </CardContent>
        </Card>

        {/* Card Indicators */}
        <div className="flex justify-center space-x-2 mt-3">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCard(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentCard ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/expenses/loans')}
          className="h-20 flex flex-col items-center justify-center space-y-1 bg-[#294D73] border-[#294D73] text-white hover:bg-[#1f3a5f]"
        >
          <span className="text-lg">🏦</span>
          <span className="text-sm">{t('loans_credits')}</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/transactions')}
          className="h-20 flex flex-col items-center justify-center space-y-1 bg-[#294D73] border-[#294D73] text-white hover:bg-[#1f3a5f]"
        >
          <span className="text-lg">📊</span>
          <span className="text-sm">{t('transactions')}</span>
        </Button>
      </div>

      {/* Upcoming Payments */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-lg text-white">{t('upcoming_week')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {financialData.monthlyBills.filter(bill => !bill.paid).slice(0, 2).map(bill => (
            <div key={bill.id} className="flex justify-between items-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <div>
                <div className="font-medium text-white">{bill.name}</div>
                <div className="text-sm text-white/70">{t('due')} {bill.dueDate}</div>
              </div>
              <div className="font-bold text-yellow-300">€{bill.amount}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
