
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    monthlyBills: false,
    loanPayments: false,
    creditReminders: false,
    upcomingPayments: false,
    lowBalanceAlerts: false,
    backupReminders: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const permission = await notificationService.checkPermissions();
      const scheduled = await notificationService.getScheduledNotifications();
      
      // Load individual notification preferences
      const savedNotifications = {
        monthlyBills: localStorage.getItem('notif-monthly-bills') === 'true',
        loanPayments: localStorage.getItem('notif-loan-payments') === 'true',
        creditReminders: localStorage.getItem('notif-credit-reminders') === 'true',
        upcomingPayments: localStorage.getItem('notif-upcoming-payments') === 'true',
        lowBalanceAlerts: localStorage.getItem('notif-low-balance') === 'true',
        backupReminders: localStorage.getItem('notif-backup-reminders') === 'true'
      };
      
      setNotifications(savedNotifications);
      setHasPermission(permission);
      setScheduledCount(scheduled.length);
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const toggleNotification = async (type: keyof typeof notifications) => {
    setIsLoading(true);
    try {
      const newValue = !notifications[type];
      
      // Request permission if trying to enable and don't have it
      if (newValue && !hasPermission) {
        const permission = await notificationService.checkPermissions();
        if (!permission) {
          const success = await notificationService.enableNotifications();
          if (!success) {
            toast({
              title: t('permission_denied'),
              description: t('notification_permission_required'),
              variant: 'destructive'
            });
            setIsLoading(false);
            return;
          }
          setHasPermission(true);
        }
      }
      
      // Update local state and storage
      const updatedNotifications = { ...notifications, [type]: newValue };
      setNotifications(updatedNotifications);
      localStorage.setItem(`notif-${type.replace(/([A-Z])/g, '-$1').toLowerCase()}`, newValue.toString());
      
      // Reschedule notifications if enabling
      if (newValue) {
        await notificationService.schedulePaymentReminders();
        const scheduled = await notificationService.getScheduledNotifications();
        setScheduledCount(scheduled.length);
      }
      
      toast({
        title: newValue ? t('notification_enabled') : t('notification_disabled'),
        description: `${t(type)} ${newValue ? t('enabled') : t('disabled')}`,
      });
    } catch (error) {
      console.error('Error toggling notification:', error);
      toast({
        title: t('error'),
        description: t('notification_error'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rescheduleNotifications = async () => {
    setIsLoading(true);
    try {
      await notificationService.schedulePaymentReminders();
      const scheduled = await notificationService.getScheduledNotifications();
      setScheduledCount(scheduled.length);
      toast({
        title: t('notifications_updated'),
        description: t('payment_reminders_rescheduled'),
      });
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
      toast({
        title: t('error'),
        description: t('notification_reschedule_error'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 pb-20 bg-[#192E45] min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('notification_settings')}</h1>
      </div>

      <div className="space-y-6">
        <Card className="bg-[#294D73] border-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Bell size={20} />
              <span>{t('notification_status')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                {hasPermission ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <AlertCircle size={16} className="text-orange-400" />
                )}
                <span className="text-white text-sm">
                  {hasPermission ? t('permission_granted') : t('permission_required')}
                </span>
              </div>
              <Badge variant="outline" className="text-white border-white/30">
                {scheduledCount} {t('scheduled')}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="text-white/70 text-xs">
                {t('notification_schedule_info')}
              </div>
              <ul className="space-y-1 text-white/60 text-xs">
                <li>• {t('three_days_before')}</li>
                <li>• {t('one_day_before')}</li>
                <li>• {t('on_due_date')}</li>
              </ul>
            </div>

            <Button
              onClick={rescheduleNotifications}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              {isLoading ? t('updating') : t('refresh_notifications')}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#294D73] border-none">
          <CardHeader>
            <CardTitle className="text-white text-sm">{t('notification_types')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">{t('monthly_bills')}</div>
                <div className="text-white/60 text-xs">{t('recurring_payment_reminders')}</div>
              </div>
              <Switch
                checked={notifications.monthlyBills}
                onCheckedChange={() => toggleNotification('monthlyBills')}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">{t('loan_payments')}</div>
                <div className="text-white/60 text-xs">{t('loan_credit_reminders')}</div>
              </div>
              <Switch
                checked={notifications.loanPayments}
                onCheckedChange={() => toggleNotification('loanPayments')}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">{t('credit_reminders')}</div>
                <div className="text-white/60 text-xs">{t('credit_card_payment_reminders')}</div>
              </div>
              <Switch
                checked={notifications.creditReminders}
                onCheckedChange={() => toggleNotification('creditReminders')}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">{t('upcoming_payments')}</div>
                <div className="text-white/60 text-xs">{t('all_upcoming_payment_reminders')}</div>
              </div>
              <Switch
                checked={notifications.upcomingPayments}
                onCheckedChange={() => toggleNotification('upcomingPayments')}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">{t('low_balance_alerts')}</div>
                <div className="text-white/60 text-xs">{t('alert_when_balance_low')}</div>
              </div>
              <Switch
                checked={notifications.lowBalanceAlerts}
                onCheckedChange={() => toggleNotification('lowBalanceAlerts')}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">{t('backup_reminders')}</div>
                <div className="text-white/60 text-xs">{t('remind_to_backup_data')}</div>
              </div>
              <Switch
                checked={notifications.backupReminders}
                onCheckedChange={() => toggleNotification('backupReminders')}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettings;
