
import React, { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Plus, BarChart3, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = useMemo(() => [
    { path: '/', icon: Home, label: t('home') },
    { path: '/upcoming', icon: Calendar, label: t('upcoming') },
    { path: '/add', icon: Plus, label: t('add'), special: true },
    { path: '/analytics', icon: BarChart3, label: t('analytics') },
    { path: '/settings', icon: Settings, label: t('settings') }
  ], [t]);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, path: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
    }
  }, [navigate]);

  return (
    <nav 
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-sidebar-accent border-t border-sidebar-border px-4 py-2"
      role="navigation"
      aria-label={t('main_navigation')}
    >
      <div className="flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label, special }) => {
          const isActive = location.pathname === path;
          
          return (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              onKeyDown={(e) => handleKeyDown(e, path)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-ring ${
                special 
                  ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/50' 
                  : isActive 
                    ? 'bg-sidebar text-sidebar-foreground' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

export default Navigation;
