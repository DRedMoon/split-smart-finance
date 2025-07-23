
import React from 'react';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import { useNavigate } from 'react-router-dom';

interface MonthlyPaymentsHeaderProps {
  onBack: () => void;
}

const MonthlyPaymentsHeader = ({ onBack }: MonthlyPaymentsHeaderProps) => {
  const { t } = useSafeLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('monthly_payments')}</h1>
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={() => navigate('/settings')} 
          size="sm" 
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Settings size={16} />
        </Button>
        <Button onClick={() => navigate('/add')} size="sm" className="bg-[#294D73] hover:bg-[#1f3a5f]">
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
};

export default MonthlyPaymentsHeader;
