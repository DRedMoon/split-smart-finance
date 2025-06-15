
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Download, Upload, Database, Palette, Settings as SettingsIcon, Lock, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { exportFinancialData, importFinancialData, saveFinancialData, loadFinancialData, clearAllData, logError, logAnalytics } from '@/services/storageService';
import { initializeNotifications, showNotification }  from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const checkNotificationPermission = async () => {
      const hasPermission = await initializeNotifications();
      setNotificationsEnabled(hasPermission);
    };
    checkNotificationPermission();
  }, []);

  const handleExportData = () => {
    exportFinancialData();
    toast({
      title: 'Varmuuskopio luotu',
      description: 'Tiedot on viety onnistuneesti',
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFinancialData(file)
        .then(() => {
          toast({
            title: 'Tiedot tuotu',
            description: 'Tiedot on tuotu onnistuneesti',
          });
        })
        .catch(() => {
          toast({
            title: 'Virhe',
            description: 'Virhe tietojen tuonnissa',
            variant: "destructive"
          });
        });
    }
  };

  const handleClearAllData = () => {
    if (confirm('Haluatko varmasti tyhjentää kaikki tiedot?')) {
      clearAllData();
      toast({
        title: 'Tiedot tyhjennetty',
        description: 'Kaikki tiedot on poistettu',
      });
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await initializeNotifications();
      if (hasPermission) {
        setNotificationsEnabled(true);
        await showNotification('Ilmoitukset käytössä', 'Saat nyt ilmoituksia maksuista');
        toast({
          title: 'Ilmoitukset käytössä',
          description: 'Saat nyt ilmoituksia maksuista',
        });
      } else {
        toast({
          title: 'Käyttöoikeus evätty',
          description: 'Ilmoitukset tarvitsevat käyttöoikeuden',
          variant: "destructive"
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const settingsGroups = [
    {
      title: 'Tili',
      items: [
        { icon: User, label: 'Profiili', action: () => navigate('/profile') },
        { icon: Bell, label: 'Ilmoitukset', action: () => navigate('/notification-settings') },
        { icon: Shield, label: 'Yksityisyys ja turvallisuus', action: () => navigate('/privacy') }
      ]
    },
    {
      title: 'Ulkoasu ja ominaisuudet',
      items: [
        { icon: Palette, label: 'Ulkoasu', action: () => navigate('/appearance') },
        { icon: SettingsIcon, label: 'Varmuuskopiot', action: () => navigate('/backup-settings') }
      ]
    },
    {
      title: 'Turvallisuus ja salasanat',
      items: [
        { icon: Lock, label: 'Vaihda salasana', action: () => navigate('/security') },
        { icon: Key, label: 'Lisää salasana', action: () => navigate('/security') }
      ]
    },
    {
      title: 'Tiedot',
      items: [
        { icon: Database, label: 'Tietojen hallinta', action: () => navigate('/data-management') },
        { icon: Download, label: 'Vie tiedot', action: handleExportData },
        { icon: Upload, label: 'Tuo tiedot', action: () => document.getElementById('import-input')?.click() }
      ]
    }
  ];

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">Asetukset</h1>
      </div>

      {/* Profile Card */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-white">
                {loadFinancialData()?.profile?.name || 'Käyttäjä'}
              </h3>
              <p className="text-white/70">{loadFinancialData()?.profile?.email || 'user@example.com'}</p>
              <div className="flex space-x-4 mt-2 text-sm">
                <span className="text-green-300">Saldo: €{loadFinancialData()?.balance?.toFixed(2) || '0.00'}</span>
                <span className="text-red-300">Velat: €{loadFinancialData()?.loans?.reduce((sum, loan) => sum + loan.currentAmount, 0)?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selector */}
      <div className="mb-6">
        <LanguageSelector />
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <Card key={groupIndex} className="bg-[#294D73] border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <div 
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-white/5 rounded-lg px-2"
                    onClick={item.action}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon && <item.icon size={20} className="text-white/70" />}
                      <span className="font-medium text-white">{item.label}</span>
                    </div>
                    <span className="text-white/70">→</span>
                  </div>
                  {itemIndex < group.items.length -1 && <Separator className="bg-white/10" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Management */}
      <Card className="mt-6 bg-[#294D73] border-none">
        <CardContent className="p-4 space-y-2">
          <Button
            variant="ghost"
            onClick={handleClearAllData}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Tyhjennä kaikki tiedot
          </Button>
        </CardContent>
      </Card>

      {/* Hidden file input for import */}
      <input
        id="import-input"
        type="file"
        accept=".json"
        onChange={handleImportData}
        className="hidden"
      />

      {/* App Info */}
      <div className="text-center mt-6 text-sm text-white/50">
        <p>Taloudenhallinta-sovellus</p>
        <p>Versio 1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;
