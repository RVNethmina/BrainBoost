import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;



const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [soundEffects, setSoundEffects] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const settings = [
    {
      id: 1,
      icon: '🔊',
      title: 'Sound Effects',
      value: soundEffects,
      action: () => setSoundEffects(!soundEffects),
    },
    {
      id: 2,
      icon: '🎵',
      title: 'Background Music',
      value: backgroundMusic,
      action: () => setBackgroundMusic(!backgroundMusic),
    },
    {
      id: 3,
      icon: '📱',
      title: 'Notifications',
      value: notifications,
      action: () => setNotifications(!notifications),
    },
    {
      id: 4,
      icon: '📝',
      title: 'Text Size',
      value: null,
      action: () => {},
    },
    {
      id: 5,
      icon: '🌍',
      title: 'Language',
      value: null,
      action: () => {},
    },
    {
      id: 6,
      icon: '🔒',
      title: 'Privacy',
      value: null,
      action: () => {},
    },
    {
      id: 7,
      icon: '❓',
      title: 'Help & Support',
      value: null,
      action: () => {},
    },
  ];

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
        <Text className="text-2xl font-bold text-gray-800">Settings</Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-6 space-y-4">
          {settings.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center justify-between p-5 bg-white border shadow-sm rounded-2xl"
              style={{ borderColor: PALETTE.lightTeal }}
              onPress={item.action}
            >
              <View className="flex-row items-center gap-4">
                <Text className="text-2xl">{item.icon}</Text>
                <Text className="text-xl font-semibold">{item.title}</Text>
              </View>
              
              {item.value !== null ? (
                <Switch
                  value={item.value}
                  onValueChange={item.action}
                  trackColor={{ false: PALETTE.lightPink, true: PALETTE.teal }}
                  thumbColor={item.value ? '#fff' : '#fff'}
                />
              ) : (
                <Text className="text-lg text-gray-600">→</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;