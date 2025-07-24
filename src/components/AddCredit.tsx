import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useToast } from '@/hooks/use-toast';
import { addLoan, calculateCreditPayment } from '@/services/storageService';

const AddCredit = () => {
  const navigate = useNavigate();
  const { t } = useSafeLanguage();
  const { toast } = useToast();
  
  const [creditData, setCreditData] = useState({
    name: '',
    creditLimit: 0,
    usedCredit: 0,
    interest: 0,
    managementFee: 0,
    minimumPercent: 3,
    dueDate: ''
  });

  const [calculatedValues, setCalculatedValues] = useState({
    monthlyMinimum: 0,
    totalWithInterest: 0
  });

  // Auto-calculate when relevant fields change
  useEffect(() => {
    if (creditData.usedCredit > 0 && creditData.interest > 0 && creditData.minimumPercent > 0) {
      const calculation = calculateCreditPayment(
        creditData.usedCredit,
        creditData.interest,
        creditData.managementFee || 0,
        creditData.minimumPercent
      );
      setCalculatedValues(calculation);
    }
  }, [creditData.usedCredit, creditData.interest, creditData.managementFee, creditData.minimumPercent]);

  const handleAddCredit = () => {
    if (!creditData.name || creditData.creditLimit === 0) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    const creditToAdd = {
      name: creditData.name,
      totalAmount: creditData.creditLimit,
      currentAmount: creditData.usedCredit,
      monthly: calculatedValues.monthlyMinimum,
      rate: creditData.interest,
      managementFee: creditData.managementFee,
      minimumPercent: creditData.minimumPercent,
      remaining: 'Credit Card',
      dueDate: creditData.dueDate,
      lastPayment: new Date().toISOString().split('T')[0],
      totalPayback: calculatedValues.totalWithInterest,
      yearlyInterestRate: creditData.interest
    };

    addLoan(creditToAdd);
    
    toast({
      title: t('credit_card_added'),
      description: `${creditData.name}: €${creditData.creditLimit.toFixed(2)}`
    });

    navigate('/loans-credits');
  };

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-md mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/loans-credits')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('add_credit_card')}</h1>
      </div>

      {/* Calculation Info */}
      {calculatedValues.monthlyMinimum > 0 && (
        <Card className="mb-4 bg-blue-500/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calculator size={20} className="mr-2" />
              {t('calculated_values')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/70">{t('minimum_monthly_payment')}</p>
                <p className="text-white font-medium">€{calculatedValues.monthlyMinimum.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/70">{t('estimated_total_with_interest')}</p>
                <p className="text-white font-medium">€{calculatedValues.totalWithInterest.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('add_credit_card')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="credit-name" className="text-white">{t('credit_card_name')}</Label>
            <Input
              id="credit-name"
              value={creditData.name}
              onChange={(e) => setCreditData(prev => ({ ...prev, name: e.target.value }))}
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
                value={creditData.creditLimit || ''}
                onChange={(e) => setCreditData(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="used-credit" className="text-white">{t('used_credit')}</Label>
              <Input
                id="used-credit"
                type="number"
                value={creditData.usedCredit || ''}
                onChange={(e) => setCreditData(prev => ({ ...prev, usedCredit: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credit-interest" className="text-white">{t('yearly_interest')} (%)</Label>
              <Input
                id="credit-interest"
                type="number"
                step="0.01"
                value={creditData.interest || ''}
                onChange={(e) => setCreditData(prev => ({ ...prev, interest: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="15.50"
              />
            </div>
            
            <div>
              <Label htmlFor="minimum-percent" className="text-white">{t('minimum_payment_percent')} (%)</Label>
              <Input
                id="minimum-percent"
                type="number"
                step="0.1"
                value={creditData.minimumPercent || ''}
                onChange={(e) => setCreditData(prev => ({ ...prev, minimumPercent: parseFloat(e.target.value) || 3 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="3.0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credit-mgmt-fee" className="text-white">{t('management_fee')} (€)</Label>
              <Input
                id="credit-mgmt-fee"
                type="number"
                value={creditData.managementFee || ''}
                onChange={(e) => setCreditData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="credit-due-date" className="text-white">{t('due_date')}</Label>
              <Input
                id="credit-due-date"
                value={creditData.dueDate}
                onChange={(e) => setCreditData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="15th"
              />
            </div>
          </div>
          
          <Button onClick={handleAddCredit} className="w-full bg-white text-[#294D73]">
            <Plus size={16} className="mr-2" />
            {t('add_credit_card')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCredit;
