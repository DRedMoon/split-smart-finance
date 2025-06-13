import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { addTransaction, addLoan } from '@/services/storageService';

const AddExpense = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('quick');
  const [expense, setExpense] = useState({
    name: '',
    amount: 0,
    category: '',
    type: 'expense' as 'income' | 'expense'
  });

  // Category-specific data
  const [loanBillData, setLoanBillData] = useState({
    loanName: '',
    abbreviation: 0,
    interest: 0,
    managementFee: 0
  });

  const [creditCardData, setCreditCardData] = useState({
    loanName: '',
    abbreviation: 0,
    interest: 0,
    managementFee: 0
  });

  const [creditPurchaseData, setCreditPurchaseData] = useState({
    totalCredit: 0,
    creditsUsed: 0,
    minimumPaymentPercent: 0,
    selfPayment: 0,
    usePercentage: true,
    interest: 0,
    managementFee: 0
  });

  const [recurringPayment, setRecurringPayment] = useState({
    isMonthly: false
  });

  // Loan states
  const [loanData, setLoanData] = useState({
    name: '',
    totalAmount: 0,
    currentAmount: 0,
    monthly: 0,
    rate: 0,
    euriborRate: 0,
    personalMargin: 0,
    managementFee: 0,
    remaining: '',
    dueDate: ''
  });

  const handleAddExpense = () => {
    if (!expense.name || expense.amount === 0) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    let totalAmount = expense.amount;
    let transactionName = expense.name;
    
    // Handle category-specific calculations
    if (expense.category === 'loan_bill_payment') {
      totalAmount = loanBillData.abbreviation + loanBillData.interest + loanBillData.managementFee;
      transactionName = `${loanBillData.loanName} - ${t('loan_bill_payment')}`;
    } else if (expense.category === 'credit_card_payment') {
      totalAmount = creditCardData.abbreviation + creditCardData.interest + creditCardData.managementFee;
      transactionName = `${creditCardData.loanName} - ${t('credit_card_payment')}`;
    } else if (expense.category === 'credit_purchase') {
      totalAmount = creditPurchaseData.usePercentage 
        ? (creditPurchaseData.creditsUsed * creditPurchaseData.minimumPaymentPercent / 100) + creditPurchaseData.interest + creditPurchaseData.managementFee
        : creditPurchaseData.selfPayment + creditPurchaseData.interest + creditPurchaseData.managementFee;
      transactionName = `${t('credit_purchase')} - ${expense.name}`;
    }

    const transaction = {
      name: transactionName,
      amount: expense.type === 'income' ? Math.abs(totalAmount) : -Math.abs(totalAmount),
      date: new Date().toISOString().split('T')[0],
      type: expense.type,
      category: expense.category || 'other',
      isRecurring: recurringPayment.isMonthly
    };

    addTransaction(transaction);
    
    toast({
      title: expense.type === 'income' ? t('income_added') : t('expense_added'),
      description: `${transactionName}: ${expense.type === 'income' ? '+' : '-'}€${Math.abs(totalAmount).toFixed(2)}`
    });

    // Reset form
    setExpense({ name: '', amount: 0, category: '', type: 'expense' });
    setLoanBillData({ loanName: '', abbreviation: 0, interest: 0, managementFee: 0 });
    setCreditCardData({ loanName: '', abbreviation: 0, interest: 0, managementFee: 0 });
    setCreditPurchaseData({ totalCredit: 0, creditsUsed: 0, minimumPaymentPercent: 0, selfPayment: 0, usePercentage: true, interest: 0, managementFee: 0 });
    setRecurringPayment({ isMonthly: false });
  };

  const handleAddLoan = () => {
    if (!loanData.name || loanData.totalAmount === 0) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    const loanToAdd = {
      name: loanData.name,
      totalAmount: loanData.totalAmount,
      currentAmount: loanData.currentAmount || loanData.totalAmount,
      monthly: loanData.monthly,
      rate: loanData.rate,
      euriborRate: loanData.euriborRate,
      personalMargin: loanData.personalMargin,
      managementFee: loanData.managementFee,
      remaining: loanData.remaining,
      dueDate: loanData.dueDate,
      lastPayment: new Date().toISOString().split('T')[0]
    };

    addLoan(loanToAdd);
    
    toast({
      title: t('loan_added'),
      description: `${loanData.name}: €${loanData.totalAmount.toFixed(2)}`
    });

    setLoanData({
      name: '',
      totalAmount: 0,
      currentAmount: 0,
      monthly: 0,
      rate: 0,
      euriborRate: 0,
      personalMargin: 0,
      managementFee: 0,
      remaining: '',
      dueDate: ''
    });
  };

  const renderCategorySpecificFields = () => {
    switch (expense.category) {
      case 'loan_bill_payment':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="loan-name" className="text-white">{t('loan_name')}</Label>
              <Input
                id="loan-name"
                value={loanBillData.loanName}
                onChange={(e) => setLoanBillData(prev => ({ ...prev, loanName: e.target.value }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder={t('loan_name')}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="abbreviation" className="text-white">{t('abbreviation')}</Label>
                <Input
                  id="abbreviation"
                  type="number"
                  value={loanBillData.abbreviation || ''}
                  onChange={(e) => setLoanBillData(prev => ({ ...prev, abbreviation: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="interest" className="text-white">{t('interest')}</Label>
                <Input
                  id="interest"
                  type="number"
                  value={loanBillData.interest || ''}
                  onChange={(e) => setLoanBillData(prev => ({ ...prev, interest: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="mgmt-fee" className="text-white">{t('management_fee')}</Label>
                <Input
                  id="mgmt-fee"
                  type="number"
                  value={loanBillData.managementFee || ''}
                  onChange={(e) => setLoanBillData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        );

      case 'credit_card_payment':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="credit-name" className="text-white">{t('loan_name')}</Label>
              <Input
                id="credit-name"
                value={creditCardData.loanName}
                onChange={(e) => setCreditCardData(prev => ({ ...prev, loanName: e.target.value }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder={t('loan_name')}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="credit-abbreviation" className="text-white">{t('abbreviation')}</Label>
                <Input
                  id="credit-abbreviation"
                  type="number"
                  value={creditCardData.abbreviation || ''}
                  onChange={(e) => setCreditCardData(prev => ({ ...prev, abbreviation: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="credit-interest" className="text-white">{t('interest')}</Label>
                <Input
                  id="credit-interest"
                  type="number"
                  value={creditCardData.interest || ''}
                  onChange={(e) => setCreditCardData(prev => ({ ...prev, interest: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="credit-mgmt-fee" className="text-white">{t('management_fee')}</Label>
                <Input
                  id="credit-mgmt-fee"
                  type="number"
                  value={creditCardData.managementFee || ''}
                  onChange={(e) => setCreditCardData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        );

      case 'credit_purchase':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total-credit" className="text-white">{t('total_credit')}</Label>
                <Input
                  id="total-credit"
                  type="number"
                  value={creditPurchaseData.totalCredit || ''}
                  onChange={(e) => setCreditPurchaseData(prev => ({ ...prev, totalCredit: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="credits-used" className="text-white">{t('credits_used')}</Label>
                <Input
                  id="credits-used"
                  type="number"
                  value={creditPurchaseData.creditsUsed || ''}
                  onChange={(e) => setCreditPurchaseData(prev => ({ ...prev, creditsUsed: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="use-percentage"
                checked={creditPurchaseData.usePercentage}
                onCheckedChange={(checked) => setCreditPurchaseData(prev => ({ ...prev, usePercentage: !!checked }))}
              />
              <Label htmlFor="use-percentage" className="text-white">{t('minimum_payment_percent')}</Label>
            </div>
            
            {creditPurchaseData.usePercentage ? (
              <div>
                <Label htmlFor="min-payment-percent" className="text-white">{t('minimum_payment_percent')}</Label>
                <Input
                  id="min-payment-percent"
                  type="number"
                  value={creditPurchaseData.minimumPaymentPercent || ''}
                  onChange={(e) => setCreditPurchaseData(prev => ({ ...prev, minimumPaymentPercent: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="%"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="self-payment" className="text-white">{t('self_payment')}</Label>
                <Input
                  id="self-payment"
                  type="number"
                  value={creditPurchaseData.selfPayment || ''}
                  onChange={(e) => setCreditPurchaseData(prev => ({ ...prev, selfPayment: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credit-purchase-interest" className="text-white">{t('interest')}</Label>
                <Input
                  id="credit-purchase-interest"
                  type="number"
                  value={creditPurchaseData.interest || ''}
                  onChange={(e) => setCreditPurchaseData(prev => ({ ...prev, interest: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="credit-purchase-mgmt" className="text-white">{t('management_fee')}</Label>
                <Input
                  id="credit-purchase-mgmt"
                  type="number"
                  value={creditPurchaseData.managementFee || ''}
                  onChange={(e) => setCreditPurchaseData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const showRecurringCheckbox = ['insurance', 'subscription'].includes(expense.category);

  const tabs = [
    { id: 'quick', label: t('quick_add') },
    { id: 'loan', label: t('add_loan') }
  ];

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('add_expense')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-[#294D73] p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-[#192E45] text-white' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Add Form */}
      {activeTab === 'quick' && (
        <Card className="bg-[#294D73] border-none">
          <CardHeader>
            <CardTitle className="text-white">{t('quick_add')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">{t('name')}</Label>
              <Input
                id="name"
                value={expense.name}
                onChange={(e) => setExpense(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder={t('expense_name')}
              />
            </div>
            
            <div>
              <Label htmlFor="amount" className="text-white">{t('sum')}</Label>
              <Input
                id="amount"
                type="number"
                value={expense.amount || ''}
                onChange={(e) => setExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="category" className="text-white">{t('category')}</Label>
              <Select value={expense.category} onValueChange={(value) => setExpense(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                  <SelectValue placeholder={t('select_category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">{t('food')}</SelectItem>
                  <SelectItem value="transport">{t('transport')}</SelectItem>
                  <SelectItem value="entertainment">{t('entertainment')}</SelectItem>
                  <SelectItem value="bill">{t('bill')}</SelectItem>
                  <SelectItem value="insurance">{t('insurance')}</SelectItem>
                  <SelectItem value="subscription">{t('subscription')}</SelectItem>
                  <SelectItem value="loan_bill_payment">{t('loan_bill_payment')}</SelectItem>
                  <SelectItem value="credit_card_payment">{t('credit_card_payment')}</SelectItem>
                  <SelectItem value="credit_purchase">{t('credit_purchase')}</SelectItem>
                  <SelectItem value="paycheck">{t('paycheck')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type" className="text-white">{t('type')}</Label>
              <Select value={expense.type} onValueChange={(value: 'income' | 'expense') => setExpense(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">{t('expense')}</SelectItem>
                  <SelectItem value="income">{t('income')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category-specific fields */}
            {renderCategorySpecificFields()}

            {/* Monthly payment checkbox for Insurance and Subscription */}
            {showRecurringCheckbox && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="monthly-payment"
                  checked={recurringPayment.isMonthly}
                  onCheckedChange={(checked) => setRecurringPayment(prev => ({ ...prev, isMonthly: !!checked }))}
                />
                <Label htmlFor="monthly-payment" className="text-white">{t('monthly_payment_checkbox')}</Label>
              </div>
            )}
            
            <Button onClick={handleAddExpense} className="w-full bg-white text-[#294D73]">
              <Plus size={16} className="mr-2" />
              {expense.type === 'income' ? t('add_income') : t('add_expense')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Loan */}
      {activeTab === 'loan' && (
        <div className="space-y-4">
          {/* Add button to navigate to Loans & Credits page */}
          <Button 
            onClick={() => navigate('/loans-credits')} 
            className="w-full bg-[#FF6B6B] text-white hover:bg-[#FF5252] flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>{t('manage_loans_credits')}</span>
          </Button>
          
          <Card className="bg-[#294D73] border-none">
            <CardHeader>
              <CardTitle className="text-white">{t('add_loan')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="loan-name" className="text-white">{t('loan_name')}</Label>
                <Input
                  id="loan-name"
                  value={loanData.name}
                  onChange={(e) => setLoanData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder={t('loan_name')}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total-amount" className="text-white">{t('total_amount')}</Label>
                  <Input
                    id="total-amount"
                    type="number"
                    value={loanData.totalAmount || ''}
                    onChange={(e) => setLoanData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="current-amount" className="text-white">{t('current_amount')}</Label>
                  <Input
                    id="current-amount"
                    type="number"
                    value={loanData.currentAmount || ''}
                    onChange={(e) => setLoanData(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly-payment" className="text-white">{t('monthly_payment')}</Label>
                  <Input
                    id="monthly-payment"
                    type="number"
                    value={loanData.monthly || ''}
                    onChange={(e) => setLoanData(prev => ({ ...prev, monthly: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="interest-rate" className="text-white">{t('interest_rate')}</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    value={loanData.rate || ''}
                    onChange={(e) => setLoanData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="euribor-rate" className="text-white">{t('euribor_rate')}</Label>
                  <Input
                    id="euribor-rate"
                    type="number"
                    value={loanData.euriborRate || ''}
                    onChange={(e) => setLoanData(prev => ({ ...prev, euriborRate: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="personal-margin" className="text-white">{t('personal_margin')}</Label>
                  <Input
                    id="personal-margin"
                    type="number"
                    value={loanData.personalMargin || ''}
                    onChange={(e) => setLoanData(prev => ({ ...prev, personalMargin: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="management-fee" className="text-white">{t('management_fee')}</Label>
                  <Input
                    id="management-fee"
                    type="number"
                    value={loanData.managementFee || ''}
                    onChange={(e) => setLoanData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="due-date" className="text-white">{t('due_date')}</Label>
                  <Input
                    id="due-date"
                    value={loanData.dueDate}
                    onChange={(e) => setLoanData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder="15th"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="remaining-months" className="text-white">{t('remaining_months')}</Label>
                <Input
                  id="remaining-months"
                  value={loanData.remaining}
                  onChange={(e) => setLoanData(prev => ({ ...prev, remaining: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="24 months"
                />
              </div>
              
              <Button onClick={handleAddLoan} className="w-full bg-white text-[#294D73]">
                <Plus size={16} className="mr-2" />
                {t('add_loan')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddExpense;
