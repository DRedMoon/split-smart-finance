
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CreditCard, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { addLoan, loadFinancialData } from '@/services/storageService';

const LoansCredits = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('list');
  const [loanType, setLoanType] = useState('loan');
  
  // Loan data
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

  // Credit card data
  const [creditCardData, setCreditCardData] = useState({
    name: '',
    creditLimit: 0,
    usedCredit: 0,
    interest: 0,
    managementFee: 0,
    dueDate: ''
  });

  // Credit purchase data
  const [creditPurchaseData, setCreditPurchaseData] = useState({
    name: '',
    totalCredit: 0,
    creditsUsed: 0,
    minimumPaymentPercent: 0,
    selfPayment: 0,
    usePercentage: true,
    interest: 0,
    managementFee: 0
  });

  const data = loadFinancialData();
  const loans = data?.loans || [];

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

  const handleAddCreditCard = () => {
    if (!creditCardData.name || creditCardData.creditLimit === 0) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    const creditToAdd = {
      name: creditCardData.name,
      totalAmount: creditCardData.creditLimit,
      currentAmount: creditCardData.creditLimit - creditCardData.usedCredit,
      monthly: 0,
      rate: creditCardData.interest,
      managementFee: creditCardData.managementFee,
      remaining: 'Credit Card',
      dueDate: creditCardData.dueDate,
      lastPayment: new Date().toISOString().split('T')[0]
    };

    addLoan(creditToAdd);
    
    toast({
      title: t('credit_card_added'),
      description: `${creditCardData.name}: €${creditCardData.creditLimit.toFixed(2)}`
    });

    setCreditCardData({
      name: '',
      creditLimit: 0,
      usedCredit: 0,
      interest: 0,
      managementFee: 0,
      dueDate: ''
    });
  };

  const tabs = [
    { id: 'list', label: t('loans_credits_list') },
    { id: 'add', label: t('add_new') }
  ];

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('loans_credits')}</h1>
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

      {/* Loans & Credits List */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {loans.map((loan) => (
            <Card key={loan.id} className="bg-[#294D73] border-none">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-semibold">{loan.name}</h3>
                    <p className="text-white/70 text-sm">
                      {t('current_amount')}: €{loan.currentAmount.toFixed(2)} / €{loan.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-white/70 text-sm">
                      {t('monthly_payment')}: €{loan.monthly.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-sm">{t('due_date')}: {loan.dueDate}</p>
                    <p className="text-white/70 text-sm">{t('remaining')}: {loan.remaining}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {loans.length === 0 && (
            <Card className="bg-[#294D73] border-none">
              <CardContent className="p-8 text-center">
                <p className="text-white/70">{t('no_loans_credits')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add New */}
      {activeTab === 'add' && (
        <div className="space-y-6">
          {/* Type Selection */}
          <div className="flex space-x-1 bg-[#294D73] p-1 rounded-lg">
            <button
              onClick={() => setLoanType('loan')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                loanType === 'loan' 
                  ? 'bg-[#192E45] text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Banknote size={16} />
              <span>{t('loan')}</span>
            </button>
            <button
              onClick={() => setLoanType('credit_card')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                loanType === 'credit_card' 
                  ? 'bg-[#192E45] text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <CreditCard size={16} />
              <span>{t('credit_card')}</span>
            </button>
          </div>

          {/* Loan Form */}
          {loanType === 'loan' && (
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
          )}

          {/* Credit Card Form */}
          {loanType === 'credit_card' && (
            <Card className="bg-[#294D73] border-none">
              <CardHeader>
                <CardTitle className="text-white">{t('add_credit_card')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="credit-name" className="text-white">{t('credit_card_name')}</Label>
                  <Input
                    id="credit-name"
                    value={creditCardData.name}
                    onChange={(e) => setCreditCardData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder={t('credit_card_name')}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="credit-limit" className="text-white">{t('credit_limit')}</Label>
                    <Input
                      id="credit-limit"
                      type="number"
                      value={creditCardData.creditLimit || ''}
                      onChange={(e) => setCreditCardData(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))}
                      className="bg-white/10 border-white/20 text-white mt-2"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="used-credit" className="text-white">{t('used_credit')}</Label>
                    <Input
                      id="used-credit"
                      type="number"
                      value={creditCardData.usedCredit || ''}
                      onChange={(e) => setCreditCardData(prev => ({ ...prev, usedCredit: parseFloat(e.target.value) || 0 }))}
                      className="bg-white/10 border-white/20 text-white mt-2"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                  
                  <div>
                    <Label htmlFor="credit-due-date" className="text-white">{t('due_date')}</Label>
                    <Input
                      id="credit-due-date"
                      value={creditCardData.dueDate}
                      onChange={(e) => setCreditCardData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white mt-2"
                      placeholder="15th"
                    />
                  </div>
                </div>
                
                <Button onClick={handleAddCreditCard} className="w-full bg-white text-[#294D73]">
                  <Plus size={16} className="mr-2" />
                  {t('add_credit_card')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default LoansCredits;
