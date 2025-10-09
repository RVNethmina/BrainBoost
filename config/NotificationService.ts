// config/NotificationService.ts
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

interface ReminderSettings {
  enabled: boolean;
  time: string;
  days: string[];
}

export class NotificationService {
  private static STORAGE_KEY = 'reminder_settings';
  private static notificationIds: string[] = [];

  static async initialize() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive updates.',
          [{ text: 'OK' }]
        );
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Daily Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4ECDC4',
          sound: 'default',
          enableLights: true,
          enableVibrate: true,
        });
      }

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  static async sendLocalNotification(title: string, body: string) {
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  static async testNotification() {
    return this.sendLocalNotification(
      '✨ Test Reminder',
      'Your reminders are working perfectly!'
    );
  }

  // Save reminder settings
  static async saveReminderSettings(settings: ReminderSettings) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      console.log('✅ Reminder settings saved:', settings);
      return true;
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      return false;
    }
  }

  // Load reminder settings
  static async loadReminderSettings(): Promise<ReminderSettings | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error loading reminder settings:', error);
      return null;
    }
  }

  // Schedule daily reminders
  static async scheduleDailyReminders(time: string, days: string[]) {
    try {
      // Cancel existing reminders
      await this.cancelAllReminders();

      if (days.length === 0) {
        console.log('No days selected, skipping scheduling');
        return [];
      }

      const [hours, minutes] = time.split(':').map(Number);
      const dayMap: { [key: string]: number } = {
        'Sun': 1,
        'Mon': 2,
        'Tue': 3,
        'Wed': 4,
        'Thu': 5,
        'Fri': 6,
        'Sat': 7,
      };

      const scheduledIds: string[] = [];

      for (const day of days) {
        const weekday = dayMap[day];
        
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '🧠 Brain Boost Time!',
            body: 'Time for your daily learning session. Keep your mind sharp! 💪',
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { type: 'daily_reminder', day },
          },
          trigger: {
            hour: hours,
            minute: minutes,
            weekday: weekday,
            repeats: true,
          },
        });

        scheduledIds.push(id);
        console.log(`✅ Scheduled reminder for ${day} at ${time}`);
      }

      this.notificationIds = scheduledIds;
      return scheduledIds;
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      return [];
    }
  }

  // Cancel all scheduled reminders
  static async cancelAllReminders() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationIds = [];
      console.log('🗑️ All reminders cancelled');
      return true;
    } catch (error) {
      console.error('Error cancelling reminders:', error);
      return false;
    }
  }

  // Get all scheduled notifications
  static async getAllScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}