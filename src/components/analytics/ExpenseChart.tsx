import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

interface ExpenseChartProps {
  data: any[];
  title: string;
}

const ExpenseChart = ({ data, title }: ExpenseChartProps) => {
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
          <LineChart data={data}>
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
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#ff6b6b" 
              strokeWidth={2}
              dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ExpenseChart;