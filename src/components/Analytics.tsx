import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, type FinancialData } from '@/services/storageService';
import ExpenseChart from './analytics/ExpenseChart';
import CategoryChart from './analytics/CategoryChart';
import MonthlyComparisonChart from './analytics/MonthlyComparisonChart';
import AnalyticsOverview from './analytics/AnalyticsOverview';

const Analytics = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('6');

  useEffect(() => {
    const data = loadFinancialData();
    if (data) {
      setFinancialData(data);
    }
  }, []);

  const processExpenseData = () => {
    if (!financialData?.transactions) return [];
    
    const months = parseInt(selectedPeriod);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    
    const monthlyData: { [key: string]: number } = {};
    
    financialData.transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= startDate)
      .forEach(transaction => {
        const month = new Date(transaction.date).toISOString().slice(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + transaction.amount;
      });
    
    return Object.entries(monthlyData).map(([month, amount]) => ({
      month: `${month}-01`,
      amount
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processCategoryData = () => {
    if (!financialData?.transactions) return [];
    
    const months = parseInt(selectedPeriod);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    
    const categoryData: { [key: string]: number } = {};
    
    financialData.transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= startDate)
      .forEach(transaction => {
        const category = transaction.category || 'other';
        categoryData[category] = (categoryData[category] || 0) + transaction.amount;
      });
    
    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  };

  const processMonthlyComparisonData = () => {
    if (!financialData?.transactions) return [];
    
    const months = parseInt(selectedPeriod);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
    
    financialData.transactions
      .filter(t => new Date(t.date) >= startDate)
      .forEach(transaction => {
        const month = new Date(transaction.date).toISOString().slice(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expenses: 0 };
        }
        
        if (transaction.type === 'income') {
          monthlyData[month].income += transaction.amount;
        } else {
          monthlyData[month].expenses += transaction.amount;
        }
      });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month: `${month}-01`,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const calculateOverviewStats = () => {
    if (!financialData?.transactions) {
      return {
        totalExpenses: 0,
        totalIncome: 0,
        monthlyAverage: 0,
        mostExpensiveCategory: '',
        savingsRate: 0
      };
    }
    
    const months = parseInt(selectedPeriod);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    
    const expenses = financialData.transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= startDate);
    
    const income = financialData.transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= startDate);
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(t => {
      const category = t.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
    });
    
    const mostExpensiveCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    return {
      totalExpenses,
      totalIncome,
      monthlyAverage: totalExpenses / months,
      mostExpensiveCategory,
      savingsRate
    };
  };

  if (!financialData) {
    return (
      <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-4xl mx-auto">
        <div className="text-white text-center py-8">{t('loading')}</div>
      </div>
    );
  }

  const expenseData = processExpenseData();
  const categoryData = processCategoryData();
  const comparisonData = processMonthlyComparisonData();
  const overviewStats = calculateOverviewStats();

  return (
    <div className="min-h-screen bg-[#192E45] p-4 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BarChart3 size={24} />
            <span>{t('analytics')}</span>
          </h1>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32 bg-[#294D73] border-none text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 {t('months')}</SelectItem>
            <SelectItem value="6">6 {t('months')}</SelectItem>
            <SelectItem value="12">12 {t('months')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <AnalyticsOverview {...overviewStats} />

      {/* Charts */}
      <div className="space-y-6">
        {/* Expense Trend */}
        <ExpenseChart 
          data={expenseData} 
          title={t('expense_trend')} 
        />

        {/* Category Breakdown */}
        <CategoryChart 
          data={categoryData} 
          title={t('category_breakdown')} 
        />

        {/* Monthly Comparison */}
        <MonthlyComparisonChart 
          data={comparisonData} 
          title={t('income_vs_expenses')} 
        />
      </div>
    </div>
  );
};

export default Analytics;