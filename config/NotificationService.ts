// config/NotificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

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
  private static SCHEDULED_IDS_KEY = 'scheduled_notification_ids';

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
          showBadge: true,
        });
      }

      console.log('✅ Notifications initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Send immediate test notification
  static async sendLocalNotification(title: string, body: string) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // null means immediate
      });
      console.log('✅ Test notification sent with ID:', id);
      return id;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      Alert.alert('Error', 'Failed to send test notification. Please check your notification permissions.');
      return null;
    }
  }

  static async testNotification() {
    const id = await this.sendLocalNotification(
      '✨ Test Reminder',
      'Your reminders are working perfectly! 🎉'
    );
    if (id) {
      Alert.alert('✅ Success', 'Test notification sent! Check your notification bar.');
    }
    return id;
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
        const settings = JSON.parse(data);
        console.log('✅ Loaded settings:', settings);
        return settings;
      }
      return null;
    } catch (error) {
      console.error('Error loading reminder settings:', error);
      return null;
    }
  }

  // Save scheduled notification IDs
  private static async saveScheduledIds(ids: string[]) {
    try {
      await AsyncStorage.setItem(this.SCHEDULED_IDS_KEY, JSON.stringify(ids));
      console.log('💾 Saved scheduled IDs:', ids);
    } catch (error) {
      console.error('Error saving scheduled IDs:', error);
    }
  }

  // Load scheduled notification IDs
  private static async loadScheduledIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(this.SCHEDULED_IDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading scheduled IDs:', error);
      return [];
    }
  }

  // Schedule daily reminders - FIXED VERSION
  static async scheduleDailyReminders(time: string, days: string[]) {
    try {
      // First, cancel ALL existing reminders
      await this.cancelAllReminders();

      if (days.length === 0) {
        console.log('⚠️ No days selected, skipping scheduling');
        return [];
      }

      const [hours, minutes] = time.split(':').map(Number);
      
      // Validate time
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error('❌ Invalid time format:', time);
        Alert.alert('Error', 'Invalid time format. Please select a valid time.');
        return [];
      }

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

      console.log(`📅 Scheduling reminders for ${time} on days:`, days);

      for (const day of days) {
        const weekday = dayMap[day];
        
        if (!weekday) {
          console.warn(`⚠️ Invalid day: ${day}`);
          continue;
        }

        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: '🧠 Brain Boost Time!',
              body: `Time for your daily learning session. Let's keep your mind sharp! 💪`,
              sound: 'default',
              priority: Notifications.AndroidNotificationPriority.HIGH,
              vibrate: [0, 250, 250, 250],
              data: { 
                type: 'daily_reminder', 
                day,
                scheduledTime: time
              },
            },
            trigger: {
              hour: hours,
              minute: minutes,
              weekday: weekday,
              repeats: true,
            },
          });

          scheduledIds.push(id);
          console.log(`✅ Scheduled reminder for ${day} at ${time}, ID: ${id}`);
        } catch (error) {
          console.error(`❌ Failed to schedule for ${day}:`, error);
        }
      }

      // Save the scheduled IDs
      await this.saveScheduledIds(scheduledIds);

      console.log(`🎯 Total reminders scheduled: ${scheduledIds.length}`);
      return scheduledIds;
    } catch (error) {
      console.error('❌ Error scheduling reminders:', error);
      Alert.alert('Error', 'Failed to schedule reminders. Please try again.');
      return [];
    }
  }

  // Cancel all scheduled reminders
  static async cancelAllReminders() {
    try {
      // Get all scheduled notifications from Expo
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`🗑️ Found ${scheduled.length} scheduled notifications`);

      // Cancel all of them
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Clear saved IDs
      await AsyncStorage.removeItem(this.SCHEDULED_IDS_KEY);
      
      console.log('✅ All reminders cancelled successfully');
      return true;
    } catch (error) {
      console.error('❌ Error cancelling reminders:', error);
      return false;
    }
  }

  // Get all scheduled notifications (for debugging)
  static async getAllScheduledNotifications() {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📋 Scheduled notifications:', scheduled);
      return scheduled;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Check if notifications are properly scheduled
  static async verifyScheduledNotifications() {
    try {
      const scheduled = await this.getAllScheduledNotifications();
      const savedIds = await this.loadScheduledIds();
      
      console.log('🔍 Verification:');
      console.log(`  - Saved IDs: ${savedIds.length}`);
      console.log(`  - Actually scheduled: ${scheduled.length}`);
      
      return {
        savedCount: savedIds.length,
        actualCount: scheduled.length,
        notifications: scheduled
      };
    } catch (error) {
      console.error('Error verifying notifications:', error);
      return null;
    }
  }
}