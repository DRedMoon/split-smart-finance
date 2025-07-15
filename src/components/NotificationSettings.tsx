
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
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const enabled = notificationService.isNotificationsEnabled();
      const permission = await notificationService.checkPermissions();
      const scheduled = await notificationService.getScheduledNotifications();
      
      setIsEnabled(enabled);
      setHasPermission(permission);
      setScheduledCount(scheduled.length);
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const toggleNotifications = async () => {
    setIsLoading(true);
    try {
      if (isEnabled) {
        await notificationService.disableNotifications();
        setIsEnabled(false);
        setScheduledCount(0);
        toast({
          title: t('notifications_disabled'),
          description: t('payment_reminders_disabled'),
        });
      } else {
        const success = await notificationService.enableNotifications();
        if (success) {
          setIsEnabled(true);
          setHasPermission(true);
          const scheduled = await notificationService.getScheduledNotifications();
          setScheduledCount(scheduled.length);
          toast({
            title: t('notifications_enabled'),
            description: t('payment_reminders_enabled'),
          });
        } else {
          toast({
            title: t('permission_denied'),
            description: t('notification_permission_required'),
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
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
              <span>{t('payment_reminders')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-medium">{t('enable_notifications')}</div>
                <div className="text-white/70 text-sm">{t('get_reminded_about_payments')}</div>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={toggleNotifications}
                disabled={isLoading}
              />
            </div>

            {isEnabled && (
              <>
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
              </>
            )}

            {!isEnabled && (
              <div className="flex items-center space-x-2 pt-4 border-t border-white/10">
                <BellOff size={16} className="text-white/50" />
                <span className="text-white/70 text-sm">{t('notifications_disabled')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#294D73] border-none">
          <CardHeader>
            <CardTitle className="text-white text-sm">{t('notification_types')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">{t('monthly_bills')}</div>
                <div className="text-white/60 text-xs">{t('recurring_payment_reminders')}</div>
              </div>
              <Badge variant="outline" className="text-white border-white/30">
                {t('enabled')}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">{t('loan_payments')}</div>
                <div className="text-white/60 text-xs">{t('loan_credit_reminders')}</div>
              </div>
              <Badge variant="outline" className="text-white border-white/30">
                {t('enabled')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettings;
