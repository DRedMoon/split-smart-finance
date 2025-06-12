
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

  // Mock data - in real app this would come from state management/API
  const balance = 2450.75;
  const totalLoansCredits = 12500.00;
  const monthlyPayments = 1875.50;

  const loans = [
    { id: 1, name: "Car Loan", amount: 8500, monthly: 425, rate: 3.5, remaining: "24 months" },
    { id: 2, name: "Student Loan", amount: 4000, monthly: 180, rate: 4.2, remaining: "18 months" }
  ];

  const monthlyBills = [
    { id: 1, name: "Rent", amount: 800, dueDate: "1st", type: "housing" },
    { id: 2, name: "Car Payment", amount: 425, dueDate: "15th", type: "loan" },
    { id: 3, name: "Credit Card", amount: 250, dueDate: "20th", type: "credit" },
    { id: 4, name: "Phone", amount: 65, dueDate: "28th", type: "utility" }
  ];

  const cards = [
    {
      title: "Balance",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 h-auto"
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {showBalance ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">This Month</span>
            <span className="text-green-600">+$340.25</span>
          </div>
        </div>
      )
    },
    {
      title: "Loans & Credits",
      content: (
        <div className="space-y-3">
          <div className="text-2xl font-bold text-red-600">
            ${totalLoansCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="space-y-2">
            {loans.map(loan => (
              <div key={loan.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <div>
                  <div className="font-medium text-sm">{loan.name}</div>
                  <div className="text-xs text-muted-foreground">{loan.remaining} left</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${loan.amount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">${loan.monthly}/mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Monthly Payments",
      content: (
        <div className="space-y-3">
          <div className="text-2xl font-bold text-orange-600">
            ${monthlyPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="space-y-2">
            {monthlyBills.slice(0, 3).map(bill => (
              <div key={bill.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">{bill.dueDate}</Badge>
                  <span className="text-sm">{bill.name}</span>
                </div>
                <span className="font-semibold">${bill.amount}</span>
              </div>
            ))}
            <button 
              className="text-xs text-blue-600 hover:underline"
              onClick={() => navigate('/expenses/monthly')}
            >
              View all {monthlyBills.length} payments
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
    const touchStart = e.currentTarget.dataset.touchStart;
    
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
          <h1 className="text-2xl font-bold">Financial Overview</h1>
          <p className="text-muted-foreground">Manage your expenses and debts</p>
        </div>
        <Button
          onClick={() => navigate('/add')}
          className="rounded-full w-12 h-12 p-0"
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* Swipeable Cards */}
      <div className="relative">
        <Card 
          className="min-h-[200px] touch-pan-y"
          onTouchStart={(e) => {
            e.currentTarget.dataset.touchStart = e.touches[0].clientX.toString();
          }}
          onTouchEnd={handleSwipe}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              {cards[currentCard].title}
            </CardTitle>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevCard}
                className="p-1 h-auto"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextCard}
                className="p-1 h-auto"
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
                index === currentCard ? 'bg-primary' : 'bg-muted'
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
          className="h-20 flex flex-col items-center justify-center space-y-1"
        >
          <span className="text-lg">🏦</span>
          <span className="text-sm">Loans & Credits</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/transactions')}
          className="h-20 flex flex-col items-center justify-center space-y-1"
        >
          <span className="text-lg">📊</span>
          <span className="text-sm">Transactions</span>
        </Button>
      </div>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming This Week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {monthlyBills.slice(0, 2).map(bill => (
            <div key={bill.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <div className="font-medium">{bill.name}</div>
                <div className="text-sm text-muted-foreground">Due {bill.dueDate}</div>
              </div>
              <div className="font-bold text-yellow-700">${bill.amount}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
