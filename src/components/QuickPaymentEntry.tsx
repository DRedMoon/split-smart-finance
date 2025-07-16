import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, CreditCard, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, addTransaction, saveFinancialData } from '@/services/storageService';
import { FinancialData } from '@/services/types';

const QuickPaymentEntry = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [paymentData, setPaymentData] = useState({
    loanId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    principalAmount: '',
    interestAmount: '',
    managementFee: '',
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
        const principal = parseFloat(field === 'principalAmount' ? value : paymentData.principalAmount) || 0;
        const interest = parseFloat(field === 'interestAmount' ? value : paymentData.interestAmount) || 0;
        const management = parseFloat(field === 'managementFee' ? value : paymentData.managementFee) || 0;
        const total = principal + interest + management;
        
        setPaymentData(prev => ({ ...prev, totalAmount: total > 0 ? total.toString() : '' }));
      }
    }
  };

  const handleSubmit = () => {
    if (!paymentData.loanId || !paymentData.totalAmount) {
      toast({
        title: t('error'),
        description: t('please_fill_required_fields'),
        variant: 'destructive'
      });
      return;
    }

    const totalAmount = parseFloat(paymentData.totalAmount);
    if (totalAmount <= 0) {
      toast({
        title: t('error'),
        description: t('amount_must_be_positive'),
        variant: 'destructive'
      });
      return;
    }

    try {
      const data = loadFinancialData();
      const loan = data?.loans?.find(l => l.id === parseInt(paymentData.loanId));
      
      if (!loan) {
        toast({
          title: t('error'),
          description: t('loan_not_found'),
          variant: 'destructive'
        });
        return;
      }

      // Add transaction
      const transaction = {
        amount: totalAmount,
        type: 'expense' as const,
        name: `${loan.name} - ${t('loan_payment')}`,
        date: paymentData.paymentDate,
        category: 'Loan Payment'
      };

      addTransaction(transaction);

      // Update loan balance
      if (data && data.loans) {
        const loanIndex = data.loans.findIndex(l => l.id === parseInt(paymentData.loanId));
        if (loanIndex !== -1) {
          const principalPayment = parseFloat(paymentData.principalAmount) || 0;
          data.loans[loanIndex].currentAmount = Math.max(0, data.loans[loanIndex].currentAmount - principalPayment);
          saveFinancialData(data);
        }
      }

      toast({
        title: t('payment_recorded'),
        description: t('loan_payment_added_successfully')
      });

      navigate('/loans-credits');
    } catch (error) {
      console.error('Error adding loan payment:', error);
      toast({
        title: t('error'),
        description: t('failed_to_add_payment'),
        variant: 'destructive'
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
              value={paymentData.paymentDate}
              onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
              className="mt-2"
            />
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-4">
            <div className="text-sm font-medium border-b pb-2">{t('payment_breakdown')}</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="principal">{t('principal_amount')} (€)</Label>
                <Input
                  id="principal"
                  type="text"
                  value={paymentData.principalAmount}
                  onChange={(e) => handleNumberInput('principalAmount', e.target.value)}
                  className="mt-2"
                  placeholder="400.00"
                />
              </div>
              
              <div>
                <Label htmlFor="interest">{t('interest_amount')} (€)</Label>
                <Input
                  id="interest"
                  type="text"
                  value={paymentData.interestAmount}
                  onChange={(e) => handleNumberInput('interestAmount', e.target.value)}
                  className="mt-2"
                  placeholder="50.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="management">{t('management_fee')} (€)</Label>
                <Input
                  id="management"
                  type="text"
                  value={paymentData.managementFee}
                  onChange={(e) => handleNumberInput('managementFee', e.target.value)}
                  className="mt-2"
                  placeholder="2.50"
                />
              </div>
              
              <div>
                <Label htmlFor="total">{t('total_amount')} (€)</Label>
                <Input
                  id="total"
                  type="text"
                  value={paymentData.totalAmount}
                  onChange={(e) => handleNumberInput('totalAmount', e.target.value)}
                  className="mt-2 font-medium"
                  placeholder="452.50"
                />
              </div>
            </div>
          </div>

          {/* Selected Loan Info */}
          {selectedLoan && (
            <div className="bg-muted/20 p-3 rounded-lg border">
              <div className="text-sm font-medium mb-2">{t('selected_loan_info')}</div>
              <div className="text-xs space-y-1">
                <div>{t('current_balance')}: {selectedLoan.currentAmount.toFixed(2)} €</div>
                <div>{t('monthly_payment')}: {selectedLoan.monthly.toFixed(2)} €</div>
                {selectedLoan.managementFee && (
                  <div>{t('management_fee')}: {selectedLoan.managementFee.toFixed(2)} €</div>
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