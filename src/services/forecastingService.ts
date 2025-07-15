import { loadFinancialData } from './storageService';
import { isPaymentPaidForMonth } from '@/utils/paymentUtils';

export interface ForecastData {
  date: string;
  predicted: number;
  actual?: number;
  confidence?: {
    lower: number;
    upper: number;
  };
}

export interface SpendingPattern {
  category: string;
  monthlyAverage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
  prediction: number;
}

export interface CashFlowProjection {
  date: string;
  balance: number;
  income: number;
  expenses: number;
  netFlow: number;
}

export interface FinancialHealthScore {
  overall: number;
  savings: number;
  debt: number;
  spending: number;
  trends: string[];
  recommendations: string[];
}

class ForecastingService {
  
  // Simple moving average forecasting
  private calculateMovingAverage(data: number[], window: number = 3): number {
    if (data.length === 0) return 0;
    const relevantData = data.slice(-window);
    return relevantData.reduce((sum, val) => sum + val, 0) / relevantData.length;
  }

  // Linear trend calculation
  private calculateTrend(data: number[]): { slope: number; intercept: number } {
    if (data.length < 2) return { slope: 0, intercept: data[0] || 0 };
    
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  // Calculate standard deviation for confidence intervals
  private calculateStandardDeviation(data: number[]): number {
    if (data.length < 2) return 0;
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  // Expense forecasting with confidence intervals
  generateExpenseForecast(months: number = 6): ForecastData[] {
    const financialData = loadFinancialData();
    if (!financialData?.transactions) return [];

    // Group expenses by month
    const monthlyExpenses: { [key: string]: number } = {};
    
    financialData.transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const month = new Date(transaction.date).toISOString().slice(0, 7);
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + Math.abs(transaction.amount);
      });

    const sortedMonths = Object.keys(monthlyExpenses).sort();
    const expenseValues = sortedMonths.map(month => monthlyExpenses[month]);

    if (expenseValues.length < 2) return [];

    // Calculate trend and moving average
    const trend = this.calculateTrend(expenseValues);
    const movingAvg = this.calculateMovingAverage(expenseValues);
    const stdDev = this.calculateStandardDeviation(expenseValues);

    // Generate forecasts
    const forecasts: ForecastData[] = [];
    const lastMonth = new Date();
    
    for (let i = 1; i <= months; i++) {
      const futureMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + i, 1);
      const trendPrediction = trend.intercept + trend.slope * (expenseValues.length + i - 1);
      const avgPrediction = movingAvg;
      
      // Weighted combination of trend and moving average
      const predicted = (trendPrediction * 0.7) + (avgPrediction * 0.3);
      
      forecasts.push({
        date: futureMonth.toISOString().slice(0, 7) + '-01',
        predicted: Math.max(0, predicted),
        confidence: {
          lower: Math.max(0, predicted - (1.96 * stdDev)),
          upper: predicted + (1.96 * stdDev)
        }
      });
    }

    return forecasts;
  }

  // Category-based spending patterns
  analyzeSpendingPatterns(): SpendingPattern[] {
    const financialData = loadFinancialData();
    if (!financialData?.transactions) return [];

    const categoryData: { [key: string]: number[] } = {};
    const now = new Date();
    
    // Group by category and month for last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toISOString().slice(0, 7);
      
      financialData.transactions
        .filter(t => 
          t.type === 'expense' && 
          new Date(t.date).toISOString().slice(0, 7) === monthKey
        )
        .forEach(transaction => {
          const category = transaction.category || 'other';
          if (!categoryData[category]) categoryData[category] = [];
          
          const monthIndex = categoryData[category].length;
          if (!categoryData[category][monthIndex]) {
            categoryData[category][monthIndex] = 0;
          }
          categoryData[category][monthIndex] += Math.abs(transaction.amount);
        });
    }

    // Analyze patterns for each category
    const patterns: SpendingPattern[] = [];
    
    Object.entries(categoryData).forEach(([category, monthlyAmounts]) => {
      if (monthlyAmounts.length < 3) return;
      
      const monthlyAverage = monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length;
      const trend = this.calculateTrend(monthlyAmounts);
      const stdDev = this.calculateStandardDeviation(monthlyAmounts);
      
      let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (Math.abs(trend.slope) > monthlyAverage * 0.1) {
        trendDirection = trend.slope > 0 ? 'increasing' : 'decreasing';
      }
      
      const nextMonthPrediction = trend.intercept + trend.slope * monthlyAmounts.length;
      
      patterns.push({
        category,
        monthlyAverage,
        trend: trendDirection,
        volatility: stdDev / monthlyAverage,
        prediction: Math.max(0, nextMonthPrediction)
      });
    });

    return patterns.sort((a, b) => b.monthlyAverage - a.monthlyAverage);
  }

  // Cash flow projections including upcoming payments
  generateCashFlowProjection(months: number = 12): CashFlowProjection[] {
    const financialData = loadFinancialData();
    if (!financialData) return [];

    const projections: CashFlowProjection[] = [];
    const currentBalance = financialData.balance || 0;
    let runningBalance = currentBalance;
    
    // Calculate average monthly income from transactions
    const monthlyIncome = this.calculateAverageMonthlyIncome();
    
    // Get upcoming monthly payments
    const monthlyPayments = (financialData.monthlyBills || [])
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    const loanPayments = (financialData.loans || [])
      .filter(loan => loan.currentAmount > 0)
      .reduce((sum, loan) => sum + loan.monthly, 0);

    for (let i = 0; i < months; i++) {
      const projectionDate = new Date();
      projectionDate.setMonth(projectionDate.getMonth() + i + 1);
      
      // Estimate other expenses based on historical data
      const historicalExpenses = this.calculateAverageMonthlyExpenses();
      const totalExpenses = monthlyPayments + loanPayments + historicalExpenses;
      
      const netFlow = monthlyIncome - totalExpenses;
      runningBalance += netFlow;
      
      projections.push({
        date: projectionDate.toISOString().slice(0, 7) + '-01',
        balance: runningBalance,
        income: monthlyIncome,
        expenses: totalExpenses,
        netFlow
      });
    }

    return projections;
  }

  // Calculate financial health score
  calculateFinancialHealthScore(): FinancialHealthScore {
    const financialData = loadFinancialData();
    if (!financialData) {
      return {
        overall: 0,
        savings: 0,
        debt: 0,
        spending: 0,
        trends: [],
        recommendations: []
      };
    }

    const balance = financialData.balance || 0;
    const monthlyIncome = this.calculateAverageMonthlyIncome();
    const monthlyExpenses = this.calculateAverageMonthlyExpenses();
    const totalDebt = (financialData.loans || [])
      .reduce((sum, loan) => sum + loan.currentAmount, 0);

    // Scoring components (0-100 each)
    const savingsScore = Math.min(100, Math.max(0, (balance / (monthlyIncome * 3)) * 100));
    const debtScore = totalDebt === 0 ? 100 : Math.max(0, 100 - (totalDebt / (monthlyIncome * 12)) * 50);
    const spendingScore = monthlyIncome > 0 ? 
      Math.max(0, 100 - ((monthlyExpenses / monthlyIncome) * 100)) : 0;

    const overall = (savingsScore + debtScore + spendingScore) / 3;

    // Generate recommendations
    const recommendations: string[] = [];
    const trends: string[] = [];

    if (savingsScore < 50) {
      recommendations.push("Build an emergency fund of 3-6 months expenses");
      trends.push("Low savings buffer");
    }
    
    if (debtScore < 70) {
      recommendations.push("Focus on debt reduction to improve financial health");
      trends.push("High debt-to-income ratio");
    }
    
    if (spendingScore < 60) {
      recommendations.push("Review and optimize spending habits");
      trends.push("High expense ratio");
    }

    if (overall >= 80) {
      trends.push("Strong financial position");
    } else if (overall >= 60) {
      trends.push("Moderate financial health");
    } else {
      trends.push("Financial improvement needed");
    }

    return {
      overall,
      savings: savingsScore,
      debt: debtScore,
      spending: spendingScore,
      trends,
      recommendations
    };
  }

  private calculateAverageMonthlyIncome(): number {
    const financialData = loadFinancialData();
    if (!financialData?.transactions) return 0;

    const incomeTransactions = financialData.transactions
      .filter(t => t.type === 'income')
      .slice(-12); // Last 12 transactions

    if (incomeTransactions.length === 0) return 0;
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    return totalIncome / Math.max(1, incomeTransactions.length);
  }

  private calculateAverageMonthlyExpenses(): number {
    const financialData = loadFinancialData();
    if (!financialData?.transactions) return 0;

    // Calculate non-recurring expenses (excluding bills that are tracked separately)
    const monthlyExpenses: { [key: string]: number } = {};
    
    financialData.transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const month = new Date(transaction.date).toISOString().slice(0, 7);
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + Math.abs(transaction.amount);
      });

    const expenseValues = Object.values(monthlyExpenses);
    if (expenseValues.length === 0) return 0;
    
    return expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length;
  }
}

export const forecastingService = new ForecastingService();