
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { addLoan } from '@/services/storageService';

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
    remaining: '',
    dueDate: ''
  });

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

    navigate('/loans-credits');
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/loans-credits')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('add_loan')}</h1>
      </div>

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
  );
};

export default AddLoan;
