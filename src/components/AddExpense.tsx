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
import { addTransaction, addLoan, addMonthlyBill, addLoanRepaymentTransaction, addCreditPaymentTransaction, calculateLoanFromPaymentDetails } from '@/services/storageService';

const AddExpense = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('quick');
  const [expense, setExpense] = useState({
    name: '',
    amount: 0,
    category: '',
    type: 'expense' as const
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

  // Loan repayment states
  const [repaymentData, setRepaymentData] = useState({
    loanName: '',
    loanRepayment: 0,
    interest: 0,
    managementFee: 0
  });

  // Credit payment states
  const [creditData, setCreditData] = useState({
    creditName: '',
    paymentAmount: 0,
    creditLimit: 0
  });

  // Calculation results
  const [calculationResults, setCalculationResults] = useState(null);

  const quickAddOptions = [
    { label: t('grocery'), category: 'grocery', amount: 50 },
    { label: t('transport'), category: 'transport', amount: 25 },
    { label: t('entertainment'), category: 'entertainment', amount: 30 },
    { label: t('loan_payment'), category: 'loan_payment', amount: 500 },
    { label: t('credit_payment'), category: 'credit_payment', amount: 100 },
    { label: t('bills'), category: 'bills', amount: 100 },
    { label: t('other'), category: 'other', amount: 0 }
  ];

  const handleQuickAdd = (option: typeof quickAddOptions[0]) => {
    if (option.category === 'loan_payment') {
      setActiveTab('loan-repayment');
      return;
    }
    if (option.category === 'credit_payment') {
      setActiveTab('credit-payment');
      return;
    }

    const transaction = {
      name: option.label,
      amount: -Math.abs(option.amount || 0),
      date: new Date().toISOString().split('T')[0],
      type: 'expense' as const,
      category: option.category
    };

    addTransaction(transaction);
    toast({
      title: t('expense_added'),
      description: `${option.label}: -€${Math.abs(option.amount || 0).toFixed(2)}`
    });
  };

  const handleAddExpense = () => {
    if (!expense.name || expense.amount === 0) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    const transaction = {
      name: expense.name,
      amount: expense.type === 'income' ? Math.abs(expense.amount) : -Math.abs(expense.amount),
      date: new Date().toISOString().split('T')[0],
      type: expense.type,
      category: expense.category || 'other'
    };

    addTransaction(transaction);
    
    toast({
      title: expense.type === 'income' ? t('income_added') : t('expense_added'),
      description: `${expense.name}: ${expense.type === 'income' ? '+' : '-'}€${Math.abs(expense.amount).toFixed(2)}`
    });

    setExpense({ name: '', amount: 0, category: '', type: 'expense' });
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

  const handleCalculateFromPayment = () => {
    if (repaymentData.loanRepayment === 0 || repaymentData.interest === 0) {
      toast({
        title: t('error'),
        description: 'Anna lainan lyhennys ja korko',
        variant: "destructive"
      });
      return;
    }

    // Estimate remaining loan amount based on interest
    const estimatedLoanAmount = (repaymentData.interest * 12) / (loanData.rate / 100);
    
    const results = calculateLoanFromPaymentDetails(
      repaymentData.loanRepayment,
      repaymentData.interest,
      repaymentData.managementFee,
      estimatedLoanAmount
    );

    setCalculationResults(results);
  };

  const handleAddLoanRepayment = () => {
    if (!repaymentData.loanName || repaymentData.loanRepayment === 0) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    // For now, we'll add this as a transaction since we need loan ID to properly reduce loan amount
    const transaction = {
      name: `${repaymentData.loanName} - Lainan maksu`,
      amount: -(repaymentData.loanRepayment + repaymentData.interest + repaymentData.managementFee),
      date: new Date().toISOString().split('T')[0],
      type: 'expense' as const,
      category: 'loan_payment'
    };

    addTransaction(transaction);
    
    toast({
      title: 'Lainanmaksu lisätty',
      description: `${repaymentData.loanName}: -€${(repaymentData.loanRepayment + repaymentData.interest + repaymentData.managementFee).toFixed(2)}`
    });

    setRepaymentData({
      loanName: '',
      loanRepayment: 0,
      interest: 0,
      managementFee: 0
    });
  };

  const handleAddCreditPayment = () => {
    if (!creditData.creditName || creditData.paymentAmount === 0) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    addCreditPaymentTransaction(
      creditData.creditName,
      creditData.paymentAmount,
      creditData.creditLimit
    );
    
    toast({
      title: 'Luottokorttimaksu lisätty',
      description: `${creditData.creditName}: -€${creditData.paymentAmount.toFixed(2)}`
    });

    setCreditData({
      creditName: '',
      paymentAmount: 0,
      creditLimit: 0
    });
  };

  const tabs = [
    { id: 'quick', label: t('quick_add') },
    { id: 'manual', label: t('manual_entry') },
    { id: 'loan', label: t('add_loan') },
    { id: 'loan-repayment', label: 'Lainanmaksu' },
    { id: 'credit-payment', label: 'Luottokorttimaksu' }
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

      {/* Quick Add */}
      {activeTab === 'quick' && (
        <div className="grid grid-cols-2 gap-3">
          {quickAddOptions.map((option, index) => (
            <Card key={index} className="bg-[#294D73] border-none cursor-pointer hover:bg-[#3A5A7A] transition-colors">
              <CardContent 
                className="p-4 text-center"
                onClick={() => handleQuickAdd(option)}
              >
                <div className="text-white font-medium mb-1">{option.label}</div>
                {option.amount > 0 && (
                  <div className="text-white/70 text-sm">€{option.amount}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manual Entry */}
      {activeTab === 'manual' && (
        <Card className="bg-[#294D73] border-none">
          <CardHeader>
            <CardTitle className="text-white">{t('manual_entry')}</CardTitle>
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
              <Label htmlFor="amount" className="text-white">{t('amount')}</Label>
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
                  <SelectItem value="grocery">{t('grocery')}</SelectItem>
                  <SelectItem value="transport">{t('transport')}</SelectItem>
                  <SelectItem value="entertainment">{t('entertainment')}</SelectItem>
                  <SelectItem value="bills">{t('bills')}</SelectItem>
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
            
            <Button onClick={handleAddExpense} className="w-full bg-white text-[#294D73]">
              <Plus size={16} className="mr-2" />
              {expense.type === 'income' ? t('add_income') : t('add_expense')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Loan */}
      {activeTab === 'loan' && (
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
            
            <Button onClick={handleAddLoan} className="w-full bg-white text-[#294D73]">
              <Plus size={16} className="mr-2" />
              {t('add_loan')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loan Repayment */}
      {activeTab === 'loan-repayment' && (
        <Card className="bg-[#294D73] border-none">
          <CardHeader>
            <CardTitle className="text-white">Lainanmaksu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="loan-name-repay" className="text-white">Lainan nimi</Label>
              <Input
                id="loan-name-repay"
                value={repaymentData.loanName}
                onChange={(e) => setRepaymentData(prev => ({ ...prev, loanName: e.target.value }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="Lainan nimi"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="loan-repayment" className="text-white">Lyhennys</Label>
                <Input
                  id="loan-repayment"
                  type="number"
                  value={repaymentData.loanRepayment || ''}
                  onChange={(e) => setRepaymentData(prev => ({ ...prev, loanRepayment: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="interest" className="text-white">Korko</Label>
                <Input
                  id="interest"
                  type="number"
                  value={repaymentData.interest || ''}
                  onChange={(e) => setRepaymentData(prev => ({ ...prev, interest: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="mgmt-fee" className="text-white">Hallintamaksu</Label>
                <Input
                  id="mgmt-fee"
                  type="number"
                  value={repaymentData.managementFee || ''}
                  onChange={(e) => setRepaymentData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleCalculateFromPayment} variant="outline" className="flex-1">
                <Calculator size={16} className="mr-2" />
                Laske
              </Button>
              <Button onClick={handleAddLoanRepayment} className="flex-1 bg-white text-[#294D73]">
                <Plus size={16} className="mr-2" />
                Lisää maksu
              </Button>
            </div>
            
            {calculationResults && (
              <div className="bg-white/10 p-4 rounded-lg text-white">
                <h4 className="font-medium mb-2">Laskentatulokset:</h4>
                <p>Kuukausimaksu yhteensä: €{calculationResults.monthlyTotal}</p>
                <p>Arvioitu korkoprosentti: {calculationResults.interestRate}%</p>
                <p>Arvioitu kuukausia jäljellä: {calculationResults.estimatedMonthsLeft}</p>
                <p>Arvioitu kokonaismaksu: €{calculationResults.totalPaybackEstimate}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Credit Payment */}
      {activeTab === 'credit-payment' && (
        <Card className="bg-[#294D73] border-none">
          <CardHeader>
            <CardTitle className="text-white">Luottokorttimaksu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="credit-name" className="text-white">Luottokortin nimi</Label>
              <Input
                id="credit-name"
                value={creditData.creditName}
                onChange={(e) => setCreditData(prev => ({ ...prev, creditName: e.target.value }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="Esim. Nordea Visa"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment-amount" className="text-white">Maksun määrä</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={creditData.paymentAmount || ''}
                  onChange={(e) => setCreditData(prev => ({ ...prev, paymentAmount: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="credit-limit" className="text-white">Luottoraja</Label>
                <Input
                  id="credit-limit"
                  type="number"
                  value={creditData.creditLimit || ''}
                  onChange={(e) => setCreditData(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white mt-2"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <Button onClick={handleAddCreditPayment} className="w-full bg-white text-[#294D73]">
              <Plus size={16} className="mr-2" />
              Lisää luottokorttimaksu
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddExpense;
