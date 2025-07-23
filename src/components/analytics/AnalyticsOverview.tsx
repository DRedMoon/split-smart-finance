import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

interface AnalyticsOverviewProps {
  totalExpenses: number;
  totalIncome: number;
  monthlyAverage: number;
  mostExpensiveCategory: string;
  savingsRate: number;
}

const AnalyticsOverview = ({
  totalExpenses,
  totalIncome,
  monthlyAverage,
  mostExpensiveCategory,
  savingsRate
}: AnalyticsOverviewProps) => {
  const { t } = useSafeLanguage();

  const stats = [
    {
      title: t('total_expenses'),
      value: `€${totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      title: t('total_income'),
      value: `€${totalIncome.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: t('monthly_average'),
      value: `€${monthlyAverage.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: t('savings_rate'),
      value: `${savingsRate.toFixed(1)}%`,
      icon: PieChart,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-[#294D73] border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.title}</p>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsOverview;