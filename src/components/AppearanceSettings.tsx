
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Type, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';

const AppearanceSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    const data = loadFinancialData();
    if (data?.settings) {
      setTheme(data.settings.theme);
      setFontSize(data.settings.fontSize);
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    const data = loadFinancialData();
    if (data) {
      data.settings.theme = newTheme;
      saveFinancialData(data);
      
      // Apply theme to document
      document.documentElement.className = newTheme;
      
      toast({
        title: "Teema vaihdettu",
        description: `${newTheme === 'dark' ? 'Tumma' : 'Vaalea'} teema on käytössä`,
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
        title: "Fonttikoko vaihdettu",
        description: `${newSize === 'small' ? 'Pieni' : newSize === 'medium' ? 'Keskikokoinen' : 'Suuri'} fonttikoko`,
      });
    }
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">Ulkoasuasetukset</h1>
      </div>

      {/* Theme Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Palette size={20} />
            <span>Teema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Väritema</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
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

      {/* Font Settings */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Type size={20} />
            <span>Tekstiasetukset</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Fonttikoko</Label>
            <Select value={fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pieni</SelectItem>
                <SelectItem value="medium">Keskikokoinen</SelectItem>
                <SelectItem value="large">Suuri</SelectItem>
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
            <span>Näyttöasetukset</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-white/70 text-sm">
            <p>Lisää näyttöasetuksia tulossa pian...</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Taustavärin vaihtoehdot</li>
              <li>Korttien väriteemat</li>
              <li>Fonttiperheen valinta</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
