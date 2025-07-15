
import { LocalNotifications } from '@capacitor/local-notifications';
import { loadFinancialData } from './storageService';
import { isPaymentPaidForMonth } from '@/utils/paymentUtils';

export interface NotificationSchedule {
  id: number;
  title: string;
  body: string;
  scheduleAt: Date;
  data?: any;
}

class NotificationService {
  private notificationId = 1000;

  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const permission = await LocalNotifications.checkPermissions();
      return permission.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  async schedulePaymentReminders(): Promise<void> {
    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        throw new Error('Notification permissions not granted');
      }
    }

    await this.clearAllNotifications();

    const financialData = loadFinancialData();
    if (!financialData) return;

    const notifications: NotificationSchedule[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Schedule notifications for monthly bills
    if (financialData.monthlyBills) {
      for (const bill of financialData.monthlyBills) {
        if (isPaymentPaidForMonth(bill, currentYear, currentMonth)) {
          continue;
        }

        const dueDay = this.extractDueDayFromString(bill.dueDate);
        if (dueDay) {
          const billNotifications = this.createNotificationsForPayment(
            bill.id,
            bill.name,
            bill.amount,
            dueDay,
            currentYear,
            currentMonth
          );
          notifications.push(...billNotifications);
        }
      }
    }

    // Schedule notifications for loan payments
    if (financialData.loans) {
      for (const loan of financialData.loans) {
        if (loan.currentAmount <= 0) continue;

        const dueDay = this.extractDueDayFromString(loan.dueDate);
        if (dueDay) {
          const loanNotifications = this.createNotificationsForPayment(
            `loan-${loan.id}`,
            `${loan.name} (${loan.remaining === 'Credit Card' ? 'Credit Card' : 'Loan'})`,
            loan.monthly,
            dueDay,
            currentYear,
            currentMonth
          );
          notifications.push(...loanNotifications);
        }
      }
    }

    if (notifications.length > 0) {
      await this.scheduleNotifications(notifications);
    }
  }

  private extractDueDayFromString(dueDateString: string): number | null {
    const match = dueDateString.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }

  private createNotificationsForPayment(
    paymentId: string | number,
    name: string,
    amount: number,
    dueDay: number,
    year: number,
    month: number
  ): NotificationSchedule[] {
    const notifications: NotificationSchedule[] = [];
    const now = new Date();
    
    let dueDate = new Date(year, month, dueDay);
    if (dueDate < now) {
      dueDate = new Date(year, month + 1, dueDay);
    }

    // 3-day reminder
    const threeDayReminder = new Date(dueDate);
    threeDayReminder.setDate(dueDate.getDate() - 3);
    threeDayReminder.setHours(10, 0, 0, 0);

    if (threeDayReminder > now) {
      notifications.push({
        id: this.getNextNotificationId(),
        title: '💳 Payment Reminder',
        body: `${name} (€${amount.toFixed(2)}) is due in 3 days`,
        scheduleAt: threeDayReminder,
        data: { paymentId, type: '3-day', dueDate: dueDate.toISOString() }
      });
    }

    // 1-day reminder
    const oneDayReminder = new Date(dueDate);
    oneDayReminder.setDate(dueDate.getDate() - 1);
    oneDayReminder.setHours(18, 0, 0, 0);

    if (oneDayReminder > now) {
      notifications.push({
        id: this.getNextNotificationId(),
        title: '⚠️ Payment Due Tomorrow',
        body: `${name} (€${amount.toFixed(2)}) is due tomorrow`,
        scheduleAt: oneDayReminder,
        data: { paymentId, type: '1-day', dueDate: dueDate.toISOString() }
      });
    }

    // Due date reminder
    const dueDateReminder = new Date(dueDate);
    dueDateReminder.setHours(9, 0, 0, 0);

    if (dueDateReminder > now) {
      notifications.push({
        id: this.getNextNotificationId(),
        title: '🔔 Payment Due Today',
        body: `${name} (€${amount.toFixed(2)}) is due today`,
        scheduleAt: dueDateReminder,
        data: { paymentId, type: 'due-date', dueDate: dueDate.toISOString() }
      });
    }

    return notifications;
  }

  private async scheduleNotifications(notifications: NotificationSchedule[]): Promise<void> {
    try {
      const capacitorNotifications = notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        body: notification.body,
        schedule: {
          at: notification.scheduleAt,
          allowWhileIdle: true
        },
        sound: 'default',
        attachments: [],
        actionTypeId: 'PAYMENT_REMINDER',
        extra: notification.data
      }));

      await LocalNotifications.schedule({
        notifications: capacitorNotifications
      });

      console.log(`Scheduled ${notifications.length} payment reminder notifications`);
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      throw error;
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        const ids = pending.notifications.map(n => n.id);
        await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<any[]> {
    try {
      const pending = await LocalNotifications.getPending();
      return pending.notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  private getNextNotificationId(): number {
    return this.notificationId++;
  }

  async enableNotifications(): Promise<boolean> {
    try {
      const granted = await this.requestPermissions();
      if (granted) {
        await this.schedulePaymentReminders();
        localStorage.setItem('notificationsEnabled', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return false;
    }
  }

  async disableNotifications(): Promise<void> {
    try {
      await this.clearAllNotifications();
      localStorage.setItem('notificationsEnabled', 'false');
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }

  isNotificationsEnabled(): boolean {
    return localStorage.getItem('notificationsEnabled') === 'true';
  }

  async onPaymentDataUpdated(): Promise<void> {
    if (this.isNotificationsEnabled()) {
      await this.schedulePaymentReminders();
    }
  }
}

export const notificationService = new NotificationService();

// Legacy exports for backward compatibility
export const initializeNotifications = () => notificationService.requestPermissions();
export const schedulePaymentNotifications = () => notificationService.schedulePaymentReminders();
export const showNotification = async (title: string, body: string) => {
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
};
