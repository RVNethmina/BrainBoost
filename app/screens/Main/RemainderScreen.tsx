// app/src/screens/Main/ReminderScreen.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '@/app/contexts/SettingsContext';

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
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Fri']);

  // Dynamic colors
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : '#2C3E3E';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
  const borderColor = isDark ? '#3a3a3a' : PALETTE.lightTeal;

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
        <View style={{ width: 48 }} />
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
          
          <View style={styles.timeSection}>
            <Text style={[styles.label, { fontSize: 18 * fontScale, color: textColor }]}>
              Reminder Time
            </Text>
            <View style={[styles.timeBox, { borderColor: PALETTE.teal }]}>
              <Text style={[styles.timeText, { fontSize: 20 * fontScale, color: textColor }]}>
                {reminderTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Days Selection */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={styles.emoji}>📅</Text>
          <Text style={[styles.cardTitle, { fontSize: 24 * fontScale, color: textColor }]}>
            Days
          </Text>
          
          <View style={styles.daysGrid}>
            {days.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  { 
                    backgroundColor: selectedDays.includes(day) ? PALETTE.teal : PALETTE.lightTeal,
                    opacity: selectedDays.includes(day) ? 1 : 0.6
                  }
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.dayText, { fontSize: 16 * fontScale }]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: PALETTE.teal }]}
        >
          <Text style={styles.saveIcon}>✅</Text>
          <Text style={[styles.saveText, { fontSize: 20 * fontScale }]}>
            Save Reminders
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
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
    marginBottom: 8,
  },
  timeBox: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 12,
  },
  timeText: {},
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  dayText: {
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
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