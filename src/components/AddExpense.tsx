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
import { addTransaction, addIncome, loadFinancialData, addMonthlyBill } from '@/services/storageService';
import DueDatePicker from './loan/DueDatePicker';

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
    dueDate: ''
  });

  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    // Load existing categories from financial data
    const data = loadFinancialData();
    const customCategories = data?.categories || [];
    setAvailableCategories(customCategories);
  }, []);

  // Auto-set recurring for subscription category
  useEffect(() => {
    if (quickData.category === 'subscription') {
      setQuickData(prev => ({ ...prev, isRecurring: true }));
    }
  }, [quickData.category]);

  // Check if category requires due date
  const requiresDueDate = (category) => {
    const dueDateCategories = ['subscription', 'bill', 'insurance', 'loan_repayment', 'credit_repayment', 'credit_purchase'];
    
    // Check default categories
    if (dueDateCategories.includes(category)) return true;
    
    // Check custom categories
    const categoryData = availableCategories.find(cat => 
      cat.name.toLowerCase().replace(/\s+/g, '_') === category
    );
    return categoryData?.requiresDueDate || false;
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

    if (quickData.type === 'expense') {
      addTransaction({
        name: quickData.name,
        amount: -quickData.amount, // Expenses are negative
        category: quickData.category,
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });

      // Only add to monthly bills if it's explicitly marked as recurring AND it's a bill-type category
      const data = loadFinancialData();
      const categoryData = data?.categories?.find(cat => 
        cat.name.toLowerCase().replace(/\s+/g, '_') === quickData.category
      );

      // Only these categories should be added to monthly bills
      const billCategories = ['insurance', 'subscription', 'bill', 'maintenance_charge', 'hoitovastike', 'housing_company_expenditure'];
      const isBillCategory = categoryData?.isMonthlyPayment || 
                            categoryData?.isMaintenanceCharge || 
                            categoryData?.isHousingCompanyExpenditure ||
                            billCategories.includes(quickData.category);

      // Only add to monthly bills if it's both recurring AND a bill-type category
      if (quickData.isRecurring && isBillCategory) {
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
      dueDate: ''
    });
  };

  const defaultCategories = [
    { value: 'food', label: t('food') },
    { value: 'transport', label: t('transport') },
    { value: 'entertainment', label: t('entertainment') },
    { value: 'bill', label: t('bill') },
    { value: 'insurance', label: t('insurance') },
    { value: 'subscription', label: t('subscription') },
    { value: 'other', label: t('other') },
    { value: 'paycheck', label: t('paycheck') },
    { value: 'loan_repayment', label: t('loan_repayment') },
    { value: 'credit_repayment', label: t('credit_repayment') },
    { value: 'credit_purchase', label: t('credit_purchase') }
  ];

  // Combine default categories with custom categories
  const allCategories = [
    ...defaultCategories,
    ...availableCategories.map(cat => ({
      value: cat.name.toLowerCase().replace(/\s+/g, '_'),
      label: cat.name
    }))
  ];

  // Remove duplicates based on value
  const uniqueCategories = allCategories.filter((category, index, self) =>
    index === self.findIndex((t) => t.value === category.value)
  );

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
          
          <div>
            <Label htmlFor="quick-category" className="text-sidebar-foreground">{t('category')}</Label>
            <Select value={quickData.category} onValueChange={(value) => setQuickData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground mt-2">
                <SelectValue placeholder={t('select_category')} />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((category) => (
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
