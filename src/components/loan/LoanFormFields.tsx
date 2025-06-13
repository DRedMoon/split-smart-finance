
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoanFormFieldsProps {
  loanData: any;
  setLoanData: (fn: (prev: any) => any) => void;
  calculatedValues: any;
  isCredit: boolean;
}

const LoanFormFields = ({ loanData, setLoanData, calculatedValues, isCredit }: LoanFormFieldsProps) => {
  const { t } = useLanguage();

  return (
    <>
      <div>
        <Label htmlFor="name" className="text-white">
          {isCredit ? t('credit_card_name') : t('loan_name')}
        </Label>
        <Input
          id="name"
          value={loanData.name}
          onChange={(e) => setLoanData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
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
            className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
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
            className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
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
              className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
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
                className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
                placeholder={calculatedValues.estimatedEuribor > 0 ? calculatedValues.estimatedEuribor.toFixed(2) : "3.50"}
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
                className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
                placeholder={calculatedValues.estimatedMargin > 0 ? calculatedValues.estimatedMargin.toFixed(2) : "2.00"}
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
              className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
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
              className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
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
            className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="due-date" className="text-white">{t('due_date')}</Label>
          <Input
            id="due-date"
            value={loanData.dueDate}
            onChange={(e) => setLoanData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
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
          className="bg-white/10 border-white/20 text-white placeholder-white/50 mt-2"
          placeholder={calculatedValues.monthlyPayment > 0 ? calculatedValues.monthlyPayment.toFixed(2) : "0.00"}
        />
      </div>
    </>
  );
};

export default LoanFormFields;
