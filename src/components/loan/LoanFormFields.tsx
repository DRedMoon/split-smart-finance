
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoanFormFieldsProps {
  loanData: any;
  setLoanData: (data: any) => void;
  calculatedValues: any;
  isCredit: boolean;
}

const LoanFormFields = ({ loanData, setLoanData, calculatedValues, isCredit }: LoanFormFieldsProps) => {
  const { t } = useLanguage();

  return (
    <>
      <div>
        <Label htmlFor="loan-name" className="text-white">
          {isCredit ? t('credit_card_name') : t('loan_name')}
        </Label>
        <Input
          id="loan-name"
          value={loanData.name}
          onChange={(e) => setLoanData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-white/10 border-white/20 text-white mt-2"
          placeholder={isCredit ? t('credit_card_name') : t('loan_name')}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total-amount" className="text-white">
            {isCredit ? t('credit_limit') : t('total_loan_amount')}
          </Label>
          <Input
            id="total-amount"
            type="number"
            step="0.01"
            value={loanData.totalAmount || ''}
            onChange={(e) => setLoanData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
            className="bg-white/10 border-white/20 text-white mt-2"
            placeholder="15000.00"
          />
        </div>
        
        <div>
          <Label htmlFor="current-amount" className="text-white">
            {isCredit ? t('used_credit') : t('amount_left_to_pay')}
          </Label>
          <Input
            id="current-amount"
            type="number"
            step="0.01"
            value={loanData.currentAmount || ''}
            onChange={(e) => setLoanData(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) || 0 }))}
            className="bg-white/10 border-white/20 text-white mt-2"
            placeholder="12000.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthly-payment" className="text-white">{t('monthly_payment')} (€)</Label>
          <Input
            id="monthly-payment"
            type="number"
            step="0.01"
            value={loanData.monthly || ''}
            onChange={(e) => setLoanData(prev => ({ ...prev, monthly: parseFloat(e.target.value) || 0 }))}
            className="bg-white/10 border-white/20 text-white mt-2"
            placeholder="881.15"
          />
        </div>
        
        <div>
          <Label htmlFor="management-fee" className="text-white">{t('management_fee')} (€)</Label>
          <Input
            id="management-fee"
            type="number"
            step="0.01"
            value={loanData.managementFee || ''}
            onChange={(e) => setLoanData(prev => ({ ...prev, managementFee: parseFloat(e.target.value) || 0 }))}
            className="bg-white/10 border-white/20 text-white mt-2"
            placeholder="2.50"
          />
        </div>
      </div>

      {!isCredit && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="euribor-rate" className="text-white">Euribor Rate (%)</Label>
              <Input
                id="euribor-rate"
                type="number"
                step="0.01"
                value={loanData.euriborRate || ''}
                onChange={(e) => setLoanData(prev => ({ ...prev, euriborRate: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="3.75"
              />
            </div>
            
            <div>
              <Label htmlFor="personal-margin" className="text-white">Personal Margin (%)</Label>
              <Input
                id="personal-margin"
                type="number"
                step="0.01"
                value={loanData.personalMargin || ''}
                onChange={(e) => setLoanData(prev => ({ ...prev, personalMargin: parseFloat(e.target.value) || 0 }))}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="0.50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="remaining-months" className="text-white">{t('months_left')}</Label>
            <Input
              id="remaining-months"
              value={loanData.remaining}
              onChange={(e) => setLoanData(prev => ({ ...prev, remaining: e.target.value }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="60 months"
            />
          </div>
        </>
      )}

      {isCredit && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="credit-interest" className="text-white">{t('yearly_interest')} (%)</Label>
            <Input
              id="credit-interest"
              type="number"
              step="0.01"
              value={loanData.rate || ''}
              onChange={(e) => setLoanData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
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
              value={loanData.minimumPercent || ''}
              onChange={(e) => setLoanData(prev => ({ ...prev, minimumPercent: parseFloat(e.target.value) || 3 }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="3.0"
            />
          </div>
        </div>
      )}

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

      {calculatedValues.estimatedEuribor > 0 && (
        <div className="bg-blue-500/20 p-3 rounded border border-blue-500/30">
          <p className="text-white text-sm font-medium mb-2">Calculated from your payment data:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
            <div>
              <span>Estimated Euribor: </span>
              <span className="font-medium">{calculatedValues.estimatedEuribor.toFixed(2)}%</span>
            </div>
            <div>
              <span>Estimated Margin: </span>
              <span className="font-medium">{calculatedValues.estimatedMargin.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoanFormFields;
