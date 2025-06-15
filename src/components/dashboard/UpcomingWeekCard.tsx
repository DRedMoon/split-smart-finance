
import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface UpcomingWeekCardProps {
  filteredWeekPayments: any[];
}

const UpcomingWeekCard = ({ filteredWeekPayments }: UpcomingWeekCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card className="bg-[#294D73] border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-1 p-2">
        <CardTitle className="text-white text-lg flex items-center space-x-2">
          <Calendar size={20} />
          <span>{t('upcoming_week')}</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/upcoming')}
          className="text-white hover:bg-white/10 p-1"
        >
          <ArrowRight size={16} />
        </Button>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        {filteredWeekPayments.length === 0 ? (
          <p className="text-white/70 text-center py-2 text-sm">Ei maksuja tällä viikolla</p>
        ) : (
          <div className="space-y-2">
            {filteredWeekPayments.slice(0, 3).map(bill => (
              <div key={bill.id} className="flex justify-between items-center p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <div>
                  <div className="font-medium text-white text-sm">{bill.name}</div>
                  <div className="text-xs text-white/70">{t('due')} {bill.dueDate}</div>
                </div>
                <div className="font-bold text-yellow-300 text-sm">€{bill.amount}</div>
              </div>
            ))}
            {filteredWeekPayments.length > 3 && (
              <p className="text-white/70 text-xs text-center">+{filteredWeekPayments.length - 3} more this week</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingWeekCard;
