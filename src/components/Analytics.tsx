import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Target, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, type FinancialData } from '@/services/storageService';
import { forecastingService } from '@/services/forecastingService';

// Existing components
import ExpenseChart from './analytics/ExpenseChart';
import CategoryChart from './analytics/CategoryChart';
import MonthlyComparisonChart from './analytics/MonthlyComparisonChart';
import AnalyticsOverview from './analytics/AnalyticsOverview';

// New forecasting components
import ForecastChart from './analytics/ForecastChart';
import FinancialHealthCard from './analytics/FinancialHealthCard';
import SpendingPatternsCard from './analytics/SpendingPatternsCard';
import CashFlowChart from './analytics/CashFlowChart';

const Analytics = React.memo(() => {
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

  const processExpenseData = useCallback(() => {
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
  }, [financialData, selectedPeriod]);

  const processCategoryData = useCallback(() => {
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
  }, [financialData, selectedPeriod]);

  const processMonthlyComparisonData = useCallback(() => {
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
  }, [financialData, selectedPeriod]);

  const calculateOverviewStats = useCallback(() => {
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
  }, [financialData, selectedPeriod]);

  // Memoized data processing for better performance - Move before conditional return
  const expenseData = useMemo(() => processExpenseData(), [processExpenseData]);
  const categoryData = useMemo(() => processCategoryData(), [processCategoryData]);
  const comparisonData = useMemo(() => processMonthlyComparisonData(), [processMonthlyComparisonData]);
  const overviewStats = useMemo(() => calculateOverviewStats(), [calculateOverviewStats]);

  if (!financialData) {
    return (
      <div className="min-h-screen bg-sidebar p-4 pb-20 max-w-4xl mx-auto">
        <div className="text-sidebar-foreground text-center py-8">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar p-4 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')} 
            className="text-sidebar-foreground hover:bg-sidebar-accent focus:ring-2 focus:ring-sidebar-ring"
            aria-label={t('back_to_home')}
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Button>
          <h1 className="text-2xl font-bold text-sidebar-foreground flex items-center space-x-2">
            <BarChart3 size={24} aria-hidden="true" />
            <span>{t('analytics')}</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="period-select" className="sr-only">{t('select_time_period')}</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger 
              id="period-select"
              className="w-32 bg-sidebar-accent border-none text-sidebar-foreground focus:ring-2 focus:ring-sidebar-ring"
              aria-label={t('select_time_period')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 {t('months')}</SelectItem>
              <SelectItem value="6">6 {t('months')}</SelectItem>
              <SelectItem value="12">12 {t('months')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Overview Stats */}
      <AnalyticsOverview {...overviewStats} />

      {/* Tabbed Interface */}
      <Tabs defaultValue="historical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-sidebar-accent">
          <TabsTrigger value="historical" className="text-sidebar-foreground data-[state=active]:bg-sidebar data-[state=active]:text-sidebar-foreground">
            {t('historical_data')}
          </TabsTrigger>
          <TabsTrigger value="forecasting" className="text-sidebar-foreground data-[state=active]:bg-sidebar data-[state=active]:text-sidebar-foreground">
            {t('forecasting')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historical" className="space-y-6">
          <ExpenseChart data={expenseData} title={t('expense_trend')} />
          <CategoryChart data={categoryData} title={t('category_breakdown')} />
          <MonthlyComparisonChart data={comparisonData} title={t('income_vs_expenses')} />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FinancialHealthCard healthScore={forecastingService.calculateFinancialHealthScore()} />
            <SpendingPatternsCard patterns={forecastingService.analyzeSpendingPatterns()} />
          </div>
          <ForecastChart data={forecastingService.generateExpenseForecast(6)} title={t('expense_forecast')} />
          <CashFlowChart projections={forecastingService.generateCashFlowProjection(12)} />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default Analytics;