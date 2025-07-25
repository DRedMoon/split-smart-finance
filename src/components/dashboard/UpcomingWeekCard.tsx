
import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useNavigate } from 'react-router-dom';

interface UpcomingWeekCardProps {
  filteredWeekPayments: any[];
}

const UpcomingWeekCard = ({ filteredWeekPayments }: UpcomingWeekCardProps) => {
  const { t } = useSafeLanguage();
  const navigate = useNavigate();

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <Calendar size={20} />
          <span>{t('upcoming_week')}</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/upcoming')}
          className="text-white hover:bg-white/10"
        >
          <ArrowRight size={16} />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredWeekPayments.length === 0 ? (
          <p className="text-white/70 text-center py-4">{t('no_payments_this_week')}</p>
        ) : (
          <div className="space-y-3">
            {filteredWeekPayments.slice(0, 3).map(bill => (
              <div key={bill.id} className="flex justify-between items-center p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <div>
                  <div className="font-medium text-white">{bill.name}</div>
                  <div className="text-sm text-white/70">{t('due')} {bill.dueDate}</div>
                </div>
                <div className="font-bold text-yellow-300">€{bill.amount}</div>
              </div>
            ))}
            {filteredWeekPayments.length > 3 && (
              <p className="text-white/70 text-sm text-center">+{filteredWeekPayments.length - 3} {t('more_this_week')}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingWeekCard;
