import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import { calculateInterestFromPayments } from '@/services/calculationService';
import LoanFormFields from './loan/LoanFormFields';
import LoanCalculationDisplay from './loan/LoanCalculationDisplay';

const EditLoan = () => {
  const navigate = useNavigate();
  const { loanId } = useParams();
  const { t } = useSafeLanguage();
  const { toast } = useToast();
  
  const [loanData, setLoanData] = useState({
    id: 0,
    name: '',
    totalAmount: 0,
    currentAmount: 0,
    monthly: 0,
    rate: 0,
    euriborRate: 0,
    personalMargin: 0,
    managementFee: 0,
    minimumPercent: 3,
    remaining: '',
    dueDate: '',
    lastPayment: '',
    totalPayback: 0,
    yearlyInterestRate: 0
  });

  const [calculatedValues, setCalculatedValues] = useState({
    monthlyPayment: 0,
    totalPayback: 0,
    yearlyRate: 0,
    estimatedEuribor: 0,
    estimatedMargin: 0
  });

  const [isCredit, setIsCredit] = useState(false);

  useEffect(() => {
    if (loanId) {
      const data = loadFinancialData();
      if (data?.loans) {
        const existingLoan = data.loans.find(loan => loan.id === parseFloat(loanId));
        if (existingLoan) {
          const fullLoanData = {
            id: existingLoan.id,
            name: existingLoan.name,
            totalAmount: existingLoan.totalAmount,
            currentAmount: existingLoan.currentAmount,
            monthly: existingLoan.monthly,
            rate: existingLoan.rate,
            euriborRate: existingLoan.euriborRate || 0,
            personalMargin: existingLoan.personalMargin || 0,
            managementFee: existingLoan.managementFee || 0,
            minimumPercent: existingLoan.minimumPercent || 3,
            remaining: existingLoan.remaining,
            dueDate: existingLoan.dueDate,
            lastPayment: existingLoan.lastPayment,
            totalPayback: existingLoan.totalPayback || existingLoan.totalAmount,
            yearlyInterestRate: existingLoan.yearlyInterestRate || existingLoan.rate
          };
          setLoanData(fullLoanData);
          setIsCredit(existingLoan.remaining === 'Credit Card');
        }
      }
    }
  }, [loanId]);

  // Calculate rates from user's payment data - but keep their monthly payment input
  useEffect(() => {
    if (!isCredit && loanData.totalAmount > 0 && loanData.monthly > 0 && loanData.remaining) {
      const termMonths = parseInt(loanData.remaining.match(/\d+/)?.[0] || '12');
      if (termMonths > 0) {
        const calculation = calculateInterestFromPayments(
          loanData.totalAmount,
          loanData.monthly,
          loanData.managementFee || 0,
          termMonths
        );
        
        setCalculatedValues({
          monthlyPayment: loanData.monthly, // Use user's input, don't override
          totalPayback: loanData.monthly * termMonths, // Calculate from user's monthly payment
          yearlyRate: calculation.yearlyRate,
          estimatedEuribor: calculation.euriborEstimate,
          estimatedMargin: calculation.marginEstimate
        });
      }
    }
  }, [loanData.totalAmount, loanData.monthly, loanData.managementFee, loanData.remaining, isCredit]);

  const handleSave = () => {
    if (!loanData.name || loanData.totalAmount === 0) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    const data = loadFinancialData();
    if (data && data.loans) {
      const loanIndex = data.loans.findIndex(loan => loan.id === loanData.id);
      if (loanIndex !== -1) {
        // Keep user's monthly payment, but update calculated fields
        const updatedLoan = {
          ...loanData,
          rate: loanData.rate || calculatedValues.yearlyRate,
          monthly: loanData.monthly, // Always keep user's input
          totalPayback: calculatedValues.totalPayback || loanData.totalPayback,
          yearlyInterestRate: calculatedValues.yearlyRate || loanData.yearlyInterestRate,
          euriborRate: loanData.euriborRate,
          personalMargin: loanData.personalMargin
        };
        
        data.loans[loanIndex] = updatedLoan;
        
        // Update corresponding monthly bill if it exists
        const billIndex = data.monthlyBills.findIndex(bill => bill.name === loanData.name);
        if (billIndex !== -1) {
          data.monthlyBills[billIndex] = {
            ...data.monthlyBills[billIndex],
            name: updatedLoan.name,
            amount: updatedLoan.monthly,
            dueDate: updatedLoan.dueDate
          };
        }
        
        saveFinancialData(data);
        
        toast({
          title: t('loan_updated'),
          description: `${loanData.name} ${t('updated_successfully')}`
        });
        
        navigate('/manage-loans-credits');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/manage-loans-credits')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isCredit ? t('edit_credit_card') : t('edit_loan')}
        </h1>
      </div>

      <LoanCalculationDisplay calculatedValues={calculatedValues} />

      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">
            {isCredit ? t('edit_credit_card') : t('edit_loan')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoanFormFields 
            loanData={loanData}
            setLoanData={setLoanData}
            calculatedValues={calculatedValues}
            isCredit={isCredit}
          />
          
          <Button onClick={handleSave} className="w-full bg-[#4a90e2] hover:bg-[#357abd] text-white font-medium">
            <Save size={16} className="mr-2" />
            {t('save_changes')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditLoan;
