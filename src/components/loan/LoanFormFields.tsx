
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
  setIsCredit?: (value: boolean) => void;
}

const LoanFormFields = ({ loanData, setLoanData, calculatedValues, isCredit, setIsCredit }: LoanFormFieldsProps) => {
  const { t } = useLanguage();

  const handleNumberInput = (field: string, value: string) => {
    console.log('LoanFormFields - Input received:', field, value);
    
    // Allow empty string, numbers, and decimal separators (comma or dot) - including partial decimals
    if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
      console.log('LoanFormFields - Setting field:', field, 'raw value:', value);
      
      // Always store the raw string value to preserve user input during typing
      setLoanData(prev => ({ ...prev, [field]: value }));
    }
  };

  const getNumericValue = (value: number | string): number => {
    if (typeof value === 'string') {
      if (value === '' || value === '.' || value === ',') return 0;
      const normalizedValue = value.replace(',', '.');
      return parseFloat(normalizedValue) || 0;
    }
    return value || 0;
  };

  const formatDisplayValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    return value === 0 ? '' : value.toString();
  };

  return (
    <>
      <div>
        <Label htmlFor="loan-type" className="text-white">Tyyppi</Label>
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
          <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loan">Laina</SelectItem>
            <SelectItem value="credit">Luottokortti</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="loan-name" className="text-white">
          {isCredit ? 'Luottokortin nimi' : 'Lainan nimi'}
        </Label>
        <Input
          id="loan-name"
          value={loanData.name}
          onChange={(e) => setLoanData(prev => ({ ...prev, name: e.target.value }))}
          className="bg-white/10 border-white/20 text-white mt-2"
          placeholder={isCredit ? 'Luottokortin nimi' : 'Lainan nimi'}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total-amount" className="text-white">
            {isCredit ? 'Luottoraja' : 'Lainan kokonaissumma'}
          </Label>
          <Input
            id="total-amount"
            type="text"
            value={formatDisplayValue(loanData.totalAmount)}
            onChange={(e) => handleNumberInput('totalAmount', e.target.value)}
            className="bg-white/10 border-white/20 text-white mt-2"
            placeholder="15000"
          />
        </div>
        
        <div>
          <Label htmlFor="current-amount" className="text-white">
            {isCredit ? 'Käytetty luotto' : 'Jäljellä maksettava summa'}
          </Label>
          <Input
            id="current-amount"
            type="text"
            value={formatDisplayValue(loanData.currentAmount)}
            onChange={(e) => handleNumberInput('currentAmount', e.target.value)}
            className="bg-white/10 border-white/20 text-white mt-2"
            placeholder="12000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthly-payment" className="text-white">Kuukausimaksu (€)</Label>
          <Input
            id="monthly-payment"
            type="text"
            value={formatDisplayValue(loanData.monthly)}
            onChange={(e) => handleNumberInput('monthly', e.target.value)}
            className="bg-white/10 border-white/20 text-white mt-2"
            placeholder="881"
          />
        </div>
        
        <div>
          <Label htmlFor="management-fee" className="text-white">Hoitokulu (€)</Label>
          <Input
            id="management-fee"
            type="text"
            value={formatDisplayValue(loanData.managementFee)}
            onChange={(e) => handleNumberInput('managementFee', e.target.value)}
            className="bg-white/10 border-white/20 text-white mt-2"
            placeholder="2.5"
          />
        </div>
      </div>

      {!isCredit && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="euribor-rate" className="text-white">Euribor-korko (%)</Label>
              <Input
                id="euribor-rate"
                type="text"
                value={formatDisplayValue(loanData.euriborRate)}
                onChange={(e) => handleNumberInput('euriborRate', e.target.value)}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="3.75"
              />
            </div>
            
            <div>
              <Label htmlFor="personal-margin" className="text-white">Henkilökohtainen marginaali (%)</Label>
              <Input
                id="personal-margin"
                type="text"
                value={formatDisplayValue(loanData.personalMargin)}
                onChange={(e) => handleNumberInput('personalMargin', e.target.value)}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="0.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="remaining-months" className="text-white">Kuukausia jäljellä</Label>
            <Input
              id="remaining-months"
              value={loanData.remaining}
              onChange={(e) => setLoanData(prev => ({ ...prev, remaining: e.target.value }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="60 kuukautta"
            />
          </div>
        </>
      )}

      {isCredit && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="credit-interest" className="text-white">Vuosikorko (%)</Label>
            <Input
              id="credit-interest"
              type="text"
              value={formatDisplayValue(loanData.rate)}
              onChange={(e) => handleNumberInput('rate', e.target.value)}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="15.5"
            />
          </div>
          
          <div>
            <Label htmlFor="minimum-percent" className="text-white">Vähimmäismaksuprosentti (%)</Label>
            <Input
              id="minimum-percent"
              type="text"
              value={formatDisplayValue(loanData.minimumPercent)}
              onChange={(e) => handleNumberInput('minimumPercent', e.target.value)}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="3.0"
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="due-date" className="text-white">Eräpäivä</Label>
        <Input
          id="due-date"
          value={loanData.dueDate}
          onChange={(e) => setLoanData(prev => ({ ...prev, dueDate: e.target.value }))}
          className="bg-white/10 border-white/20 text-white mt-2"
          placeholder="15."
        />
      </div>

      {calculatedValues.estimatedEuribor > 0 && calculatedValues.estimatedMargin > 0.1 && (
        <div className="bg-blue-500/20 p-3 rounded border border-blue-500/30">
          <p className="text-white text-sm font-medium mb-2">Laskettu maksutiedoistasi:</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
            <div>
              <span>Arvioitu Euribor: </span>
              <span className="font-medium">{calculatedValues.estimatedEuribor.toFixed(2)}%</span>
            </div>
            <div>
              <span>Arvioitu marginaali: </span>
              <span className="font-medium">{calculatedValues.estimatedMargin.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoanFormFields;
