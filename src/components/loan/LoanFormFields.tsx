
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import DueDatePicker from './DueDatePicker';

interface LoanFormFieldsProps {
  loanData: any;
  setLoanData: (data: any) => void;
  calculatedValues: any;
  isCredit: boolean;
  setIsCredit?: (value: boolean) => void;
}

const LoanFormFields = ({ loanData, setLoanData, calculatedValues, isCredit, setIsCredit }: LoanFormFieldsProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleNumberInput = (field: string, value: string) => {
    console.log('LoanFormFields - Input received:', field, value);
    
    // Allow empty string, numbers, and decimal separators (comma or dot) - including partial decimals
    if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
      console.log('LoanFormFields - Setting field:', field, 'raw value:', value);
      
      // Always store the raw string value to preserve user input during typing
      setLoanData(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatDisplayValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    return value === 0 ? '' : value.toString();
  };

  return (
    <>
      <div>
        <Label htmlFor="loan-type" className="text-card-foreground">{t('type')}</Label>
        <Select 
          value={isCredit ? 'credit' : 'loan'} 
          onValueChange={(value) => {
            if (setIsCredit) {
              setIsCredit(value === 'credit');
              setLoanData(prev => ({ 
                ...prev, 
                remaining: value === 'credit' ? 'Credit Card' : '' 
              }));
            }
          }}
        >
          <SelectTrigger className="bg-card/10 border-border/20 text-card-foreground mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loan">{t('loan')}</SelectItem>
            <SelectItem value="credit">{t('credit_card')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="loan-name" className="text-card-foreground">
          {isCredit ? t('credit_card_name') : t('loan_name')}
        </Label>
        <Input
          id="loan-name"
          value={loanData.name}
          onChange={(e) => setLoanData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-card/10 border-border/20 text-card-foreground mt-2"
          placeholder={isCredit ? t('credit_card_name') : t('loan_name')}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total-amount" className="text-card-foreground">
            {isCredit ? t('credit_limit') : t('total_loan_amount')}
          </Label>
          <Input
            id="total-amount"
            type="text"
            value={formatDisplayValue(loanData.totalAmount)}
            onChange={(e) => handleNumberInput('totalAmount', e.target.value)}
            className="bg-card/10 border-border/20 text-card-foreground mt-2"
            placeholder="15000"
          />
        </div>
        
        <div>
          <Label htmlFor="current-amount" className="text-card-foreground">
            {isCredit ? t('used_credit') : t('remaining_amount')}
          </Label>
          <Input
            id="current-amount"
            type="text"
            value={formatDisplayValue(loanData.currentAmount)}
            onChange={(e) => handleNumberInput('currentAmount', e.target.value)}
            className="bg-card/10 border-border/20 text-card-foreground mt-2"
            placeholder="12000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthly-payment" className="text-card-foreground">{t('monthly_payment_euro')}</Label>
          <Input
            id="monthly-payment"
            type="text"
            value={formatDisplayValue(loanData.monthly)}
            onChange={(e) => handleNumberInput('monthly', e.target.value)}
            className="bg-card/10 border-border/20 text-card-foreground mt-2"
            placeholder="881"
          />
        </div>
        
        <div>
          <Label htmlFor="management-fee" className="text-card-foreground">{t('maintenance_fee_euro')}</Label>
          <Input
            id="management-fee"
            type="text"
            value={formatDisplayValue(loanData.managementFee)}
            onChange={(e) => handleNumberInput('managementFee', e.target.value)}
            className="bg-card/10 border-border/20 text-card-foreground mt-2"
            placeholder="2.5"
          />
        </div>
      </div>

      {!isCredit && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
            <Label htmlFor="euribor-rate" className="text-card-foreground">{t('euribor_rate_percent')}</Label>
            <Input
              id="euribor-rate"
              type="text"
              value={formatDisplayValue(loanData.euriborRate)}
              onChange={(e) => handleNumberInput('euriborRate', e.target.value)}
              className="bg-card/10 border-border/20 text-card-foreground mt-2"
              placeholder="3.75"
            />
            </div>
            
            <div>
            <Label htmlFor="personal-margin" className="text-card-foreground">{t('personal_margin_percent')}</Label>
            <Input
              id="personal-margin"
              type="text"
              value={formatDisplayValue(loanData.personalMargin)}
              onChange={(e) => handleNumberInput('personalMargin', e.target.value)}
              className="bg-card/10 border-border/20 text-card-foreground mt-2"
              placeholder="0.5"
            />
            </div>
          </div>

          <div>
          <Label htmlFor="remaining-months" className="text-card-foreground">{t('months_remaining')}</Label>
          <Input
            id="remaining-months"
            value={loanData.remaining}
            onChange={(e) => setLoanData(prev => ({ ...prev, remaining: e.target.value }))}
            className="bg-card/10 border-border/20 text-card-foreground mt-2"
            placeholder={t('months_placeholder')}
          />
          </div>
        </>
      )}

      {isCredit && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="credit-interest" className="text-card-foreground">{t('annual_interest_percent')}</Label>
            <Input
              id="credit-interest"
              type="text"
              value={formatDisplayValue(loanData.rate)}
              onChange={(e) => handleNumberInput('rate', e.target.value)}
              className="bg-card/10 border-border/20 text-card-foreground mt-2"
              placeholder="15.5"
            />
          </div>
          
          <div>
            <Label htmlFor="minimum-percent" className="text-card-foreground">{t('minimum_payment_percent_fi')}</Label>
            <Input
              id="minimum-percent"
              type="text"
              value={formatDisplayValue(loanData.minimumPercent)}
              onChange={(e) => handleNumberInput('minimumPercent', e.target.value)}
              className="bg-card/10 border-border/20 text-card-foreground mt-2"
              placeholder="3.0"
            />
          </div>
        </div>
      )}

      <DueDatePicker
        value={loanData.dueDate}
        onChange={(value) => setLoanData(prev => ({ ...prev, dueDate: value }))}
        label={t('due_date')}
        placeholder={t('select_day')}
      />


      {calculatedValues.estimatedEuribor > 0 && calculatedValues.estimatedMargin > 0.1 && (
        <div className="bg-info/20 p-3 rounded border border-info/30">
          <p className="text-card-foreground text-sm font-medium mb-2">{t('calculated_from_payment_data')}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span>{t('estimated_euribor')}</span>
              <span className="font-medium">{calculatedValues.estimatedEuribor.toFixed(2)}%</span>
            </div>
            <div>
              <span>{t('estimated_margin')}</span>
              <span className="font-medium">{calculatedValues.estimatedMargin.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoanFormFields;
