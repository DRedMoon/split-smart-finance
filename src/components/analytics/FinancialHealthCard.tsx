import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import type { FinancialHealthScore } from '@/services/forecastingService';

interface FinancialHealthCardProps {
  healthScore: FinancialHealthScore;
}

const FinancialHealthCard = ({ healthScore }: FinancialHealthCardProps) => {
  const { t } = useSafeLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={16} className="text-green-400" />;
    if (score >= 60) return <TrendingUp size={16} className="text-yellow-400" />;
    return <AlertTriangle size={16} className="text-red-400" />;
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Shield size={20} />
          <span>{t('financial_health')}</span>
          {getScoreIcon(healthScore.overall)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(healthScore.overall)}`}>
            {Math.round(healthScore.overall)}
          </div>
          <div className="text-white/70 text-sm">{t('overall_score')}</div>
          <Progress 
            value={healthScore.overall} 
            className="mt-2 h-2"
            style={{
              background: 'rgba(255,255,255,0.1)'
            }}
          />
        </div>

        {/* Component Scores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-white text-sm">{t('savings_health')}</div>
            <div className="flex items-center space-x-2">
              <div className={`text-sm font-semibold ${getScoreColor(healthScore.savings)}`}>
                {Math.round(healthScore.savings)}
              </div>
              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(healthScore.savings)}`}
                  style={{ width: `${healthScore.savings}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-white text-sm">{t('debt_health')}</div>
            <div className="flex items-center space-x-2">
              <div className={`text-sm font-semibold ${getScoreColor(healthScore.debt)}`}>
                {Math.round(healthScore.debt)}
              </div>
              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(healthScore.debt)}`}
                  style={{ width: `${healthScore.debt}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-white text-sm">{t('spending_health')}</div>
            <div className="flex items-center space-x-2">
              <div className={`text-sm font-semibold ${getScoreColor(healthScore.spending)}`}>
                {Math.round(healthScore.spending)}
              </div>
              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(healthScore.spending)}`}
                  style={{ width: `${healthScore.spending}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="space-y-2">
          <div className="text-white text-sm font-medium">{t('key_trends')}</div>
          <div className="flex flex-wrap gap-2">
            {healthScore.trends.map((trend, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs text-white border-white/30"
              >
                {trend}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {healthScore.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="text-white text-sm font-medium">{t('recommendations')}</div>
            <div className="space-y-1">
              {healthScore.recommendations.slice(0, 3).map((recommendation, index) => (
                <div key={index} className="text-white/70 text-xs flex items-start space-x-2">
                  <div className="text-yellow-400 mt-1">•</div>
                  <div>{recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialHealthCard;