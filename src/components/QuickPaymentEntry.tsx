import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';
import { addTransaction } from '@/services/transactionService';

const QuickPaymentEntry = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [paymentData, setPaymentData] = useState({
    loanId: '',
    principalAmount: '',
    interestAmount: '',
    managementFee: '',
    totalAmount: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [availableLoans, setAvailableLoans] = useState<any[]>([]);

  React.useEffect(() => {
    const data = loadFinancialData();
    if (data?.loans) {
      setAvailableLoans(data.loans);
    }
  }, []);

  const handleNumberInput = (field: string, value: string) => {
    if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
      setPaymentData(prev => ({ ...prev, [field]: value }));
      
      // Auto-calculate total if all breakdown fields are filled
      if (field !== 'totalAmount') {
        const principal = parseFloat(field === 'principalAmount' ? value : paymentData.principalAmount) || 0;
        const interest = parseFloat(field === 'interestAmount' ? value : paymentData.interestAmount) || 0;
        const fee = parseFloat(field === 'managementFee' ? value : paymentData.managementFee) || 0;
        const total = principal + interest + fee;
        
        if (total > 0) {
          setPaymentData(prev => ({ ...prev, totalAmount: total.toString() }));
        }
      }
    }
  };

  const handleSubmit = () => {
    if (!paymentData.loanId || !paymentData.totalAmount) {
      toast({
        title: t('validation_error'),
        description: t('please_fill_required_fields'),
        variant: 'destructive'
      });
      return;
    }

    const selectedLoan = availableLoans.find(loan => loan.id.toString() === paymentData.loanId);
    if (!selectedLoan) {
      toast({
        title: t('error'),
        description: t('loan_not_found'),
        variant: 'destructive'
      });
      return;
    }

    // Add transaction with payment breakdown
    const transactionData = {
      name: `${selectedLoan.name} - ${t('payment')}`,
      amount: -parseFloat(paymentData.totalAmount),
      type: 'expense',
      category: 'loan_payment',
      date: paymentData.paymentDate,
      paymentBreakdown: {
        principal: parseFloat(paymentData.principalAmount) || 0,
        interest: parseFloat(paymentData.interestAmount) || 0,
        managementFee: parseFloat(paymentData.managementFee) || 0
      }
    };

    addTransaction(transactionData);

    // Update loan balance
    const data = loadFinancialData();
    if (data) {
      const loanIndex = data.loans.findIndex(loan => loan.id.toString() === paymentData.loanId);
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
  };

  return (
    <div className="p-4 pb-20 bg-background min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{t('quick_payment_entry')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator size={20} className="mr-2" />
            {t('loan_credit_payment')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="loan-select">{t('select_loan_credit')}</Label>
            <Select value={paymentData.loanId} onValueChange={(value) => setPaymentData(prev => ({ ...prev, loanId: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('select_loan_credit')} />
              </SelectTrigger>
              <SelectContent>
                {availableLoans.map(loan => (
                  <SelectItem key={loan.id} value={loan.id.toString()}>
                    {loan.name} - €{loan.currentAmount.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="bg-muted/20 p-4 rounded-lg border">
            <h3 className="font-medium mb-3">{t('payment_breakdown')}</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="principal-amount" className="text-sm">
                  {t('principal_amount')} ({t('lyhennys')})
                </Label>
                <Input
                  id="principal-amount"
                  type="text"
                  value={paymentData.principalAmount}
                  onChange={(e) => handleNumberInput('principalAmount', e.target.value)}
                  className="mt-1"
                  placeholder="500.00"
                />
              </div>
              
              <div>
                <Label htmlFor="interest-amount" className="text-sm">
                  {t('interest_amount')} ({t('korko')})
                </Label>
                <Input
                  id="interest-amount"
                  type="text"
                  value={paymentData.interestAmount}
                  onChange={(e) => handleNumberInput('interestAmount', e.target.value)}
                  className="mt-1"
                  placeholder="455.50"
                />
              </div>
              
              <div>
                <Label htmlFor="management-fee" className="text-sm">
                  {t('management_fee')} ({t('tilinhoitopalkkio')})
                </Label>
                <Input
                  id="management-fee"
                  type="text"
                  value={paymentData.managementFee}
                  onChange={(e) => handleNumberInput('managementFee', e.target.value)}
                  className="mt-1"
                  placeholder="2.50"
                />
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-info/10 rounded text-xs text-muted-foreground">
              {t('breakdown_amounts_change_monthly')}
            </div>
          </div>

          <div>
            <Label htmlFor="total-amount" className="font-medium">{t('total_payment_amount')}</Label>
            <Input
              id="total-amount"
              type="text"
              value={paymentData.totalAmount}
              onChange={(e) => handleNumberInput('totalAmount', e.target.value)}
              className="mt-2 font-medium"
              placeholder="958.00"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Plus size={16} className="mr-2" />
            {t('record_payment')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickPaymentEntry;