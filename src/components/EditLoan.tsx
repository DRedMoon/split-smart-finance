
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData, calculateLoanPayment2, calculateCreditPayment } from '@/services/storageService';

const EditLoan = () => {
  const navigate = useNavigate();
  const { loanId } = useParams();
  const { t } = useLanguage();
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
    yearlyRate: 0
  });

  const [isCredit, setIsCredit] = useState(false);

  useEffect(() => {
    if (loanId) {
      const data = loadFinancialData();
      if (data?.loans) {
        const existingLoan = data.loans.find(loan => loan.id === parseFloat(loanId));
        if (existingLoan) {
          // Ensure all required properties are present
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

  // Auto-calculate when relevant fields change
  useEffect(() => {
    if (isCredit) {
      // Credit card calculation
      if (loanData.currentAmount > 0 && loanData.rate > 0) {
        const calculation = calculateCreditPayment(
          loanData.currentAmount,
          loanData.rate,
          loanData.managementFee || 0,
          loanData.minimumPercent || 3
        );
        setCalculatedValues({
          monthlyPayment: calculation.monthlyMinimum,
          totalPayback: calculation.totalWithInterest,
          yearlyRate: loanData.rate
        });
      }
    } else {
      // Loan calculation
      if (loanData.totalAmount > 0 && loanData.euriborRate >= 0 && loanData.personalMargin >= 0) {
        const termMonths = parseInt(loanData.remaining.match(/\d+/)?.[0] || '12');
        if (termMonths > 0) {
          const calculation = calculateLoanPayment2(
            loanData.totalAmount,
            loanData.euriborRate,
            loanData.personalMargin,
            loanData.managementFee || 0,
            termMonths
          );
          setCalculatedValues(calculation);
        }
      }
    }
  }, [loanData.totalAmount, loanData.currentAmount, loanData.euriborRate, loanData.personalMargin, loanData.managementFee, loanData.remaining, loanData.rate, loanData.minimumPercent, isCredit]);

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
        // Update with calculated values if they exist
        const updatedLoan = {
          ...loanData,
          rate: calculatedValues.yearlyRate || loanData.rate,
          monthly: loanData.monthly || calculatedValues.monthlyPayment,
          totalPayback: calculatedValues.totalPayback || loanData.totalPayback,
          yearlyInterestRate: calculatedValues.yearlyRate || loanData.yearlyInterestRate
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

      {/* Calculation Info */}
      {calculatedValues.monthlyPayment > 0 && (
        <Card className="mb-4 bg-green-500/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calculator size={20} className="mr-2" />
              {t('calculated_values')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/70">{t('monthly_payment')}</p>
                <p className="text-white font-medium">€{calculatedValues.monthlyPayment.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/70">{t('total_payback')}</p>
                <p className="text-white font-medium">€{calculatedValues.totalPayback.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">
            {isCredit ? t('edit_credit_card') : t('edit_loan')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">
              {isCredit ? t('credit_card_name') : t('loan_name')}
            </Label>
            <Input
              id="name"
              value={loanData.name}
              onChange={(e) => setLoanData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white/10 border-white/20 text-white mt-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total-amount" className="text-white">
                {isCredit ? t('credit_limit') : t('total_amount')}
              </Label>
              <Input
                id="total-amount"
                type="number"
                value={loanData.totalAmount || ''}
                onChange={(e) => setLoanData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="current-amount" className="text-white">
                {isCredit ? t('used_credit') : t('current_amount')}
              </Label>
              <Input
                id="current-amount"
                type="number"
                value={loanData.currentAmount || ''}
                onChange={(e) => setLoanData(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
              />
            </div>
          </div>

          {!isCredit && (
            <>
              <div>
                <Label htmlFor="remaining-months" className="text-white">{t('remaining_months')}</Label>
                <Input
                  id="remaining-months"
                  value={loanData.remaining}
                  onChange={(e) => setLoanData(prev => ({ ...prev, remaining: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="euribor-rate" className="text-white">{t('euribor_rate')} (%)</Label>
                  <Input
                    id="euribor-rate"
                    type="number"
                    step="0.01"
                    value={loanData.euriborRate || ''}
                    onChange={(e) => setLoanData(prev => ({ ...prev, euriborRate: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="personal-margin" className="text-white">{t('personal_margin')} (%)</Label>
                  <Input
                    id="personal-margin"
                    type="number"
                    step="0.01"
                    value={loanData.personalMargin || ''}
                    onChange={(e) => setLoanData(prev => ({ ...prev, personalMargin: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                  />
                </div>
              </div>
            </>
          )}

          {isCredit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearly-interest" className="text-white">{t('yearly_interest')} (%)</Label>
                <Input
                  id="yearly-interest"
                  type="number"
                  step="0.01"
                  value={loanData.rate || ''}
                  onChange={(e) => setLoanData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="minimum-percent" className="text-white">{t('minimum_payment_percent')} (%)</Label>
                <Input
                  id="minimum-percent"
                  type="number"
                  step="0.1"
                  value={loanData.minimumPercent || ''}
                  onChange={(e) => setLoanData(prev => ({ ...prev, minimumPercent: parseFloat(e.target.value) || 3 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="management-fee" className="text-white">{t('management_fee')} (€)</Label>
              <Input
                id="management-fee"
                type="number"
                value={loanData.managementFee || ''}
                onChange={(e) => setLoanData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="due-date" className="text-white">{t('due_date')}</Label>
              <Input
                id="due-date"
                value={loanData.dueDate}
                onChange={(e) => setLoanData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="bg-white/10 border-white/20 text-white mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="monthly-payment" className="text-white">{t('monthly_payment')} (€)</Label>
            <Input
              id="monthly-payment"
              type="number"
              value={loanData.monthly || ''}
              onChange={(e) => setLoanData(prev => ({ ...prev, monthly: parseFloat(e.target.value) || 0 }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder={calculatedValues.monthlyPayment > 0 ? calculatedValues.monthlyPayment.toFixed(2) : "0.00"}
            />
          </div>
          
          <Button onClick={handleSave} className="w-full bg-white text-[#294D73]">
            <Save size={16} className="mr-2" />
            {t('save_changes')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditLoan;
