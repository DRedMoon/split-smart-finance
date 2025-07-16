
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Type, Monitor, Eye, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';

const AppearanceSettings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    theme: 'dark' as 'light' | 'dark',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    highContrast: false,
    screenBrightness: 100,
    screenTimeout: 30,
    showBalanceOnLockScreen: true,
    animationsEnabled: true
  });

  useEffect(() => {
    const data = loadFinancialData();
    if (data?.settings) {
      const loadedSettings = {
        ...settings,
        theme: data.settings.theme || 'dark',
        fontSize: data.settings.fontSize || 'medium',
        highContrast: data.settings.highContrast || false
      };
      setSettings(loadedSettings);
      
      // Apply all loaded settings immediately
      Object.entries(loadedSettings).forEach(([key, value]) => {
        applySettings(key, value);
      });
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to storage
    const data = loadFinancialData();
    if (data) {
      data.settings = { ...data.settings, [key]: value };
      saveFinancialData(data);
    }
    
    // Apply changes immediately
    applySettings(key, value);
    
    toast({
      title: t('setting_updated'),
      description: `${key} ${t('updated_successfully')}`
    });
  };

  const applySettings = (key: string, value: any) => {
    const root = document.documentElement;
    
    // Apply theme changes
    if (key === 'theme') {
      root.className = value === 'dark' ? 'dark' : '';
      root.setAttribute('data-theme', value);
      // Update CSS custom properties
      if (value === 'dark') {
        root.style.setProperty('--background', '222.2 84% 4.9%');
        root.style.setProperty('--foreground', '210 40% 98%');
      } else {
        root.style.setProperty('--background', '0 0% 100%');
        root.style.setProperty('--foreground', '222.2 84% 4.9%');
      }
    }
    
    // Apply font size changes
    if (key === 'fontSize') {
      const sizeMap = { small: '14px', medium: '16px', large: '18px' };
      root.style.fontSize = sizeMap[value as keyof typeof sizeMap];
    }
    
    // Apply high contrast
    if (key === 'highContrast') {
      if (value) {
        root.style.filter = 'contrast(1.5)';
        root.style.setProperty('--contrast-multiplier', '1.5');
      } else {
        root.style.filter = 'contrast(1)';
        root.style.setProperty('--contrast-multiplier', '1');
      }
    }
    
    // Apply brightness changes
    if (key === 'screenBrightness') {
      root.style.filter = `brightness(${value}%)`;
    }
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('appearance')}</h1>
      </div>

      {/* Text Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Type size={20} />
            <span>{t('text_settings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white font-medium mb-2 block">{t('font_size')}</label>
            <Select value={settings.fontSize} onValueChange={(value: 'small' | 'medium' | 'large') => handleSettingChange('fontSize', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">{t('small')}</SelectItem>
                <SelectItem value="medium">{t('medium')}</SelectItem>
                <SelectItem value="large">{t('large')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('high_contrast')}</div>
              <div className="text-sm text-white/70">{t('better_visibility')}</div>
            </div>
            <Switch 
              checked={settings.highContrast}
              onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Screen Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Monitor size={20} />
            <span>{t('screen_settings')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-white font-medium mb-3 block">{t('screen_brightness')}: {settings.screenBrightness}%</label>
            <Slider
              value={[settings.screenBrightness]}
              onValueChange={(value) => handleSettingChange('screenBrightness', value[0])}
              max={100}
              min={10}
              step={10}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-white font-medium mb-2 block">{t('screen_timeout')}</label>
            <Select value={settings.screenTimeout.toString()} onValueChange={(value) => handleSettingChange('screenTimeout', parseInt(value))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">{t('seconds_15')}</SelectItem>
                <SelectItem value="30">{t('seconds_30')}</SelectItem>
                <SelectItem value="60">{t('minute_1')}</SelectItem>
                <SelectItem value="300">{t('minutes_5')}</SelectItem>
                <SelectItem value="0">{t('never')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('balance_on_lock_screen')}</div>
              <div className="text-sm text-white/70">{t('show_balance_on_lock_screen')}</div>
            </div>
            <Switch 
              checked={settings.showBalanceOnLockScreen}
              onCheckedChange={(checked) => handleSettingChange('showBalanceOnLockScreen', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">{t('animations')}</div>
              <div className="text-sm text-white/70">{t('use_transition_animations')}</div>
            </div>
            <Switch 
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => handleSettingChange('animationsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Palette size={20} />
            <span>{t('theme')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white font-medium mb-2 block">{t('app_theme')}</label>
            <Select value={settings.theme} onValueChange={(value: 'light' | 'dark') => handleSettingChange('theme', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('light')}</SelectItem>
                <SelectItem value="dark">{t('dark')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
