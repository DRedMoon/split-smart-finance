
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Plus, BarChart3, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/upcoming', icon: Calendar, label: t('upcoming') },
    { path: '/add', icon: Plus, label: t('add'), special: true },
    { path: '/analytics', icon: BarChart3, label: t('analytics_dashboard') },
    { path: '/settings', icon: Settings, label: t('settings') }
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-[#294D73] border-t border-[#192E45] px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label, special }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                special 
                  ? 'bg-[#192E45] text-white' 
                  : isActive 
                    ? 'bg-[#192E45] text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
