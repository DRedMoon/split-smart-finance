
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { loadFinancialData, saveFinancialData } from '@/services/storageService';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    upcomingPayments: true,
    backupReminders: true,
    lowBalance: false,
    monthlyReport: false,
    paymentDays: 3,
    backupDays: 7,
    balanceThreshold: 100
  });

  useEffect(() => {
    const data = loadFinancialData();
    if (data?.settings?.notifications) {
      setSettings(prev => ({ ...prev, ...data.settings.notifications }));
    }
  }, []);

  const handleSave = () => {
    const data = loadFinancialData();
    if (data) {
      data.settings.notifications = settings;
      saveFinancialData(data);
      toast({
        title: t('settings_saved'),
        description: t('notification_settings_updated'),
      });
    }
  };

  const notificationTypes = [
    {
      key: 'upcomingPayments',
      title: t('upcoming_payments'),
      description: t('notify_before_payments_due'),
      hasTimeSetting: true,
      timeKey: 'paymentDays'
    },
    {
      key: 'backupReminders',
      title: t('backup_reminders'),
      description: t('remind_to_create_backups'),
      hasTimeSetting: true,
      timeKey: 'backupDays'
    },
    {
      key: 'lowBalance',
      title: t('low_balance_alert'),
      description: t('notify_when_balance_low'),
      hasThreshold: true,
      thresholdKey: 'balanceThreshold'
    },
    {
      key: 'monthlyReport',
      title: t('monthly_report'),
      description: t('monthly_summary_notification')
    }
  ];

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('notification_settings')}</h1>
      </div>

      <Card className="mb-6 bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Bell size={20} />
            <span>{t('notification_preferences')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((type) => (
            <div key={type.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <div className="font-medium">{type.title}</div>
                  <div className="text-sm text-white/70">{type.description}</div>
                </div>
                <Switch 
                  checked={settings[type.key]}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, [type.key]: checked }))
                  }
                />
              </div>
              
              {settings[type.key] && type.hasTimeSetting && (
                <div className="ml-4">
                  <Label className="text-white text-sm">{t('notify_days_before')}</Label>
                  <Select 
                    value={settings[type.timeKey].toString()} 
                    onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, [type.timeKey]: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 {t('day')}</SelectItem>
                      <SelectItem value="3">3 {t('days')}</SelectItem>
                      <SelectItem value="7">7 {t('days')}</SelectItem>
                      <SelectItem value="14">14 {t('days')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {settings[type.key] && type.hasThreshold && (
                <div className="ml-4">
                  <Label className="text-white text-sm">{t('threshold_amount')}</Label>
                  <Select 
                    value={settings[type.thresholdKey].toString()} 
                    onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, [type.thresholdKey]: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">€50</SelectItem>
                      <SelectItem value="100">€100</SelectItem>
                      <SelectItem value="200">€200</SelectItem>
                      <SelectItem value="500">€500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-[#294D73] border-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <AlertTriangle size={20} />
            <span>{t('important_note')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 text-sm mb-4">
            {t('notification_permission_required')}
          </p>
          <Button onClick={handleSave} className="w-full bg-white text-[#294D73]">
            <Save size={16} className="mr-2" />
            {t('save_settings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
