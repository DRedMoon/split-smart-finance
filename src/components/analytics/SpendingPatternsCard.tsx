import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import type { SpendingPattern } from '@/services/forecastingService';

interface SpendingPatternsCardProps {
  patterns: SpendingPattern[];
}

const SpendingPatternsCard = ({ patterns }: SpendingPatternsCardProps) => {
  const { t } = useSafeLanguage();

  if (!patterns || patterns.length === 0) {
    return (
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Target size={20} />
            <span>{t('spending_patterns')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-white/70 text-center py-8">
            {t('no_spending_patterns')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp size={12} className="text-red-400" />;
      case 'decreasing': return <TrendingDown size={12} className="text-green-400" />;
      default: return <Minus size={12} className="text-white/60" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-300 border-red-300';
      case 'decreasing': return 'text-green-300 border-green-300';
      default: return 'text-white border-white/30';
    }
  };

  const getVolatilityLevel = (volatility: number) => {
    if (volatility > 0.5) return { level: t('high'), color: 'text-red-300' };
    if (volatility > 0.3) return { level: t('medium'), color: 'text-yellow-300' };
    return { level: t('low'), color: 'text-green-300' };
  };

  const maxAmount = Math.max(...patterns.map(p => p.monthlyAverage));

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Target size={20} />
          <span>{t('spending_patterns')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.slice(0, 8).map((pattern, index) => {
          const volatilityInfo = getVolatilityLevel(pattern.volatility);
          const predictionChange = pattern.prediction - pattern.monthlyAverage;
          const changePercentage = pattern.monthlyAverage > 0 ? 
            (predictionChange / pattern.monthlyAverage) * 100 : 0;

          return (
            <div key={pattern.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-white font-medium capitalize">
                    {pattern.category}
                  </div>
                  {getTrendIcon(pattern.trend)}
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    €{pattern.monthlyAverage.toFixed(0)}
                  </div>
                  <div className="text-white/60 text-xs">
                    {t('avg_month')}
                  </div>
                </div>
              </div>

              {/* Progress bar showing relative spending */}
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full"
                  style={{ width: `${(pattern.monthlyAverage / maxAmount) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getTrendColor(pattern.trend)}`}
                  >
                    {t(pattern.trend)}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${volatilityInfo.color} border-current`}
                  >
                    {volatilityInfo.level} {t('volatility')}
                  </Badge>
                </div>
                <div className="text-white/60">
                  {t('next_month')}: €{pattern.prediction.toFixed(0)}
                  {changePercentage !== 0 && (
                    <span className={changePercentage > 0 ? 'text-red-300' : 'text-green-300'}>
                      {' '}({changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Summary */}
        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-white/60 text-xs">{t('total_categories')}</div>
              <div className="text-white font-semibold">{patterns.length}</div>
            </div>
            <div>
              <div className="text-white/60 text-xs">{t('increasing_trends')}</div>
              <div className="text-red-300 font-semibold">
                {patterns.filter(p => p.trend === 'increasing').length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingPatternsCard;