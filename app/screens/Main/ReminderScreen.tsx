// app/src/screens/Main/ReminderScreen.tsx
import TimePicker from '@/app/components/TimePicker';
import { useSettings } from '@/app/contexts/SettingsContext';
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { NotificationService } from '@/config/NotificationService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ReminderScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Reminder'
>;

const ReminderScreen = () => {
  const navigation = useNavigation<ReminderScreenNavigationProp>();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dynamic colors
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : '#2C3E3E';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
  const borderColor = isDark ? '#3a3a3a' : PALETTE.lightTeal;

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    const initialized = await NotificationService.initialize();
    if (!initialized) {
      Alert.alert(
        'Notifications Required',
        'Please enable notifications to use reminders.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await NotificationService.loadReminderSettings();
      if (settings) {
        setDailyReminder(settings.enabled);
        setReminderTime(settings.time);
        setSelectedDays(settings.days);
        console.log('✅ Loaded settings:', settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async () => {
    if (selectedDays.length === 0 && dailyReminder) {
      Alert.alert('No Days Selected', 'Please select at least one day for reminders.');
      return;
    }

    setSaving(true);
    try {
      // Save settings
      const settings = {
        enabled: dailyReminder,
        time: reminderTime,
        days: selectedDays,
      };
      
      await NotificationService.saveReminderSettings(settings);

      // Schedule or cancel notifications
      if (dailyReminder) {
        const scheduled = await NotificationService.scheduleDailyReminders(
          reminderTime,
          selectedDays
        );
        
        if (scheduled.length > 0) {
          // Verify the scheduled notifications
          const verification = await NotificationService.verifyScheduledNotifications();
          
          Alert.alert(
            '✅ Reminders Saved!',
            `Your reminders are set for ${reminderTime} on:\n${selectedDays.join(', ')}\n\nScheduled: ${verification?.actualCount} notifications`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            '⚠️ Warning',
            'No reminders were scheduled. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } else {
        await NotificationService.cancelAllReminders();
        Alert.alert(
          '🔕 Reminders Disabled',
          'All reminders have been turned off.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error saving reminders:', error);
      Alert.alert('Error', 'Failed to save reminders. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    await NotificationService.testNotification();
  };

  const handleDebug = async () => {
    const verification = await NotificationService.verifyScheduledNotifications();
    if (verification) {
      Alert.alert(
        '🐛 Debug Info',
        `Saved IDs: ${verification.savedCount}\nActually Scheduled: ${verification.actualCount}\n\nNotifications:\n${JSON.stringify(verification.notifications.map(n => ({
          id: n.identifier,
          trigger: n.trigger
        })), null, 2)}`,
        [{ text: 'OK' }]
      );
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PALETTE.teal} />
        <Text style={[{ color: textColor, marginTop: 16, fontSize: 16 * fontScale }]}>
          Loading reminders...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: PALETTE.lightTeal }]}
        >
          <Text style={{ fontSize: 24 * fontScale }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: 24 * fontScale, color: textColor }]}>
          Reminders
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity 
            onPress={handleTestNotification}
            style={[styles.backButton, { backgroundColor: PALETTE.teal }]}
          >
            <Text style={{ fontSize: 20 * fontScale }}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDebug}
            style={[styles.backButton, { backgroundColor: PALETTE.lightPink }]}
          >
            <Text style={{ fontSize: 18 * fontScale }}>🐛</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Reminder */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={styles.emoji}>⏰</Text>
          <Text style={[styles.cardTitle, { fontSize: 24 * fontScale, color: textColor }]}>
            Daily Reminder
          </Text>
          
          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={[
                styles.toggleButton,
                { backgroundColor: dailyReminder ? PALETTE.teal : PALETTE.lightTeal }
              ]}
              onPress={() => setDailyReminder(true)}
            >
              <Text style={[styles.toggleText, { fontSize: 18 * fontScale }]}>On</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.toggleButton,
                { backgroundColor: !dailyReminder ? PALETTE.red : PALETTE.lightPink }
              ]}
              onPress={() => setDailyReminder(false)}
            >
              <Text style={[styles.toggleText, { fontSize: 18 * fontScale }]}>Off</Text>
            </TouchableOpacity>
          </View>
          
          {dailyReminder && (
            <View style={styles.timeSection}>
              <Text style={[styles.label, { fontSize: 18 * fontScale, color: textColor }]}>
                Reminder Time
              </Text>
              <TouchableOpacity 
                style={[styles.timeBox, { borderColor: PALETTE.teal }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={[styles.timeText, { fontSize: 20 * fontScale, color: textColor }]}>
                  {reminderTime}
                </Text>
                <Text style={{ fontSize: 16 * fontScale, color: textColor, opacity: 0.6, marginTop: 4 }}>
                  Tap to change
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Days Selection */}
        {dailyReminder && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <Text style={styles.emoji}>📅</Text>
            <Text style={[styles.cardTitle, { fontSize: 24 * fontScale, color: textColor }]}>
              Reminder Days
            </Text>
            <Text style={[styles.subtitle, { fontSize: 14 * fontScale, color: textColor, opacity: 0.7 }]}>
              Select days to receive reminders
            </Text>
            
            <View style={styles.daysGrid}>
              {days.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    { 
                      backgroundColor: selectedDays.includes(day) ? PALETTE.teal : PALETTE.lightTeal,
                      opacity: selectedDays.includes(day) ? 1 : 0.5
                    }
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayText, { fontSize: 16 * fontScale }]}>
                    {day}
                  </Text>
                  {selectedDays.includes(day) && (
                    <Text style={{ fontSize: 16 * fontScale }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedDays.length === 0 && (
              <Text style={[styles.warningText, { fontSize: 14 * fontScale, color: PALETTE.red }]}>
                ⚠️ Please select at least one day
              </Text>
            )}
          </View>
        )}

        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={styles.emoji}>💡</Text>
          <Text style={[styles.infoTitle, { fontSize: 18 * fontScale, color: textColor }]}>
            How Reminders Work
          </Text>
          <Text style={[styles.infoText, { fontSize: 14 * fontScale, color: textColor }]}>
            • You'll receive a notification at your chosen time{'\n'}
            • Only on selected days{'\n'}
            • Make sure notifications are enabled in your device settings{'\n'}
            • Test your reminders using the bell icon 🔔
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { 
              backgroundColor: PALETTE.teal,
              opacity: saving ? 0.6 : 1
            }
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveIcon}>✅</Text>
              <Text style={[styles.saveText, { fontSize: 20 * fontScale }]}>
                Save Reminders
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <TimePicker
        visible={showTimePicker}
        initialTime={reminderTime}
        onClose={() => setShowTimePicker(false)}
        onSelect={setReminderTime}
        isDark={isDark}
        fontScale={fontScale}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    padding: 20,
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '600',
    color: '#fff',
  },
  timeSection: {
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    marginBottom: 12,
  },
  timeBox: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  dayButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dayText: {
    fontWeight: '600',
    color: '#fff',
  },
  warningText: {
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  infoTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  infoText: {
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  saveText: {
    fontWeight: '600',
    color: '#fff',
  },
});

export default ReminderScreen;