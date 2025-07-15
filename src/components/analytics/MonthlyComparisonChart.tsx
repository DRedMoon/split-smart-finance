import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

interface MonthlyComparisonChartProps {
  data: any[];
  title: string;
}

const MonthlyComparisonChart = ({ data, title }: MonthlyComparisonChartProps) => {
  const { t } = useLanguage();

  const formatTooltip = (value: any, name: string) => {
    return [`€${value.toFixed(2)}`, name];
  };

  const formatXAxis = (tickItem: string) => {
    return format(new Date(tickItem), 'MMM');
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatXAxis}
              tick={{ fill: '#ffffff', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#ffffff', fontSize: 12 }}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => format(new Date(label), 'MMMM yyyy')}
              contentStyle={{
                backgroundColor: '#1f3a5f',
                border: '1px solid #294D73',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#ffffff' }}
              formatter={(value) => <span style={{ color: '#ffffff' }}>{value}</span>}
            />
            <Bar dataKey="income" fill="#4ecdc4" name={t('income')} />
            <Bar dataKey="expenses" fill="#ff6b6b" name={t('expenses')} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyComparisonChart;