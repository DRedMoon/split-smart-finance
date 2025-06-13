
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
      setSettings(prev => ({
        ...prev,
        theme: data.settings.theme,
        fontSize: data.settings.fontSize,
        highContrast: data.settings.highContrast || false
      }));
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to storage
    const data = loadFinancialData();
    if (data) {
      data.settings = { ...data.settings, [key]: value };
      if (key === 'highContrast') {
        data.settings.highContrast = value;
      }
      saveFinancialData(data);
    }
    
    // Apply theme changes immediately
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
    
    // Apply brightness changes
    if (key === 'screenBrightness') {
      document.documentElement.style.filter = `brightness(${value}%)`;
    }
    
    toast({
      title: 'Asetus päivitetty',
      description: `${key} päivitetty onnistuneesti`
    });
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
            <label className="text-white font-medium mb-2 block">Fonttikoko</label>
            <Select value={settings.fontSize} onValueChange={(value: 'small' | 'medium' | 'large') => handleSettingChange('fontSize', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pieni</SelectItem>
                <SelectItem value="medium">Keskikokoinen</SelectItem>
                <SelectItem value="large">Suuri</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">Korkea kontrasti</div>
              <div className="text-sm text-white/70">Parempi näkyvyys</div>
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
            <label className="text-white font-medium mb-3 block">Näytön kirkkaus: {settings.screenBrightness}%</label>
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
            <label className="text-white font-medium mb-2 block">Näytön aikakatkaisu</label>
            <Select value={settings.screenTimeout.toString()} onValueChange={(value) => handleSettingChange('screenTimeout', parseInt(value))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 sekuntia</SelectItem>
                <SelectItem value="30">30 sekuntia</SelectItem>
                <SelectItem value="60">1 minuutti</SelectItem>
                <SelectItem value="300">5 minuuttia</SelectItem>
                <SelectItem value="0">Ei koskaan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">Saldo lukitusnäytössä</div>
              <div className="text-sm text-white/70">Näytä saldo lukitusnäytössä</div>
            </div>
            <Switch 
              checked={settings.showBalanceOnLockScreen}
              onCheckedChange={(checked) => handleSettingChange('showBalanceOnLockScreen', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="font-medium">Animaatiot</div>
              <div className="text-sm text-white/70">Käytä siirtymäanimaatioita</div>
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
            <span>Teema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white font-medium mb-2 block">Sovelluksen teema</label>
            <Select value={settings.theme} onValueChange={(value: 'light' | 'dark') => handleSettingChange('theme', value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Vaalea</SelectItem>
                <SelectItem value="dark">Tumma</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
