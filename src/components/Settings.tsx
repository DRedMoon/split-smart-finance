import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Download, LogOut, Upload, Database, Palette, Settings as SettingsIcon, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
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
  const [errorReporting, setErrorReporting] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const checkNotificationPermission = async () => {
      const hasPermission = await initializeNotifications();
      setNotificationsEnabled(hasPermission);
    };
    checkNotificationPermission();

    // Load settings
    const data = loadFinancialData();
    if (data?.settings) {
      setErrorReporting(data.settings.errorReporting);
      setAnalytics(data.settings.analytics);
    }
  }, []);

  const handleExportData = () => {
    exportFinancialData();
    toast({
      title: t('backup_created'),
      description: t('backup_created'),
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFinancialData(file)
        .then(() => {
          toast({
            title: t('data_imported'),
            description: t('data_imported'),
          });
        })
        .catch(() => {
          toast({
            title: t('error'),
            description: t('error'),
            variant: "destructive"
          });
        });
    }
  };

  const handleClearAllData = () => {
    if (confirm(t('confirm_clear_all_data'))) {
      clearAllData();
      toast({
        title: t('data_cleared'),
        description: t('data_cleared'),
      });
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await initializeNotifications();
      if (hasPermission) {
        setNotificationsEnabled(true);
        await showNotification(t('notifications_enabled'), t('will_receive_payment_notifications'));
        toast({
          title: t('notifications_enabled'),
          description: t('will_receive_payment_notifications'),
        });
      } else {
        toast({
          title: t('permission_denied'),
          description: t('notifications_require_permission'),
          variant: "destructive"
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleErrorReportingToggle = (enabled: boolean) => {
    setErrorReporting(enabled);
    const data = loadFinancialData();
    if (data) {
      data.settings.errorReporting = enabled;
      saveFinancialData(data);
      
      if (enabled) {
        logError(new Error('Test error report'), 'Settings toggle');
      }
      
      toast({
        title: enabled ? t('error_reports_enabled') : t('error_reports_disabled'),
        description: enabled ? t('error_reports_saved') : t('error_reports_cleared'),
      });
    }
  };

  const handleAnalyticsToggle = (enabled: boolean) => {
    setAnalytics(enabled);
    const data = loadFinancialData();
    if (data) {
      data.settings.analytics = enabled;
      saveFinancialData(data);
      
      if (enabled) {
        logAnalytics('settings_analytics_enabled', { timestamp: new Date().toISOString() });
      }
      
      toast({
        title: enabled ? t('analytics_enabled') : t('analytics_disabled'),
        description: enabled ? t('analytics_saved') : t('analytics_cleared'),
      });
    }
  };

  const settingsGroups = [
    {
      title: t('account'),
      items: [
        { icon: User, label: t('profile'), action: () => navigate('/profile') },
        { icon: Bell, label: t('notifications'), action: () => navigate('/notification-settings') },
        { icon: Shield, label: t('privacy_security'), action: () => navigate('/privacy') }
      ]
    },
    {
      title: t('appearance_and_features'),
      items: [
        { icon: Palette, label: t('appearance'), action: () => navigate('/appearance') },
        { icon: SettingsIcon, label: t('backup'), action: () => navigate('/backup-settings') },
        { icon: Plus, label: t('create_category'), action: () => navigate('/create-category') }
      ]
    },
    {
      title: t('data'),
      items: [
        { icon: Database, label: t('data_management'), action: () => navigate('/data-management') },
        { icon: Download, label: t('export_data'), action: handleExportData },
        { icon: Upload, label: t('import_data'), action: () => document.getElementById('import-input')?.click() }
      ]
    },
    {
      title: t('privacy_and_errors'),
      items: [
        { label: t('automatic_error_reports'), hasSwitch: true, switchValue: errorReporting, onSwitchChange: handleErrorReportingToggle },
        { label: t('analytics'), hasSwitch: true, switchValue: analytics, onSwitchChange: handleAnalyticsToggle }
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
              <h3 className="font-semibold text-lg text-white">
                {loadFinancialData()?.profile?.name || t('user')}
              </h3>
              <p className="text-white/70">{loadFinancialData()?.profile?.email || 'user@example.com'}</p>
              <div className="flex space-x-4 mt-2 text-sm">
                <span className="text-green-300">{t('balance')}: €{loadFinancialData()?.balance?.toFixed(2) || '0.00'}</span>
                <span className="text-red-300">{t('debts')}: €{loadFinancialData()?.loans?.reduce((sum, loan) => sum + loan.currentAmount, 0)?.toFixed(2) || '0.00'}</span>
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
            {t('security_settings')}
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
            {t('clear_all_data')}
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
        <p>{t('financial_management_app')}</p>
        <p>{t('version')} 1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;
