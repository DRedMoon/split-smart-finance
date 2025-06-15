
import React, { useState } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { loadFinancialData } from '@/services/storageService';
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
  const [showAllLoanCredit, setShowAllLoanCredit] = useState(false);

  console.log('MonthlyPaymentsCard - Received monthly bills:', monthlyBills);

  const handleNavigateToMonthlyPayments = () => {
    localStorage.setItem('dashboardLastView', 'monthly-payments');
    navigate('/monthly-payments');
  };

  // Get all loans to ensure we have all loan payments
  const data = loadFinancialData();
  const allLoans = data?.loans || [];
  
  console.log('MonthlyPaymentsCard - All loans from data:', allLoans);
  
  // Create comprehensive list of loan/credit payments
  const allLoanPayments: any[] = [];
  
  // Add existing loan bills from monthlyBills
  const existingLoanBills = monthlyBills.filter((bill: any) => 
    bill.category === 'Loan' || bill.category === 'Credit Card' || 
    bill.type === 'loan_payment' || bill.type === 'credit_payment'
  );
  
  // Add all existing loan bills
  existingLoanBills.forEach(bill => {
    allLoanPayments.push(bill);
  });
  
  // Add missing loan payments from loans that don't have bills yet
  allLoans.forEach(loan => {
    const existingBill = existingLoanBills.find(bill => bill.name === loan.name);
    if (!existingBill && loan.monthly > 0) {
      console.log('MonthlyPaymentsCard - Adding missing loan payment for:', loan.name);
      const isCredit = loan.remaining === 'Credit Card';
      allLoanPayments.push({
        id: `loan-${loan.id}`,
        name: loan.name,
        amount: loan.monthly,
        dueDate: loan.dueDate || '1',
        category: isCredit ? 'Credit Card' : 'Loan',
        type: isCredit ? 'credit_payment' : 'loan_payment',
        paid: false
      });
    }
  });

  const loanCreditPayments = allLoanPayments;

  const regularBills = monthlyBills.filter((bill: any) => 
    bill.category !== 'Loan' && bill.category !== 'Credit Card' && 
    bill.type !== 'loan_payment' && bill.type !== 'credit_payment'
  );

  console.log('MonthlyPaymentsCard - Final loan/credit payments:', loanCreditPayments);
  console.log('MonthlyPaymentsCard - Regular bills:', regularBills);

  // Calculate totals for regular bills only
  const totalRegularAmount = regularBills.reduce((sum: number, bill: any) => sum + (bill.amount || 0), 0);
  const paidRegularBills = regularBills.filter((bill: any) => bill.paid);
  const paidRegularAmount = paidRegularBills.reduce((sum: number, bill: any) => sum + bill.amount, 0);

  // Calculate totals for loan/credit payments only
  const totalLoanCreditAmount = loanCreditPayments.reduce((sum: number, bill: any) => sum + (bill.amount || 0), 0);
  const paidLoanCreditBills = loanCreditPayments.filter((bill: any) => bill.paid);
  const paidLoanCreditAmount = paidLoanCreditBills.reduce((sum: number, bill: any) => sum + bill.amount, 0);

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
        {/* Regular Monthly Payments Section */}
        <PaymentSectionRenderer
          title="Laskut"
          bills={regularBills}
          totalAmount={totalRegularAmount}
          paidAmount={paidRegularAmount}
          showAll={showAllRegular}
          onToggleShowAll={() => setShowAllRegular(!showAllRegular)}
          onTogglePaid={handleTogglePaid}
        />

        {/* Loans & Credits Section */}
        <PaymentSectionRenderer
          title="Lainat ja luotot"
          bills={loanCreditPayments}
          totalAmount={totalLoanCreditAmount}
          paidAmount={paidLoanCreditAmount}
          showAll={showAllLoanCredit}
          onToggleShowAll={() => setShowAllLoanCredit(!showAllLoanCredit)}
          onTogglePaid={handleTogglePaid}
          isLoanSection={true}
        />
        
        <Button
          variant="ghost"
          onClick={handleNavigateToMonthlyPayments}
          className="w-full text-white hover:bg-white/10"
        >
          Näytä kaikki maksut
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default MonthlyPaymentsCard;
