
import React, { useState } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import { usePaymentToggleLogic } from './PaymentToggleLogic';
import PaymentSectionRenderer from './PaymentSectionRenderer';

interface MonthlyPaymentsCardProps {
  monthlyBills: any[];
  totalBillsAmount: number;
  currentSlide?: number;
}

const MonthlyPaymentsCard = ({ monthlyBills, currentSlide = 0 }: MonthlyPaymentsCardProps) => {
  const navigate = useNavigate();
  const { handleTogglePaid } = usePaymentToggleLogic();
  const [showAllRegular, setShowAllRegular] = useState(false);

  const handleNavigateToMonthlyPayments = () => {
    localStorage.setItem('dashboardLastView', 'monthly-payments');
    navigate('/monthly-payments');
  };

  // Filter to show only regular bills (no loans/credits)
  const regularBills = monthlyBills.filter((bill: any) => 
    bill.category !== 'Loan' && bill.category !== 'Credit Card' && 
    bill.type !== 'loan_payment' && bill.type !== 'credit_payment'
  );

  // Calculate totals for regular bills only
  const totalRegularAmount = regularBills.reduce((sum: number, bill: any) => sum + (bill.amount || 0), 0);
  const paidRegularBills = regularBills.filter((bill: any) => bill.paid);
  const paidRegularAmount = paidRegularBills.reduce((sum: number, bill: any) => sum + bill.amount, 0);

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <Calendar size={20} />
          <span>Kuukausimaksut</span>
        </CardTitle>
        <div className="flex items-center space-x-3">
          {/* Carousel Indicators */}
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentSlide ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNavigateToMonthlyPayments}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowRight size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Regular Monthly Payments Section Only */}
        <PaymentSectionRenderer
          title="Kuukausimaksut"
          bills={regularBills}
          totalAmount={totalRegularAmount}
          paidAmount={paidRegularAmount}
          showAll={showAllRegular}
          onToggleShowAll={() => setShowAllRegular(!showAllRegular)}
          onTogglePaid={handleTogglePaid}
        />
        
        <Button
          variant="ghost"
          onClick={handleNavigateToMonthlyPayments}
          className="w-full text-white hover:bg-white/10 mt-3"
        >
          Näytä kaikki maksut
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default MonthlyPaymentsCard;
