import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { addTransaction, addIncome, loadFinancialData, addMonthlyBill, saveFinancialData } from '@/services/storageService';
import DueDatePicker from './loan/DueDatePicker';
import { getAllCategories, isLoanPaymentCategory, requiresDueDate as categoryRequiresDueDate } from '@/services/categoryService';

const AddExpense = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Quick Add state
  const [quickData, setQuickData] = useState({
    name: '',
    amount: 0,
    category: '',
    type: 'expense',
    isRecurring: false,
    dueDate: '',
    selectedLoan: '',
    principalAmount: 0,
    interestAmount: 0
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableLoans, setAvailableLoans] = useState([]);

  useEffect(() => {
    const data = loadFinancialData();
    const categories = getAllCategories();
    setAvailableCategories(categories);
    
    // Load loans for loan payment selection
    const loans = data?.loans || [];
    setAvailableLoans(loans);
  }, []);

  // Auto-set recurring for subscription category
  useEffect(() => {
    if (quickData.category === 'subscription') {
      setQuickData(prev => ({ ...prev, isRecurring: true }));
    }
  }, [quickData.category]);

  // Check if category requires due date
  const requiresDueDate = (category) => {
    return categoryRequiresDueDate(category);
  };

  // Check if selected category is loan payment
  const isLoanPayment = (category) => {
    return isLoanPaymentCategory(category);
  };

  const handleQuickAdd = () => {
    if (!quickData.name || quickData.amount === 0 || !quickData.category) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    // Check if due date is required but missing
    if (requiresDueDate(quickData.category) && !quickData.dueDate) {
      toast({
        title: t('error'),
        description: t('due_date_required'),
        variant: "destructive"
      });
      return;
    }

    // For loan payments, validate principal and interest amounts
    if (isLoanPayment(quickData.category)) {
      // Only require loan selection for actual loan repayment
      if (quickData.category === 'loan_repayment' && !quickData.selectedLoan) {
        toast({
          title: t('error'),
          description: 'Please select a loan',
          variant: "destructive"
        });
        return;
      }

      if (quickData.principalAmount === 0 || quickData.interestAmount === 0) {
        toast({
          title: t('error'),
          description: 'Please enter both principal and interest amounts',
          variant: "destructive"
        });
        return;
      }

      // Auto-calculate total amount from principal + interest
      const totalAmount = quickData.principalAmount + quickData.interestAmount;
      setQuickData(prev => ({ ...prev, amount: totalAmount }));
    }

    if (quickData.type === 'expense') {
      const transactionData = {
        name: quickData.name,
        amount: -quickData.amount, // Expenses are negative
        category: quickData.category,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        ...(isLoanPayment(quickData.category) && {
          loanId: parseInt(quickData.selectedLoan),
          principalAmount: quickData.principalAmount,
          interestAmount: quickData.interestAmount
        })
      };

      addTransaction(transactionData);

      // Update loan balance if it's a loan payment
      if (isLoanPayment(quickData.category) && quickData.selectedLoan) {
        const data = loadFinancialData();
        if (data && data.loans) {
          const loanIndex = data.loans.findIndex(loan => loan.id === parseInt(quickData.selectedLoan));
          if (loanIndex !== -1) {
            // Update loan amounts
            data.loans[loanIndex].currentAmount -= quickData.principalAmount;
            if (data.loans[loanIndex].totalInterest) {
              data.loans[loanIndex].totalInterest -= quickData.interestAmount;
            }
            saveFinancialData(data);
          }
        }
      }

      // Only add to monthly bills if it's explicitly marked as recurring AND requires a due date
      if (quickData.isRecurring && requiresDueDate(quickData.category)) {
        addMonthlyBill({
          name: quickData.name,
          amount: quickData.amount,
          dueDate: quickData.dueDate || '15th',
          type: quickData.category,
          paid: false
        });
      }
      
      toast({
        title: t('expense_added'),
        description: `${quickData.name}: €${quickData.amount.toFixed(2)}`
      });
    } else {
      addIncome({
        name: quickData.name,
        amount: quickData.amount,
        category: quickData.category,
        date: new Date().toISOString().split('T')[0],
        type: 'income'
      });
      
      toast({
        title: t('income_added'),
        description: `${quickData.name}: €${quickData.amount.toFixed(2)}`
      });
    }

    setQuickData({
      name: '',
      amount: 0,
      category: '',
      type: 'expense',
      isRecurring: false,
      dueDate: '',
      selectedLoan: '',
      principalAmount: 0,
      interestAmount: 0
    });
  };

  // Use categories from the centralized service
  const allCategories = availableCategories.map(cat => ({
    value: cat.englishKey,
    label: cat.name
  }));

  return (
    <div className="p-4 pb-20 bg-sidebar min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-sidebar-foreground hover:bg-sidebar-accent">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-sidebar-foreground">{t('quick_add')}</h1>
      </div>

      {/* Quick Add Form */}
      <Card className="mb-6 bg-sidebar-accent border-none">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground">{t('quick_add')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-1 bg-sidebar p-1 rounded-lg">
            <button
              onClick={() => setQuickData(prev => ({ ...prev, type: 'expense' }))}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                quickData.type === 'expense' 
                  ? 'bg-sidebar-accent text-sidebar-foreground' 
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              {t('expense')}
            </button>
            <button
              onClick={() => setQuickData(prev => ({ ...prev, type: 'income' }))}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                quickData.type === 'income' 
                  ? 'bg-sidebar-accent text-sidebar-foreground' 
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              {t('income')}
            </button>
          </div>

          <div>
            <Label htmlFor="quick-name" className="text-sidebar-foreground">
              {quickData.type === 'expense' ? t('expense_name') : t('income_name')}
            </Label>
            <Input
              id="quick-name"
              value={quickData.name}
              onChange={(e) => setQuickData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground mt-2"
              placeholder={quickData.type === 'expense' ? t('expense_name') : t('income_name')}
            />
          </div>
          
          {/* Only show sum field when not in loan payment mode */}
          {!isLoanPayment(quickData.category) && (
            <div>
              <Label htmlFor="quick-amount" className="text-sidebar-foreground">{t('sum')}</Label>
              <Input
                id="quick-amount"
                type="number"
                value={quickData.amount || ''}
                onChange={(e) => setQuickData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground mt-2"
                placeholder="0.00"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="quick-category" className="text-sidebar-foreground">{t('category')}</Label>
            <Select value={quickData.category} onValueChange={(value) => setQuickData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground mt-2">
                <SelectValue placeholder={t('select_category')} />
              </SelectTrigger>
               <SelectContent>
                 {allCategories.map((category) => (
                   <SelectItem key={category.value} value={category.value}>
                     {category.label}
                   </SelectItem>
                 ))}
               </SelectContent>
            </Select>
          </div>

           {/* Due Date Picker - only show for categories that require it */}
           {quickData.category && requiresDueDate(quickData.category) && (
             <DueDatePicker
               value={quickData.dueDate}
               onChange={(value) => setQuickData(prev => ({ ...prev, dueDate: value }))}
               label={t('due_date')}
               placeholder={t('select_day')}
             />
           )}

           {/* Principal/Interest Fields - show for loan payment and credit card categories */}
           {quickData.category && isLoanPayment(quickData.category) && (
             <>
               {/* Only show loan selection for actual loan repayment */}
               {quickData.category === 'loan_repayment' && (
                 <div>
                   <Label htmlFor="loan-select" className="text-sidebar-foreground">{t('select_loan')}</Label>
                   <Select value={quickData.selectedLoan} onValueChange={(value) => setQuickData(prev => ({ ...prev, selectedLoan: value }))}>
                     <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground mt-2">
                       <SelectValue placeholder={t('select_loan')} />
                     </SelectTrigger>
                     <SelectContent>
                       {availableLoans.map((loan) => (
                         <SelectItem key={loan.id} value={loan.id.toString()}>
                           {loan.name} - €{loan.currentAmount.toFixed(2)}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="principal-amount" className="text-sidebar-foreground">{t('principal_amount')}</Label>
                   <Input
                     id="principal-amount"
                     type="number"
                     value={quickData.principalAmount || ''}
                     onChange={(e) => setQuickData(prev => ({ ...prev, principalAmount: parseFloat(e.target.value) || 0 }))}
                     className="bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground mt-2"
                     placeholder="0.00"
                   />
                 </div>
                 <div>
                   <Label htmlFor="interest-amount" className="text-sidebar-foreground">{t('interest_amount')}</Label>
                   <Input
                     id="interest-amount"
                     type="number"
                     value={quickData.interestAmount || ''}
                     onChange={(e) => setQuickData(prev => ({ ...prev, interestAmount: parseFloat(e.target.value) || 0 }))}
                     className="bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground mt-2"
                     placeholder="0.00"
                   />
                 </div>
               </div>

               {/* Show calculation summary */}
               {quickData.principalAmount > 0 && quickData.interestAmount > 0 && (
                 <div className="bg-sidebar-accent/30 p-3 rounded-lg">
                   <div className="text-sidebar-foreground text-sm">
                     <div className="flex justify-between">
                       <span>{t('principal')}:</span>
                       <span>€{quickData.principalAmount.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>{t('interest')}:</span>
                       <span>€{quickData.interestAmount.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between font-semibold border-t border-sidebar-border pt-2 mt-2">
                       <span>{t('total')}:</span>
                       <span>€{(quickData.principalAmount + quickData.interestAmount).toFixed(2)}</span>
                     </div>
                   </div>
                 </div>
               )}
             </>
           )}

          {quickData.type === 'expense' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={quickData.isRecurring}
                onCheckedChange={(checked) => setQuickData(prev => ({ ...prev, isRecurring: !!checked }))}
                className="border-sidebar-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <Label htmlFor="recurring" className="text-sidebar-foreground text-sm">
                {t('recurring_payment')}
              </Label>
            </div>
          )}
          
          <Button onClick={handleQuickAdd} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={16} className="mr-2" />
            {quickData.type === 'expense' ? t('add_expense') : t('add_income')}
          </Button>
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card className="bg-sidebar-accent border-none">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/create-category')}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings size={16} className="mr-2" />
            {t('create_edit_category')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpense;
