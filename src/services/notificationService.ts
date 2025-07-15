
import { LocalNotifications } from '@capacitor/local-notifications';
import { toast } from '@/hooks/use-toast';

export const initializeNotifications = async (): Promise<boolean> => {
  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    toast({
      title: "Notification Error",
      description: "Failed to initialize notifications. Please check your settings.",
      variant: "destructive",
    });
    return false;
  }
};

export const schedulePaymentNotifications = async (payments: Array<{ name: string; amount: number; dueDate: string }>) => {
  try {
    // Clear existing notifications
    await LocalNotifications.cancel({ notifications: [] });

    const notifications = payments.map((payment, index) => ({
      title: 'Maksu erääntyy pian',
      body: `${payment.name}: €${payment.amount} erääntyy ${payment.dueDate}`,
      id: index + 1,
      schedule: { at: new Date(Date.now() + (index + 1) * 1000 * 60 * 60 * 24) }, // Schedule for next few days
      sound: 'default',
      actionTypeId: '',
      extra: null
    }));

    await LocalNotifications.schedule({ notifications });
  } catch (error) {
    toast({
      title: "Notification Error",
      description: "Failed to schedule notifications. Please try again.",
      variant: "destructive",
    });
  }
};

export const showNotification = async (title: string, body: string) => {
  try {
    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 1000) },
        sound: 'default',
        actionTypeId: '',
        extra: null
      }]
    });
  } catch (error) {
    toast({
      title: "Notification Error",
      description: "Failed to show notification. Please check your settings.",
      variant: "destructive",
    });
  }
};
