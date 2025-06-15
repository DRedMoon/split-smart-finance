
import React, { useState } from 'react';
import { ArrowRight, Calendar, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import { useToast } from '@/hooks/use-toast';

interface MonthlyPaymentsCardProps {
  monthlyBills: any[];
  totalBillsAmount: number;
}

const MonthlyPaymentsCard = ({ monthlyBills }: MonthlyPaymentsCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAllRegular, setShowAllRegular] = useState(false);
  const [showAllLoanCredit, setShowAllLoanCredit] = useState(false);

  console.log('MonthlyPaymentsCard - Received monthly bills:', monthlyBills);

  const handleTogglePaid = (billId: string | number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    const data = loadFinancialData();
    if (!data) return;

    console.log('MonthlyPaymentsCard - Toggling payment for bill ID:', billId);

    // Handle loan payment bills (generated from loans)
    if (typeof billId === 'string' && billId.startsWith('loan-')) {
      const loanId = parseInt(billId.replace('loan-', ''));
      const loan = data.loans.find((l: any) => l.id === loanId);
      
      if (!loan) {
        console.error('Loan not found for ID:', loanId);
        return;
      }

      // Find or create the monthly bill for this loan
      let billIndex = data.monthlyBills.findIndex((b: any) => b.name === loan.name);
      
      if (billIndex === -1) {
        // Create the bill if it doesn't exist
        const isCredit = loan.remaining === 'Credit Card';
        const newBill = {
          id: Date.now() + Math.random(),
          name: loan.name,
          amount: loan.monthly,
          dueDate: loan.dueDate || '1',
          category: isCredit ? 'Credit Card' : 'Loan',
          type: isCredit ? 'credit_payment' : 'loan_payment',
          paid: false
        };
        data.monthlyBills.push(newBill);
        billIndex = data.monthlyBills.length - 1;
        console.log('MonthlyPaymentsCard - Created new bill for loan:', newBill);
      }

      const bill = data.monthlyBills[billIndex];
      const newPaidStatus = !bill.paid;

      if (newPaidStatus) {
        if (data.balance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${data.balance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        data.monthlyBills[billIndex].paid = true;
        data.balance -= bill.amount;
        
        // Update loan current amount
        const loanToUpdate = data.loans.find((l: any) => l.id === loanId);
        if (loanToUpdate) {
          loanToUpdate.currentAmount = Math.max(0, loanToUpdate.currentAmount - bill.amount);
          loanToUpdate.lastPayment = new Date().toISOString().split('T')[0];
        }
        
        toast({
          title: 'Maksu käsitelty',
          description: `${bill.name} merkitty maksetuksi`
        });
      } else {
        data.monthlyBills[billIndex].paid = false;
        data.balance += bill.amount;
        
        // Restore loan current amount
        const loanToUpdate = data.loans.find((l: any) => l.id === loanId);
        if (loanToUpdate) {
          loanToUpdate.currentAmount += bill.amount;
        }
        
        toast({
          title: 'Maksu peruutettu',
          description: `${bill.name} merkitty maksamattomaksi`
        });
      }
    } else {
      // Handle regular monthly bills
      const billIndex = data.monthlyBills.findIndex((b: any) => b.id === billId);
      if (billIndex === -1) return;

      const bill = data.monthlyBills[billIndex];
      const newPaidStatus = !bill.paid;

      if (newPaidStatus) {
        if (data.balance < bill.amount) {
          toast({
            title: 'Riittämätön saldo',
            description: `Saldo: €${data.balance.toFixed(2)}, Vaaditaan: €${bill.amount.toFixed(2)}`,
            variant: "destructive"
          });
          return;
        }
        
        data.monthlyBills[billIndex].paid = true;
        data.balance -= bill.amount;
        
        toast({
          title: 'Maksu käsitelty',
          description: `${bill.name} merkitty maksetuksi`
        });
      } else {
        data.monthlyBills[billIndex].paid = false;
        data.balance += bill.amount;
        
        toast({
          title: 'Maksu peruutettu',
          description: `${bill.name} merkitty maksamattomaksi`
        });
      }
    }
    
    saveFinancialData(data);
    window.dispatchEvent(new CustomEvent('financial-data-updated'));
  };

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

  const displayedRegular = showAllRegular ? regularBills : regularBills.slice(0, 2);
  const displayedLoanCredit = showAllLoanCredit ? loanCreditPayments : loanCreditPayments.slice(0, 2);

  const renderBillItem = (bill: any, isLoanPayment: boolean = false) => {
    const isPaid = bill.paid || false;
    
    return (
      <div key={bill.id} className={`rounded p-2 ${isPaid ? 'bg-green-500/20 border border-green-500/30' : isLoanPayment ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/10'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleTogglePaid(bill.id, e)}
              className={`p-1 h-6 w-6 ${isPaid ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {isPaid ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
            </Button>
            <div>
              <span className="text-white text-sm font-medium">{bill.name}</span>
              <div className="flex items-center space-x-2">
                {isLoanPayment && (
                  <span className="text-xs bg-red-500/30 px-1 py-0.5 rounded text-red-200">
                    {bill.category === 'Credit Card' ? 'Luotto' : 'Laina'}
                  </span>
                )}
                <span className={`text-xs ${isPaid ? 'text-green-400' : 'text-red-400'}`}>
                  {isPaid ? 'Maksettu' : 'Maksamaton'}
                </span>
              </div>
            </div>
          </div>
          <span className={`text-sm ${isPaid ? 'text-green-400' : isLoanPayment ? 'text-red-300' : 'text-white/70'}`}>€{bill.amount.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <Calendar size={20} />
          <span>Kuukausimaksut</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNavigateToMonthlyPayments}
          className="text-white hover:bg-white/10 p-2"
        >
          <ArrowRight size={20} />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Regular Monthly Payments Section */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Laskut</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/70 text-sm">Yhteensä</p>
              <p className="text-white font-semibold">€{totalRegularAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Maksettu</p>
              <p className="text-green-400 font-semibold">€{paidRegularAmount.toFixed(2)}</p>
            </div>
          </div>
          
          {regularBills.length > 0 ? (
            <div className="space-y-2 mb-4">
              {displayedRegular.map(bill => renderBillItem(bill, false))}
              {regularBills.length > 2 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllRegular(!showAllRegular)}
                  className="w-full text-white/70 hover:text-white hover:bg-white/10 text-sm"
                >
                  {showAllRegular ? 'Näytä vähemmän' : `+${regularBills.length - 2} lisää`}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-white/60 text-sm mb-4">Ei laskuja</p>
          )}
        </div>

        {/* Loans & Credits Section */}
        {loanCreditPayments.length > 0 && (
          <div className="mb-4">
            <h3 className="text-white font-medium mb-3">Lainat ja luotot</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-white/70 text-sm">Yhteensä</p>
                <p className="text-white font-semibold">€{totalLoanCreditAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Maksettu</p>
                <p className="text-green-400 font-semibold">€{paidLoanCreditAmount.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {displayedLoanCredit.map(bill => renderBillItem(bill, true))}
              {loanCreditPayments.length > 2 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAllLoanCredit(!showAllLoanCredit)}
                  className="w-full text-white/70 hover:text-white hover:bg-white/10 text-sm"
                >
                  {showAllLoanCredit ? 'Näytä vähemmän' : `+${loanCreditPayments.length - 2} lisää`}
                </Button>
              )}
            </div>
          </div>
        )}
        
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
