
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Type, Monitor, Contrast } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';

const AppearanceSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const data = loadFinancialData();
    if (data?.settings) {
      setTheme(data.settings.theme || 'dark');
      setFontSize(data.settings.fontSize || 'medium');
      setHighContrast(data.settings.highContrast || false);
    }
    
    // Apply current theme to document
    applyTheme(data?.settings?.theme || 'dark');
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newTheme === 'light') {
      root.style.setProperty('--background', '210 45% 98%');
      root.style.setProperty('--foreground', '210 45% 15%');
      root.style.setProperty('--card',  '0 0% 100%');
      root.style.setProperty('--card-foreground', '210 45% 15%');
      root.style.setProperty('--primary', '210 32% 32%');
      root.style.setProperty('--primary-foreground', '210 40% 98%');
      root.style.setProperty('--secondary', '210 45% 96%');
      root.style.setProperty('--secondary-foreground', '210 32% 32%');
      root.style.setProperty('--muted', '210 45% 96%');
      root.style.setProperty('--muted-foreground', '210 20% 50%');
      root.style.setProperty('--accent', '210 45% 96%');
      root.style.setProperty('--accent-foreground', '210 32% 32%');
      root.style.setProperty('--border', '210 30% 85%');
      root.style.setProperty('--input', '210 30% 85%');
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.style.setProperty('--background', '210 45% 15%');
      root.style.setProperty('--foreground', '210 40% 98%');
      root.style.setProperty('--card', '210 45% 15%');
      root.style.setProperty('--card-foreground', '210 40% 98%');
      root.style.setProperty('--primary', '210 32% 32%');
      root.style.setProperty('--primary-foreground', '210 40% 98%');
      root.style.setProperty('--secondary', '210 35% 20%');
      root.style.setProperty('--secondary-foreground', '210 40% 98%');
      root.style.setProperty('--muted', '210 35% 20%');
      root.style.setProperty('--muted-foreground', '210 20% 65%');
      root.style.setProperty('--accent', '210 35% 20%');
      root.style.setProperty('--accent-foreground', '210 40% 98%');
      root.style.setProperty('--border', '210 35% 20%');
      root.style.setProperty('--input', '210 35% 20%');
      root.classList.remove('light');
      root.classList.add('dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    const data = loadFinancialData();
    if (data) {
      data.settings.theme = newTheme;
      saveFinancialData(data);
      
      applyTheme(newTheme);
      
      toast({
        title: t('theme_changed'),
        description: `${newTheme === 'dark' ? t('dark_theme') : t('light_theme')} ${t('is_active')}`,
      });
    }
  };

  const handleFontSizeChange = (newSize: 'small' | 'medium' | 'large') => {
    setFontSize(newSize);
    const data = loadFinancialData();
    if (data) {
      data.settings.fontSize = newSize;
      saveFinancialData(data);
      
      // Apply font size to document
      const sizes = { small: '14px', medium: '16px', large: '18px' };
      document.documentElement.style.fontSize = sizes[newSize];
      
      toast({
        title: t('font_size_changed'),
        description: `${newSize === 'small' ? t('small') : newSize === 'medium' ? t('medium') : t('large')} ${t('font_size')}`,
      });
    }
  };

  const handleHighContrastToggle = (enabled: boolean) => {
    setHighContrast(enabled);
    const data = loadFinancialData();
    if (data) {
      data.settings.highContrast = enabled;
      saveFinancialData(data);
      
      // Apply high contrast
      if (enabled) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      
      toast({
        title: enabled ? t('high_contrast_enabled') : t('high_contrast_disabled'),
        description: enabled ? t('high_contrast_mode_active') : t('high_contrast_mode_disabled'),
      });
    }
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('appearance')}</h1>
      </div>

      {/* Theme Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Palette size={20} />
            <span>{t('theme')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">{t('color_theme')}</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('light_theme')}</SelectItem>
                <SelectItem value="dark">{t('dark_theme')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('high_contrast')}</div>
              <div className="text-sm text-white/70">{t('high_contrast_description')}</div>
            </div>
            <Switch 
              checked={highContrast}
              onCheckedChange={handleHighContrastToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Font Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Type size={20} />
            <span>{t('text_settings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">{t('font_size')}</Label>
            <Select value={fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">{t('small')}</SelectItem>
                <SelectItem value="medium">{t('medium')}</SelectItem>
                <SelectItem value="large">{t('large')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Monitor size={20} />
            <span>{t('screen_settings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-white/70 text-sm">
            <p>{t('additional_screen_settings_coming')}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{t('background_color_options')}</li>
              <li>{t('card_color_themes')}</li>
              <li>{t('font_family_selection')}</li>
              <li>{t('custom_color_schemes')}</li>
              <li>{t('accessibility_options')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
