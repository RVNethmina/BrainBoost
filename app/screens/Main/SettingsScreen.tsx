import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  Switch, 
  Text, 
  TouchableOpacity, 
  View, 
  Modal, 
  Alert,
  Linking 
} from 'react-native';
import { NotificationService } from '../../../config/NotificationService';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

const STORAGE_KEYS = {
  BACKGROUND_MUSIC: '@settings_background_music',
  NOTIFICATIONS: '@settings_notifications',
  TEXT_SIZE: '@settings_text_size',
};

type TextSize = 'small' | 'medium' | 'large' | 'extra-large';

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  
  // State management
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [showTextSizeModal, setShowTextSizeModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedMusic = await AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_MUSIC);
      const savedNotifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const savedTextSize = await AsyncStorage.getItem(STORAGE_KEYS.TEXT_SIZE);

      if (savedMusic !== null) setBackgroundMusic(JSON.parse(savedMusic));
      if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications));
      if (savedTextSize !== null) setTextSize(savedTextSize as TextSize);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleBackgroundMusicToggle = async () => {
    const newValue = !backgroundMusic;
    setBackgroundMusic(newValue);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND_MUSIC, JSON.stringify(newValue));
      // TODO: Implement actual background music playback control
      console.log('Background music:', newValue ? 'ON' : 'OFF');
    } catch (error) {
      console.error('Error saving background music setting:', error);
    }
  };

  const handleNotificationsToggle = async () => {
    const newValue = !notifications;
    
    if (newValue) {
      // Request permission when enabling
      const hasPermission = await NotificationService.initialize();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive reminders for brain training.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
    }
    
    setNotifications(newValue);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newValue));
      
      // Send test notification when enabled
      if (newValue) {
        await NotificationService.sendLocalNotification(
          'Notifications Enabled',
          'You will now receive reminders for your brain training exercises!'
        );
      }
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  const handleTextSizeChange = async (size: TextSize) => {
    setTextSize(size);
    setShowTextSizeModal(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TEXT_SIZE, size);
      Alert.alert(
        'Text Size Changed',
        `Text size has been set to ${size}. This will apply to all screens in the app.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving text size setting:', error);
    }
  };

  const settings = [
    {
      id: 1,
      icon: '🎵',
      title: 'Background Music',
      subtitle: 'Play calming music during games',
      value: backgroundMusic,
      action: handleBackgroundMusicToggle,
      type: 'toggle',
    },
    {
      id: 2,
      icon: '📱',
      title: 'Notifications',
      subtitle: 'Receive reminders for brain training',
      value: notifications,
      action: handleNotificationsToggle,
      type: 'toggle',
    },
    {
      id: 3,
      icon: '📝',
      title: 'Text Size',
      subtitle: `Current: ${textSize}`,
      value: null,
      action: () => setShowTextSizeModal(true),
      type: 'navigate',
    },
    {
      id: 4,
      icon: '🔒',
      title: 'Privacy',
      subtitle: 'Data usage and privacy policy',
      value: null,
      action: () => setShowPrivacyModal(true),
      type: 'navigate',
    },
    {
      id: 5,
      icon: '❓',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      value: null,
      action: () => setShowHelpModal(true),
      type: 'navigate',
    },
  ];

  const TextSizeModal = () => (
    <Modal
      visible={showTextSizeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTextSizeModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-3xl p-6 w-[85%] max-w-md">
          <Text className="text-2xl font-bold mb-6 text-center" style={{ color: PALETTE.darkGray }}>
            Choose Text Size
          </Text>
          
          {(['small', 'medium', 'large', 'extra-large'] as TextSize[]).map((size) => (
            <TouchableOpacity
              key={size}
              className="p-5 mb-3 rounded-2xl"
              style={{ 
                backgroundColor: textSize === size ? PALETTE.lightTeal : PALETTE.lightPink,
                borderWidth: 2,
                borderColor: textSize === size ? PALETTE.teal : 'transparent'
              }}
              onPress={() => handleTextSizeChange(size)}
            >
              <Text 
                className="font-semibold"
                style={{ 
                  fontSize: size === 'small' ? 14 : size === 'medium' ? 18 : size === 'large' ? 22 : 26,
                  color: PALETTE.darkGray 
                }}
              >
                {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')} Text
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            className="mt-4 p-4 rounded-xl"
            style={{ backgroundColor: PALETTE.teal }}
            onPress={() => setShowTextSizeModal(false)}
          >
            <Text className="text-white text-center text-lg font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const PrivacyModal = () => (
    <Modal
      visible={showPrivacyModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-3xl p-6 w-[90%] max-w-md max-h-[80%]">
          <Text className="text-2xl font-bold mb-4 text-center" style={{ color: PALETTE.darkGray }}>
            Privacy & Data
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            <View className="mb-4">
              <Text className="text-lg font-bold mb-2" style={{ color: PALETTE.teal }}>
                📊 Data We Collect
              </Text>
              <Text className="text-base leading-6 mb-3" style={{ color: PALETTE.darkGray }}>
                • Game scores and assessment results{'\n'}
                • Usage patterns and progress tracking{'\n'}
                • Account information (email, name){'\n'}
                • Device information for optimization
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-bold mb-2" style={{ color: PALETTE.teal }}>
                🔒 How We Protect Your Data
              </Text>
              <Text className="text-base leading-6 mb-3" style={{ color: PALETTE.darkGray }}>
                • All data is encrypted and stored securely{'\n'}
                • We never share your personal information{'\n'}
                • Your health data remains confidential{'\n'}
                • Compliant with data protection regulations
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-bold mb-2" style={{ color: PALETTE.teal }}>
                👤 Your Rights
              </Text>
              <Text className="text-base leading-6" style={{ color: PALETTE.darkGray }}>
                • Access your data anytime{'\n'}
                • Request data deletion{'\n'}
                • Export your progress reports{'\n'}
                • Opt-out of data collection
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            className="p-4 rounded-xl"
            style={{ backgroundColor: PALETTE.teal }}
            onPress={() => setShowPrivacyModal(false)}
          >
            <Text className="text-white text-center text-lg font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const HelpModal = () => (
    <Modal
      visible={showHelpModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-3xl p-6 w-[90%] max-w-md max-h-[80%]">
          <Text className="text-2xl font-bold mb-4 text-center" style={{ color: PALETTE.darkGray }}>
            Help & Support
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            <View className="mb-6">
              <Text className="text-lg font-bold mb-3" style={{ color: PALETTE.teal }}>
                📚 Getting Started
              </Text>
              <Text className="text-base leading-6 mb-2" style={{ color: PALETTE.darkGray }}>
                <Text className="font-bold">Brain Games:</Text> Fun exercises to improve memory, attention, and cognitive skills.
              </Text>
              <Text className="text-base leading-6 mb-2" style={{ color: PALETTE.darkGray }}>
                <Text className="font-bold">Assessments:</Text> Track your cognitive progress with formal tests.
              </Text>
              <Text className="text-base leading-6 mb-4" style={{ color: PALETTE.darkGray }}>
                <Text className="font-bold">Progress:</Text> View detailed statistics and improvement over time.
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-bold mb-3" style={{ color: PALETTE.teal }}>
                💡 Tips for Best Results
              </Text>
              <Text className="text-base leading-6" style={{ color: PALETTE.darkGray }}>
                • Practice daily for 15-20 minutes{'\n'}
                • Choose a quiet, comfortable space{'\n'}
                • Take breaks when feeling tired{'\n'}
                • Track your progress regularly{'\n'}
                • Share results with your caregiver
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-lg font-bold mb-3" style={{ color: PALETTE.teal }}>
                📞 Contact Support
              </Text>
              <TouchableOpacity
                className="p-4 mb-2 rounded-xl"
                style={{ backgroundColor: PALETTE.lightTeal }}
                onPress={() => {
                  Linking.openURL('mailto:support@brainboost.com');
                }}
              >
                <Text className="text-base font-semibold" style={{ color: PALETTE.darkGray }}>
                  ✉️ Email: support@brainboost.com
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="p-4 rounded-xl"
                style={{ backgroundColor: PALETTE.lightTeal }}
                onPress={() => {
                  Alert.alert(
                    'Feedback',
                    'Would you like to send feedback about BrainBoost?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Send Feedback', 
                        onPress: () => Linking.openURL('mailto:support@brainboost.com?subject=App Feedback')
                      }
                    ]
                  );
                }}
              >
                <Text className="text-base font-semibold" style={{ color: PALETTE.darkGray }}>
                  💬 Send Feedback
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            className="p-4 rounded-xl"
            style={{ backgroundColor: PALETTE.teal }}
            onPress={() => setShowHelpModal(false)}
          >
            <Text className="text-white text-center text-lg font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-5 pt-10 pb-4" 
        style={{ backgroundColor: PALETTE.lightPink }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
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
              className="flex-row items-center justify-between p-5 bg-white border-2 shadow-sm rounded-2xl"
              style={{ borderColor: PALETTE.lightTeal }}
              onPress={item.action}
              accessible={true}
              accessibilityLabel={`${item.title}. ${item.subtitle || ''}`}
              accessibilityRole="button"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-3 mb-1">
                  <Text className="text-2xl">{item.icon}</Text>
                  <Text className="text-xl font-semibold" style={{ color: PALETTE.darkGray }}>
                    {item.title}
                  </Text>
                </View>
                {item.subtitle && (
                  <Text className="text-sm ml-11" style={{ color: PALETTE.gray }}>
                    {item.subtitle}
                  </Text>
                )}
              </View>
              
              {item.type === 'toggle' ? (
                <Switch
                  value={item.value as boolean}
                  onValueChange={item.action}
                  trackColor={{ false: PALETTE.lightPink, true: PALETTE.teal }}
                  thumbColor="#fff"
                  accessible={true}
                  accessibilityLabel={`Toggle ${item.title}`}
                />
              ) : (
                <Text className="text-2xl" style={{ color: PALETTE.teal }}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View className="items-center py-8 mt-6">
          <Text className="text-sm" style={{ color: PALETTE.gray }}>
            BrainBoost v1.0.0
          </Text>
          <Text className="text-xs mt-1" style={{ color: PALETTE.gray }}>
            Cognitive Training for Healthy Aging
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <TextSizeModal />
      <PrivacyModal />
      <HelpModal />
    </View>
  );
};

export default SettingsScreen;