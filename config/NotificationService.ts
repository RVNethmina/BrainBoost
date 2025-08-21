// config/NotificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// Configure notification behavior - must be at the top level
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});


export class NotificationService {
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
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
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
        content: { title, body, sound: 'default', priority: Notifications.AndroidNotificationPriority.HIGH },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  static async testNotification() {
    return this.sendLocalNotification('Test Notification', 'This is a test notification.');
  }
}
