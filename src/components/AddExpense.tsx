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
    isRecurring: false
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

  const handleQuickAdd = () => {
    if (!quickData.name || quickData.amount === 0 || !quickData.category) {
      toast({
        title: t('error'),
        description: t('fill_required_fields'),
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

      // Add to monthly bills if marked as recurring or if it's a recurring payment category
      const data = loadFinancialData();
      const categoryData = data?.categories?.find(cat => 
        cat.name.toLowerCase().replace(/\s+/g, '_') === quickData.category
      );

      const recurringCategories = ['insurance', 'subscription', 'bill', 'maintenance_charge', 'hoitovastike', 'housing_company_expenditure'];
      const isAutoRecurring = categoryData?.isMonthlyPayment || 
                             categoryData?.isMaintenanceCharge || 
                             categoryData?.isHousingCompanyExpenditure ||
                             recurringCategories.includes(quickData.category);

      if (quickData.isRecurring || isAutoRecurring) {
        // Add to monthly bills with default due date
        addMonthlyBill({
          name: quickData.name,
          amount: quickData.amount,
          dueDate: '15th', // Default due date
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
      isRecurring: false
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
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('quick_add')}</h1>
      </div>

      {/* Quick Add Form */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{t('quick_add')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-1 bg-[#192E45] p-1 rounded-lg">
            <button
              onClick={() => setQuickData(prev => ({ ...prev, type: 'expense' }))}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                quickData.type === 'expense' 
                  ? 'bg-[#294D73] text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {t('expense')}
            </button>
            <button
              onClick={() => setQuickData(prev => ({ ...prev, type: 'income' }))}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                quickData.type === 'income' 
                  ? 'bg-[#294D73] text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {t('income')}
            </button>
          </div>

          <div>
            <Label htmlFor="quick-name" className="text-white">
              {quickData.type === 'expense' ? t('expense_name') : t('income_name')}
            </Label>
            <Input
              id="quick-name"
              value={quickData.name}
              onChange={(e) => setQuickData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder={quickData.type === 'expense' ? t('expense_name') : t('income_name')}
            />
          </div>
          
          <div>
            <Label htmlFor="quick-amount" className="text-white">{t('sum')}</Label>
            <Input
              id="quick-amount"
              type="number"
              value={quickData.amount || ''}
              onChange={(e) => setQuickData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="quick-category" className="text-white">{t('category')}</Label>
            <Select value={quickData.category} onValueChange={(value) => setQuickData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
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

          {quickData.type === 'expense' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={quickData.isRecurring}
                onCheckedChange={(checked) => setQuickData(prev => ({ ...prev, isRecurring: !!checked }))}
                className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-[#294D73]"
              />
              <Label htmlFor="recurring" className="text-white text-sm">
                {t('recurring_payment')}
              </Label>
            </div>
          )}
          
          <Button onClick={handleQuickAdd} className="w-full bg-white text-[#294D73]">
            <Plus size={16} className="mr-2" />
            {quickData.type === 'expense' ? t('add_expense') : t('add_income')}
          </Button>
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card className="bg-[#294D73] border-none">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/create-category')}
            className="w-full justify-start text-white hover:bg-white/10"
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
