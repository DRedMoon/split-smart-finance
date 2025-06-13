import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Download, LogOut, Upload, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { exportFinancialData, importFinancialData, saveFinancialData, loadFinancialData, clearAllData } from '@/services/storageService';
import { initializeNotifications, showNotification }  from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [backupEnabled, setBackupEnabled] = useState(true);

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
      title: t('backup_created'),
      description: "Taloudelliset tiedot on viety onnistuneesti",
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFinancialData(file)
        .then(() => {
          toast({
            title: t('data_imported'),
            description: "Tiedot on tuotu onnistuneesti",
          });
        })
        .catch(() => {
          toast({
            title: "Virhe",
            description: "Tietojen tuonti epäonnistui",
            variant: "destructive"
          });
        });
    }
  };

  const handleBackupSettings = () => {
    const data = loadFinancialData();
    if (data && backupEnabled) {
      saveFinancialData(data);
      toast({
        title: "Varmuuskopio luotu",
        description: "Tiedot on tallennettu onnistuneesti",
      });
    }
  };

  const handleClearAllData = () => {
    if (confirm("Haluatko varmasti tyhjentää kaikki tiedot? Tätä toimintoa ei voi peruuttaa.")) {
      clearAllData();
      toast({
        title: "Tiedot tyhjennetty",
        description: "Kaikki tiedot on poistettu",
      });
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await initializeNotifications();
      if (hasPermission) {
        setNotificationsEnabled(true);
        await showNotification("Ilmoitukset käytössä", "Saat nyt ilmoituksia tulevista maksuista");
        toast({
          title: "Ilmoitukset käytössä",
          description: "Saat ilmoituksia tulevista maksuista",
        });
      } else {
        toast({
          title: "Lupa evätty",
          description: "Ilmoitusten käyttö vaatii luvan",
          variant: "destructive"
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const settingsGroups = [
    {
      title: t('account'),
      items: [
        { icon: User, label: t('profile'), action: () => navigate('/profile') },
        { icon: Bell, label: t('notifications'), hasSwitch: true, switchValue: notificationsEnabled, onSwitchChange: handleNotificationToggle },
        { icon: Shield, label: t('privacy_security'), action: () => navigate('/privacy') }
      ]
    },
    {
      title: t('data'),
      items: [
        { icon: Database, label: 'Tiedonhallinta', action: () => navigate('/data-management') },
        { icon: Download, label: t('export_data'), action: handleExportData },
        { icon: Upload, label: t('import_data'), action: () => document.getElementById('import-input')?.click() },
        { label: t('backup_settings'), hasSwitch: true, switchValue: backupEnabled, onSwitchChange: setBackupEnabled, action: handleBackupSettings }
      ]
    }
  ];

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('settings')}</h1>
      </div>

      {/* Profile Card */}
      <Card className="mb-6 bg-[#294D73] border-none">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-white">Käyttäjä</h3>
              <p className="text-white/70">user@example.com</p>
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
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      {item.icon && <item.icon size={20} className="text-white/70" />}
                      <span className="font-medium text-white">{item.label}</span>
                    </div>
                    {item.hasSwitch ? (
                      <Switch 
                        checked={item.switchValue}
                        onCheckedChange={(checked) => {
                          if (item.onSwitchChange) {
                            item.onSwitchChange(checked);
                          }
                          if (item.action && checked) {
                            item.action();
                          }
                        }}
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={item.action}
                        className="text-white/70 hover:bg-white/10"
                      >
                        →
                      </Button>
                    )}
                  </div>
                  {itemIndex < group.items.length - 1 && <Separator className="bg-white/10" />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Settings */}
      <Card className="mt-6 bg-[#294D73] border-none">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/security')}
            className="w-full justify-start text-white hover:bg-white/10"
          >
            <Shield size={20} className="mr-3" />
            Turvallisuusasetukset
          </Button>
        </CardContent>
      </Card>

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

      {/* Logout Button */}
      <Card className="mt-6 bg-[#294D73] border-none">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={20} className="mr-3" />
            {t('sign_out')}
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
        <p>Taloushallinnan Sovellus</p>
        <p>Versio 1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;
