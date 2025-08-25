import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type ReminderScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Reminder'
>;



const ReminderScreen = () => {
  const navigation = useNavigation<ReminderScreenNavigationProp>();
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Fri']);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-10 pb-4" style={{ backgroundColor: PALETTE.lightPink }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Reminders</Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Daily Reminder */}
        <View className="p-5 mt-6 bg-white border shadow-sm rounded-2xl" style={{ borderColor: PALETTE.lightTeal }}>
          <Text className="mb-3 text-4xl text-center">⏰</Text>
          <Text className="mb-4 text-2xl font-bold text-center">Daily Reminder</Text>
          
          <View className="flex-row justify-center gap-4 mb-4">
            <TouchableOpacity 
              className={`px-6 py-3 rounded-full ${dailyReminder ? '' : 'opacity-50'}`}
              style={{ backgroundColor: dailyReminder ? PALETTE.teal : PALETTE.lightTeal }}
              onPress={() => setDailyReminder(true)}
            >
              <Text className="text-lg font-semibold text-white">On</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`px-6 py-3 rounded-full ${!dailyReminder ? '' : 'opacity-50'}`}
              style={{ backgroundColor: !dailyReminder ? PALETTE.red : PALETTE.lightPink }}
              onPress={() => setDailyReminder(false)}
            >
              <Text className="text-lg font-semibold text-white">Off</Text>
            </TouchableOpacity>
          </View>
          
          <View className="items-center">
            <Text className="mb-2 text-lg font-semibold">Reminder Time</Text>
            <View className="px-5 py-3 border rounded-xl" style={{ borderColor: PALETTE.teal }}>
              <Text className="text-xl">{reminderTime}</Text>
            </View>
          </View>
        </View>

        {/* Days Selection */}
        <View className="p-5 mt-6 bg-white border shadow-sm rounded-2xl" style={{ borderColor: PALETTE.lightTeal }}>
          <Text className="mb-3 text-4xl text-center">📅</Text>
          <Text className="mb-4 text-2xl font-bold text-center">Days</Text>
          
          <View className="grid grid-cols-4 gap-2">
            {days.map(day => (
              <TouchableOpacity
                key={day}
                className={`py-3 rounded-lg ${selectedDays.includes(day) ? '' : 'opacity-60'}`}
                style={{ backgroundColor: selectedDays.includes(day) ? PALETTE.teal : PALETTE.lightTeal }}
                onPress={() => toggleDay(day)}
              >
                <Text className="font-semibold text-center text-white">{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="p-5">
        <TouchableOpacity 
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.teal }}
        >
          <Text className="mr-2 text-2xl">✅</Text>
          <Text className="text-xl font-semibold text-white">Save Reminders</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReminderScreen;