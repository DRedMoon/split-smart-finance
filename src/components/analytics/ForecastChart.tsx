import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ForecastData } from '@/services/forecastingService';

interface ForecastChartProps {
  data: ForecastData[];
  title: string;
  type?: 'expense' | 'income' | 'balance';
}

const ForecastChart = ({ data, title, type = 'expense' }: ForecastChartProps) => {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white/70 text-center py-8">
            {t('no_forecast_data')}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const firstValue = data[0]?.predicted || 0;
  const lastValue = data[data.length - 1]?.predicted || 0;
  const trendPercentage = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const isIncreasing = trendPercentage > 5;
  const isDecreasing = trendPercentage < -5;

  const formatCurrency = (value: number) => `€${Math.abs(value).toFixed(0)}`;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const getColorForType = () => {
    switch (type) {
      case 'income': return '#10B981'; // Green
      case 'balance': return '#3B82F6'; // Blue
      default: return '#F59E0B'; // Orange for expenses
    }
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <span>{title}</span>
            {isIncreasing && <TrendingUp size={16} className="text-red-400" />}
            {isDecreasing && <TrendingDown size={16} className="text-green-400" />}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                isIncreasing ? 'text-red-300 border-red-300' : 
                isDecreasing ? 'text-green-300 border-green-300' : 
                'text-white border-white/30'
              }`}
            >
              {trendPercentage > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
            </Badge>
            {Math.abs(trendPercentage) > 20 && (
              <AlertTriangle size={14} className="text-orange-400" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              
              {/* Confidence interval area */}
              <Area
                type="monotone"
                dataKey="confidence.upper"
                stackId="confidence"
                stroke="none"
                fill={getColorForType()}
                fillOpacity={0.1}
                name="Confidence Range"
              />
              <Area
                type="monotone"
                dataKey="confidence.lower"
                stackId="confidence"
                stroke="none"
                fill="#ffffff"
                fillOpacity={0.1}
              />
              
              {/* Actual values line (if available) */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#ffffff"
                strokeWidth={2}
                dot={{ fill: '#ffffff', strokeWidth: 2, r: 3 }}
                name="Actual"
                connectNulls={false}
              />
              
              {/* Predicted values line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke={getColorForType()}
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: getColorForType(), strokeWidth: 2, r: 4 }}
                name="Predicted"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Forecast summary */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-white/60 text-xs">{t('next_month')}</div>
              <div className="text-white font-semibold">
                {formatCurrency(data[0]?.predicted || 0)}
              </div>
            </div>
            <div>
              <div className="text-white/60 text-xs">{t('3_months')}</div>
              <div className="text-white font-semibold">
                {formatCurrency(data[2]?.predicted || 0)}
              </div>
            </div>
            <div>
              <div className="text-white/60 text-xs">{t('6_months')}</div>
              <div className="text-white font-semibold">
                {formatCurrency(data[5]?.predicted || 0)}
              </div>
            </div>
            <div>
              <div className="text-white/60 text-xs">{t('trend')}</div>
              <div className={`font-semibold ${
                isIncreasing ? 'text-red-300' : 
                isDecreasing ? 'text-green-300' : 
                'text-white'
              }`}>
                {isIncreasing ? t('increasing') : isDecreasing ? t('decreasing') : t('stable')}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;