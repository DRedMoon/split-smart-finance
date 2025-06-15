
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { addLoan } from '@/services/loanService';
import LoanFormFields from './loan/LoanFormFields';
import LoanCalculationDisplay from './loan/LoanCalculationDisplay';
import { calculateInterestFromPayments } from '@/services/calculationService';

const AddLoan = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [loanData, setLoanData] = useState({
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
    dueDate: ''
  });

  const [calculatedValues, setCalculatedValues] = useState({
    monthlyPayment: 0,
    totalPayback: 0,
    yearlyRate: 0,
    estimatedEuribor: 0,
    estimatedMargin: 0
  });

  const [isCredit, setIsCredit] = useState(false);

  // Helper function to convert string values to numbers
  const getNumericValue = (value: number | string): number => {
    if (typeof value === 'string') {
      if (value === '' || value === '.' || value === ',') return 0;
      const normalizedValue = value.replace(',', '.');
      return parseFloat(normalizedValue) || 0;
    }
    return value || 0;
  };

  // Calculate rates from payment data when monthly payment is provided
  useEffect(() => {
    const totalAmount = getNumericValue(loanData.totalAmount);
    const monthly = getNumericValue(loanData.monthly);
    const managementFee = getNumericValue(loanData.managementFee);
    
    if (totalAmount > 0 && monthly > 0 && loanData.remaining && !isCredit) {
      const termMonths = parseInt(loanData.remaining.match(/\d+/)?.[0] || '0');
      if (termMonths > 0) {
        const calculation = calculateInterestFromPayments(
          totalAmount,
          monthly,
          managementFee,
          termMonths
        );
        
        setCalculatedValues({
          monthlyPayment: monthly,
          totalPayback: monthly * termMonths,
          yearlyRate: calculation.yearlyRate,
          estimatedEuribor: calculation.euriborEstimate,
          estimatedMargin: calculation.marginEstimate
        });
      }
    }
  }, [loanData.totalAmount, loanData.monthly, loanData.managementFee, loanData.remaining, isCredit]);

  const handleAddLoan = () => {
    const totalAmount = getNumericValue(loanData.totalAmount);
    const monthly = getNumericValue(loanData.monthly);
    
    if (!loanData.name || totalAmount === 0 || monthly === 0) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    const termMonths = parseInt(loanData.remaining.match(/\d+/)?.[0] || '0');
    const totalPayback = monthly * termMonths;

    // Store exactly what the user entered - convert string values to numbers for storage
    const loanToAdd = {
      name: loanData.name,
      totalAmount: totalAmount,
      currentAmount: getNumericValue(loanData.currentAmount) || totalAmount,
      monthly: monthly,
      rate: getNumericValue(loanData.rate),
      euriborRate: getNumericValue(loanData.euriborRate),
      personalMargin: getNumericValue(loanData.personalMargin),
      managementFee: getNumericValue(loanData.managementFee),
      minimumPercent: getNumericValue(loanData.minimumPercent) || 3,
      remaining: isCredit ? 'Credit Card' : loanData.remaining,
      dueDate: loanData.dueDate,
      lastPayment: new Date().toISOString().split('T')[0],
      totalPayback: totalPayback,
      yearlyInterestRate: getNumericValue(loanData.rate)
    };

    console.log('AddLoan - Storing loan data:', loanToAdd);
    addLoan(loanToAdd);
    
    toast({
      title: t('loan_added'),
      description: `${loanData.name}: €${totalAmount.toFixed(2)}`
    });

    navigate('/loans-credits');
  };

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/loans-credits')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('add_loan')}</h1>
      </div>

      <LoanCalculationDisplay calculatedValues={calculatedValues} />

      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('add_loan')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoanFormFields 
            loanData={loanData}
            setLoanData={setLoanData}
            calculatedValues={calculatedValues}
            isCredit={isCredit}
            setIsCredit={setIsCredit}
          />
          
          <Button onClick={handleAddLoan} className="w-full bg-white text-[#294D73]">
            <Plus size={16} className="mr-2" />
            {t('add_loan')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLoan;
