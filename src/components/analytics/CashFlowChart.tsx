import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CashFlowProjection } from '@/services/forecastingService';

interface CashFlowChartProps {
  projections: CashFlowProjection[];
}

const CashFlowChart = ({ projections }: CashFlowChartProps) => {
  const { t } = useLanguage();

  if (!projections || projections.length === 0) {
    return (
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <DollarSign size={20} />
            <span>{t('cash_flow_projection')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white/70 text-center py-8">
            {t('no_cash_flow_data')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => `€${Math.abs(value).toFixed(0)}`;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Calculate key metrics
  const currentBalance = projections[0]?.balance || 0;
  const finalBalance = projections[projections.length - 1]?.balance || 0;
  const lowestBalance = Math.min(...projections.map(p => p.balance));
  const avgNetFlow = projections.reduce((sum, p) => sum + p.netFlow, 0) / projections.length;
  
  const balanceChange = finalBalance - currentBalance;
  const hasNegativeBalance = lowestBalance < 0;
  const isImproving = avgNetFlow > 0;

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <DollarSign size={20} />
            <span>{t('cash_flow_projection')}</span>
            {isImproving && <TrendingUp size={16} className="text-green-400" />}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                balanceChange > 0 ? 'text-green-300 border-green-300' : 
                balanceChange < 0 ? 'text-red-300 border-red-300' : 
                'text-white border-white/30'
              }`}
            >
              {balanceChange > 0 ? '+' : ''}€{balanceChange.toFixed(0)}
            </Badge>
            {hasNegativeBalance && (
              <AlertTriangle size={14} className="text-red-400" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={projections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#ffffff60"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                stroke="#ffffff60"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={formatDate}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Legend />
              
              {/* Zero line reference */}
              <ReferenceLine y={0} stroke="#ffffff40" strokeDasharray="2 2" />
              
              {/* Income bars */}
              <Bar
                dataKey="income"
                fill="#10B981"
                fillOpacity={0.8}
                name={t('income')}
              />
              
              {/* Expense bars (negative values) */}
              <Bar
                dataKey="expenses"
                fill="#EF4444"
                fillOpacity={0.8}
                name={t('expenses')}
              />
              
              {/* Balance line */}
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name={t('balance')}
              />
              
              {/* Net flow line */}
              <Line
                type="monotone"
                dataKey="netFlow"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                name={t('net_flow')}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-white/60 text-xs">{t('current_balance')}</div>
            <div className={`font-semibold ${currentBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {formatCurrency(currentBalance)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-xs">{t('projected_balance')}</div>
            <div className={`font-semibold ${finalBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {formatCurrency(finalBalance)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-xs">{t('lowest_point')}</div>
            <div className={`font-semibold ${lowestBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {formatCurrency(lowestBalance)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/60 text-xs">{t('avg_net_flow')}</div>
            <div className={`font-semibold ${avgNetFlow >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {avgNetFlow > 0 ? '+' : ''}{formatCurrency(avgNetFlow)}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {hasNegativeBalance && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} className="text-red-400" />
              <div className="text-red-300 text-sm font-medium">
                {t('negative_balance_warning')}
              </div>
            </div>
            <div className="text-red-200 text-xs mt-1">
              {t('consider_reducing_expenses')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;