
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardNavigation = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-3 flex-shrink-0">
      <Button
        onClick={() => navigate('/upcoming')}
        className="bg-[#294D73] hover:bg-[#1f3a5f] text-white"
      >
        {t('upcoming')}
      </Button>
      <Button
        onClick={() => navigate('/transactions')}
        className="bg-[#294D73] hover:bg-[#1f3a5f] text-white"
      >
        {t('transactions')}
      </Button>
    </div>
  );
};

export default DashboardNavigation;
