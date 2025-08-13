import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  data: {
    medicineId: string;
    medicineName: string;
    dosage: string;
    time: string;
    reminderId: string;
    isPersistent?: boolean; // New field to track if reminder should persist
    reminderType?: 'initial' | 'persistent' | 'snooze'; // Track reminder type
  };
  trigger: Notifications.NotificationTriggerInput;
}

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Failed to get push token for push notification!');
      }

      // Note: Push token fetching is commented out since it requires a valid Expo project ID
      // For local notifications only, this is not needed
      // If you need push notifications later, uncomment and set your actual project ID:
      // if (Device.isDevice) {
      //   const token = await Notifications.getExpoPushTokenAsync({
      //     projectId: 'your-actual-project-id',
      //   });
      //   console.log('Push token:', token);
      // }

      // Set notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medication-reminders', {
          name: 'Medication Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  async scheduleReminder(reminder: ReminderNotification): Promise<string> {
    try {
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          data: reminder.data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: reminder.trigger,
      });

      console.log(`Scheduled reminder with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      throw error;
    }
  }

  async cancelReminder(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled reminder with ID: ${notificationId}`);
    } catch (error) {
      console.error('Failed to cancel reminder:', error);
      throw error;
    }
  }

  async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all scheduled reminders');
    } catch (error) {
      console.error('Failed to cancel all reminders:', error);
      throw error;
    }
  }

  async getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled reminders:', error);
      return [];
    }
  }

  async addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Promise<Notifications.Subscription> {
    return Notifications.addNotificationReceivedListener(listener);
  }

  async addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Promise<Notifications.Subscription> {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Helper method to create a reminder notification
  createReminderNotification(
    medicineName: string,
    dosage: string,
    time: string,
    medicineId: string,
    reminderId: string,
    trigger: Notifications.NotificationTriggerInput
  ): ReminderNotification {
    return {
      id: reminderId,
      title: 'Medication Reminder',
      body: `Time to take ${dosage} of ${medicineName}`,
      data: {
        medicineId,
        medicineName,
        dosage,
        time,
        reminderId,
      },
      trigger,
    };
  }

  // Helper method to create daily recurring trigger
  createDailyTrigger(hour: number, minute: number): Notifications.NotificationTriggerInput {
    return {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    };
  }

  // Helper method to create custom interval trigger
  createCustomIntervalTrigger(intervalMs: number): Notifications.NotificationTriggerInput {
    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.floor(intervalMs / 1000),
      repeats: true,
    };
  }

  // Helper method to create a one-time date trigger
  createDateTrigger(date: Date): Notifications.NotificationTriggerInput {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    };
  }

  // Helper method to create a persistent reminder that repeats every 5 minutes
  createPersistentReminder(
    medicineName: string,
    dosage: string,
    time: string,
    medicineId: string,
    reminderId: string
  ): ReminderNotification {
    return {
      id: reminderId,
      title: 'Medication Reminder',
      body: `Time to take ${dosage} of ${medicineName}`,
      data: {
        medicineId,
        medicineName,
        dosage,
        time,
        reminderId,
        isPersistent: true,
        reminderType: 'persistent'
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5 * 60, // 5 minutes
        repeats: true,
      },
    };
  }

  // Helper method to create a snooze reminder
  createSnoozeReminder(
    medicineName: string,
    dosage: string,
    time: string,
    medicineId: string,
    reminderId: string,
    delayMinutes: number
  ): ReminderNotification {
    return {
      id: `${reminderId}_snooze_${Date.now()}`,
      title: 'Medication Reminder (Snoozed)',
      body: `Time to take ${dosage} of ${medicineName}`,
      data: {
        medicineId,
        medicineName,
        dosage,
        time,
        reminderId,
        isPersistent: false,
        reminderType: 'snooze'
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + delayMinutes * 60 * 1000),
      },
    };
  }
}

export default NotificationService.getInstance();
