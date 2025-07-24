
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, CreditCard, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, addTransaction, saveFinancialData } from '@/services/storageService';
import { FinancialData } from '@/services/types';

const QuickPaymentEntry = () => {
  const navigate = useNavigate();
  const { t } = useSafeLanguage();
  const { toast } = useToast();
  
  const [paymentData, setPaymentData] = useState({
    loanId: '',
    date: new Date().toISOString().split('T')[0],
    principal: '',
    interest: '',
    totalAmount: ''
  });
  
  const [availableLoans, setAvailableLoans] = useState<FinancialData['loans']>([]);

  useEffect(() => {
    const data = loadFinancialData();
    if (data?.loans) {
      setAvailableLoans(data.loans);
    }
  }, []);

  const handleNumberInput = (field: string, value: string) => {
    // Allow empty string, numbers, and decimal separators
    if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
      setPaymentData(prev => ({ ...prev, [field]: value }));
      
      // Auto-calculate total amount
      if (field !== 'totalAmount') {
        const principal = parseFloat(field === 'principal' ? value : paymentData.principal) || 0;
        const interest = parseFloat(field === 'interest' ? value : paymentData.interest) || 0;
        const total = principal + interest;
        
        setPaymentData(prev => ({ ...prev, totalAmount: total > 0 ? total.toString() : '' }));
      }
    }
  };

  const handleSubmit = () => {
    const principalAmount = parseFloat(paymentData.principal) || 0;
    const interestAmount = parseFloat(paymentData.interest) || 0;
    const totalAmount = principalAmount + interestAmount;

    if (!paymentData.loanId || totalAmount <= 0) {
      toast({
        title: t('error'),
        description: t('select_loan_enter_amounts'),
        variant: "destructive",
      });
      return;
    }

    // Load financial data
    const data = loadFinancialData();
    if (!data) return;

    // Find the loan
    const loanIndex = data.loans.findIndex(loan => loan.id === parseInt(paymentData.loanId));
    if (loanIndex === -1) {
      toast({
        title: t('error'),
        description: t('loan_not_found'),
        variant: "destructive",
      });
      return;
    }

    // Add the transaction
    const loan = data.loans[loanIndex];
    const transaction = {
      name: `${loan.name} - ${t('loan_credit_payment')}`,
      date: paymentData.date,
      amount: totalAmount,
      category: "Lainan lyhennys",
      description: `${t('loan_credit_payment')}: ${principalAmount}€ ${t('principal_euro').replace(' (€)', '')} + ${interestAmount}€ ${t('interest_euro').replace(' (€)', '')}`,
      type: "expense" as const,
      paymentMethod: "Bank Transfer",
      loanId: parseInt(paymentData.loanId),
      principalAmount,
      interestAmount
    };

    try {
      addTransaction(transaction);
      
      // Update loan balance - reduce both current amount and total interest
      const loan = data.loans[loanIndex];
      loan.currentAmount = Math.max(0, loan.currentAmount - principalAmount);
      
      // If loan has interest tracking, reduce it
      if (loan.totalInterest && interestAmount > 0) {
        loan.totalInterest = Math.max(0, loan.totalInterest - interestAmount);
      }
      
      saveFinancialData(data);
      
      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('financial-data-updated'));
      
      toast({
        title: t('payment_processed'),
        description: `${t('loan_credit_payment')}: ${principalAmount}€ ${t('principal_euro').replace(' (€)', '')} + ${interestAmount}€ ${t('interest_euro').replace(' (€)', '')}`,
      });
      
      navigate('/loans-credits');
    } catch (error) {
      toast({
        title: t('error'),
        description: t('payment_recording_failed'),
        variant: "destructive",
      });
    }
  };

  const selectedLoan = availableLoans.find(l => l.id === parseInt(paymentData.loanId));

  return (
    <div className="p-4 pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">{t('quick_payment_entry')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator size={20} />
            <span>{t('loan_credit_payment')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loan Selection */}
          <div>
            <Label htmlFor="loan-select">{t('select_loan_credit')}</Label>
            <Select value={paymentData.loanId} onValueChange={(value) => setPaymentData(prev => ({ ...prev, loanId: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('select_loan_credit')} />
              </SelectTrigger>
              <SelectContent>
                {availableLoans.map(loan => (
                  <SelectItem key={loan.id} value={loan.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <CreditCard size={16} />
                      <span>{loan.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({loan.currentAmount.toFixed(2)} €)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Date */}
          <div>
            <Label htmlFor="payment-date">{t('payment_date')}</Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentData.date}
              onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-2"
            />
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-4">
            <div className="text-sm font-medium border-b pb-2">{t('payment_breakdown')}</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="principal">{t('principal_euro')}</Label>
                <Input
                  id="principal"
                  type="text"
                  value={paymentData.principal}
                  onChange={(e) => handleNumberInput('principal', e.target.value)}
                  className="mt-2"
                  placeholder="700.00"
                />
              </div>
              
              <div>
                <Label htmlFor="interest">{t('interest_euro')}</Label>
                <Input
                  id="interest"
                  type="text"
                  value={paymentData.interest}
                  onChange={(e) => handleNumberInput('interest', e.target.value)}
                  className="mt-2"
                  placeholder="300.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="total">{t('total_euro')}</Label>
              <Input
                id="total"
                type="text"
                value={paymentData.totalAmount}
                onChange={(e) => handleNumberInput('totalAmount', e.target.value)}
                className="mt-2 font-medium"
                placeholder="1000.00"
                readOnly
              />
            </div>
          </div>

          {/* Selected Loan Info */}
          {selectedLoan && (
            <div className="bg-muted/20 p-3 rounded-lg border">
              <div className="text-sm font-medium mb-2">{t('selected_loan')}</div>
              <div className="text-xs space-y-1">
                <div>{t('current_balance')}: {selectedLoan.currentAmount.toFixed(2)} €</div>
                <div>{t('monthly_payment_euro')}: {selectedLoan.monthly.toFixed(2)} €</div>
                {selectedLoan.managementFee && (
                  <div>{t('management_fee')}: {selectedLoan.managementFee.toFixed(2)} €</div>
                )}
                {selectedLoan.totalInterest && (
                  <div>{t('remaining_interest')}: {selectedLoan.totalInterest.toFixed(2)} €</div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="w-full">
            <DollarSign size={16} className="mr-2" />
            {t('record_payment')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickPaymentEntry;
