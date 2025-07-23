import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

interface CategoryChartProps {
  data: any[];
  title: string;
}

const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];

const CategoryChart = ({ data, title }: CategoryChartProps) => {
  const { t } = useSafeLanguage();

  const formatTooltip = (value: any, name: string) => {
    return [`€${value.toFixed(2)}`, name];
  };

  const renderCustomizedLabel = (entry: any) => {
    const percent = ((entry.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={formatTooltip}
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
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;