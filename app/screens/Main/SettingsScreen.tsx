import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { NotificationService } from "../../../config/NotificationService";
import { useSettings, TextSize, Theme } from "../../contexts/SettingsContext";

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Settings"
>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const {
    backgroundMusic,
    notifications,
    textSize,
    theme,
    setBackgroundMusic,
    setNotifications,
    setTextSize,
    setTheme,
    getFontScale,
  } = useSettings();

  // Modal states
  const [showTextSizeModal, setShowTextSizeModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleBackgroundMusicToggle = async () => {
    await setBackgroundMusic(!backgroundMusic);
  };

  const handleNotificationsToggle = async () => {
    const newValue = !notifications;

    if (newValue) {
      const hasPermission = await NotificationService.initialize();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive reminders for brain training.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }

    await setNotifications(newValue);

    if (newValue) {
      await NotificationService.sendLocalNotification(
        "Notifications Enabled",
        "You will now receive reminders for your brain training exercises!"
      );
    }
  };

  const handleTextSizeChange = async (size: TextSize) => {
    setShowThemeModal(false);
setTimeout(async () => {
  await setTextSize(size);
  Alert.alert('Text Size Changed', `Text size has been set to ${size}. This will apply throughout the app.`);
}, 400);

  };

  const handleThemeChange = async (selectedTheme: Theme) => {
  setShowThemeModal(false); // close modal first
  setTimeout(async () => {
    await setTheme(selectedTheme); // apply theme after modal fully closes
    Alert.alert(
      'Theme Changed',
      `Theme has been changed to ${selectedTheme} mode.`
    );
  }, 400);
};


  const fontScale = getFontScale();
  const isDark = theme === "dark";

  // Theme colors
  const bgColor = isDark ? "#1a1a1a" : "#fff";
  const textColor = isDark ? "#fff" : PALETTE.darkGray;
  const cardBg = isDark ? "#2a2a2a" : "#fff";
  const headerBg = isDark ? "#2a2a2a" : PALETTE.lightPink;

  const settings = [
    {
      id: 1,
      icon: "🎵",
      title: "Background Music",
      subtitle: "Play calming music during games",
      value: backgroundMusic,
      action: handleBackgroundMusicToggle,
      type: "toggle",
    },
    {
      id: 2,
      icon: "📱",
      title: "Notifications",
      subtitle: "Receive reminders for brain training",
      value: notifications,
      action: handleNotificationsToggle,
      type: "toggle",
    },
    {
      id: 3,
      icon: "📝",
      title: "Text Size",
      subtitle: `Current: ${textSize}`,
      value: null,
      action: () => setShowTextSizeModal(true),
      type: "navigate",
    },
    {
      id: 4,
      icon: "🌓",
      title: "Theme",
      subtitle: `Current: ${theme} mode`,
      value: null,
      action: () => setShowThemeModal(true),
      type: "navigate",
    },
    {
      id: 5,
      icon: "🔒",
      title: "Privacy",
      subtitle: "Data usage and privacy policy",
      value: null,
      action: () => setShowPrivacyModal(true),
      type: "navigate",
    },
    {
      id: 6,
      icon: "❓",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      value: null,
      action: () => setShowHelpModal(true),
      type: "navigate",
    },
  ];

  const TextSizeModal = () => (
    <Modal
      visible={showTextSizeModal}
      transparent={true}
      animationType="slide"
      presentationStyle="overFullScreen"
  statusBarTranslucent
      onRequestClose={() => setShowTextSizeModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="rounded-3xl p-6 w-[85%] max-w-md"
          style={{ backgroundColor: cardBg }}
        >
          <Text
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: textColor }}
          >
            Choose Text Size
          </Text>

          {(["small", "medium", "large", "extra-large"] as TextSize[]).map(
            (size) => (
              <TouchableOpacity
                key={size}
                className="p-5 mb-3 rounded-2xl"
                style={{
                  backgroundColor:
                    textSize === size ? PALETTE.lightTeal : PALETTE.lightPink,
                  borderWidth: 2,
                  borderColor: textSize === size ? PALETTE.teal : "transparent",
                }}
                onPress={() => handleTextSizeChange(size)}
              >
                <Text
                  className="font-semibold"
                  style={{
                    fontSize:
                      size === "small"
                        ? 14
                        : size === "medium"
                          ? 18
                          : size === "large"
                            ? 22
                            : 26,
                    color: PALETTE.darkGray,
                  }}
                >
                  {size.charAt(0).toUpperCase() +
                    size.slice(1).replace("-", " ")}{" "}
                  Text
                </Text>
              </TouchableOpacity>
            )
          )}

          <TouchableOpacity
            className="mt-4 p-4 rounded-xl"
            style={{ backgroundColor: PALETTE.teal }}
            onPress={() => setShowTextSizeModal(false)}
          >
            <Text className="text-white text-center text-lg font-bold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ThemeModal = () => (
    <Modal
      visible={showThemeModal}
      transparent={true}
      animationType="slide"
      presentationStyle="overFullScreen"
  statusBarTranslucent
      onRequestClose={() => setShowThemeModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="rounded-3xl p-6 w-[85%] max-w-md"
          style={{ backgroundColor: cardBg }}
        >
          <Text
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: textColor }}
          >
            Choose Theme
          </Text>

          <TouchableOpacity
            className="p-6 mb-3 rounded-2xl flex-row items-center"
            style={{
              backgroundColor:
                theme === "light" ? PALETTE.lightTeal : PALETTE.lightPink,
              borderWidth: 2,
              borderColor: theme === "light" ? PALETTE.teal : "transparent",
            }}
            onPress={() => handleThemeChange("light")}
          >
            <Text className="text-3xl mr-4">☀️</Text>
            <View>
              <Text
                className="text-xl font-bold"
                style={{ color: PALETTE.darkGray }}
              >
                Light Mode
              </Text>
              <Text className="text-sm" style={{ color: PALETTE.gray }}>
                Bright and clear
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-6 mb-3 rounded-2xl flex-row items-center"
            style={{
              backgroundColor:
                theme === "dark" ? PALETTE.lightTeal : PALETTE.lightPink,
              borderWidth: 2,
              borderColor: theme === "dark" ? PALETTE.teal : "transparent",
            }}
            onPress={() => handleThemeChange("dark")}
          >
            <Text className="text-3xl mr-4">🌙</Text>
            <View>
              <Text
                className="text-xl font-bold"
                style={{ color: PALETTE.darkGray }}
              >
                Dark Mode
              </Text>
              <Text className="text-sm" style={{ color: PALETTE.gray }}>
                Easy on the eyes
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 p-4 rounded-xl"
            style={{ backgroundColor: PALETTE.teal }}
            onPress={() => setShowThemeModal(false)}
          >
            <Text className="text-white text-center text-lg font-bold">
              Cancel
            </Text>
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
      presentationStyle="overFullScreen"
  statusBarTranslucent
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="rounded-3xl p-6 w-[90%] max-w-md max-h-[80%]"
          style={{ backgroundColor: cardBg }}
        >
          <Text
            className="font-bold mb-4 text-center"
            style={{ fontSize: 22 * fontScale, color: textColor }}
          >
            Privacy & Data
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            <View className="mb-4">
              <Text
                className="font-bold mb-2"
                style={{ fontSize: 18 * fontScale, color: PALETTE.teal }}
              >
                📊 Data We Collect
              </Text>
              <Text
                className="leading-6 mb-3"
                style={{ fontSize: 16 * fontScale, color: textColor }}
              >
                • Game scores and assessment results{"\n"}• Usage patterns and
                progress tracking{"\n"}• Account information (email, name){"\n"}
                • Device information for optimization
              </Text>
            </View>

            <View className="mb-4">
              <Text
                className="font-bold mb-2"
                style={{ fontSize: 18 * fontScale, color: PALETTE.teal }}
              >
                🔒 How We Protect Your Data
              </Text>
              <Text
                className="leading-6 mb-3"
                style={{ fontSize: 16 * fontScale, color: textColor }}
              >
                • All data is encrypted and stored securely{"\n"}• We never
                share your personal information{"\n"}• Your health data remains
                confidential{"\n"}• Compliant with data protection regulations
              </Text>
            </View>

            <View className="mb-4">
              <Text
                className="font-bold mb-2"
                style={{ fontSize: 18 * fontScale, color: PALETTE.teal }}
              >
                👤 Your Rights
              </Text>
              <Text
                className="leading-6"
                style={{ fontSize: 16 * fontScale, color: textColor }}
              >
                • Access your data anytime{"\n"}• Request data deletion{"\n"}•
                Export your progress reports{"\n"}• Opt-out of data collection
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            className="p-4 rounded-xl"
            style={{ backgroundColor: PALETTE.teal }}
            onPress={() => setShowPrivacyModal(false)}
          >
            <Text
              className="text-white text-center font-bold"
              style={{ fontSize: 18 * fontScale }}
            >
              Close
            </Text>
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
      presentationStyle="overFullScreen"
  statusBarTranslucent
      onRequestClose={() => setShowHelpModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="rounded-3xl p-6 w-[90%] max-w-md max-h-[80%]"
          style={{ backgroundColor: cardBg }}
        >
          <Text
            className="font-bold mb-4 text-center"
            style={{ fontSize: 22 * fontScale, color: textColor }}
          >
            Help & Support
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            <View className="mb-6">
              <Text
                className="font-bold mb-3"
                style={{ fontSize: 18 * fontScale, color: PALETTE.teal }}
              >
                📚 Getting Started
              </Text>
              <Text
                className="leading-6 mb-2"
                style={{ fontSize: 16 * fontScale, color: textColor }}
              >
                <Text className="font-bold">Brain Games:</Text> Fun exercises to
                improve memory, attention, and cognitive skills.
              </Text>
              <Text
                className="leading-6 mb-2"
                style={{ fontSize: 16 * fontScale, color: textColor }}
              >
                <Text className="font-bold">Assessments:</Text> Track your
                cognitive progress with formal tests.
              </Text>
              <Text
                className="leading-6 mb-4"
                style={{ fontSize: 16 * fontScale, color: textColor }}
              >
                <Text className="font-bold">Progress:</Text> View detailed
                statistics and improvement over time.
              </Text>
            </View>

            <View className="mb-6">
              <Text
                className="font-bold mb-3"
                style={{ fontSize: 18 * fontScale, color: PALETTE.teal }}
              >
                💡 Tips for Best Results
              </Text>
              <Text
                className="leading-6"
                style={{ fontSize: 16 * fontScale, color: textColor }}
              >
                • Practice daily for 15-20 minutes{"\n"}• Choose a quiet,
                comfortable space{"\n"}• Take breaks when feeling tired{"\n"}•
                Track your progress regularly{"\n"}• Share results with your
                caregiver
              </Text>
            </View>

            <View className="mb-4">
              <Text
                className="font-bold mb-3"
                style={{ fontSize: 18 * fontScale, color: PALETTE.teal }}
              >
                📞 Contact Support
              </Text>
              <TouchableOpacity
                className="p-4 mb-2 rounded-xl"
                style={{ backgroundColor: PALETTE.lightTeal }}
                onPress={() => Linking.openURL("mailto:support@brainboost.com")}
              >
                <Text
                  className="font-semibold"
                  style={{ fontSize: 16 * fontScale, color: PALETTE.darkGray }}
                >
                  ✉️ Email: support@brainboost.com
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="p-4 rounded-xl"
                style={{ backgroundColor: PALETTE.lightTeal }}
                onPress={() => {
                  Alert.alert(
                    "Feedback",
                    "Would you like to send feedback about BrainBoost?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Send Feedback",
                        onPress: () =>
                          Linking.openURL(
                            "mailto:support@brainboost.com?subject=App Feedback"
                          ),
                      },
                    ]
                  );
                }}
              >
                <Text
                  className="font-semibold"
                  style={{ fontSize: 16 * fontScale, color: PALETTE.darkGray }}
                >
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
            <Text
              className="text-white text-center font-bold"
              style={{ fontSize: 18 * fontScale }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pt-10 pb-4"
        style={{ backgroundColor: headerBg }}
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
        <Text
          className="font-bold"
          style={{ fontSize: 24 * fontScale, color: textColor }}
        >
          Settings
        </Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-6 space-y-4">
          {settings.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center justify-between p-5 border-2 shadow-sm rounded-2xl"
              style={{
                backgroundColor: cardBg,
                borderColor: PALETTE.lightTeal,
              }}
              onPress={item.action}
              accessible={true}
              accessibilityLabel={`${item.title}. ${item.subtitle || ""}`}
              accessibilityRole="button"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-3 mb-1">
                  <Text className="text-2xl">{item.icon}</Text>
                  <Text
                    className="font-semibold"
                    style={{ fontSize: 20 * fontScale, color: textColor }}
                  >
                    {item.title}
                  </Text>
                </View>
                {item.subtitle && (
                  <Text
                    className="ml-11"
                    style={{
                      fontSize: 14 * fontScale,
                      color: isDark ? "#aaa" : PALETTE.gray,
                    }}
                  >
                    {item.subtitle}
                  </Text>
                )}
              </View>

              {item.type === "toggle" ? (
                <Switch
                  value={item.value as boolean}
                  onValueChange={item.action}
                  trackColor={{ false: PALETTE.lightPink, true: PALETTE.teal }}
                  thumbColor="#fff"
                  accessible={true}
                  accessibilityLabel={`Toggle ${item.title}`}
                />
              ) : (
                <Text className="text-2xl" style={{ color: PALETTE.teal }}>
                  ›
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View className="items-center py-8 mt-6">
          <Text
            style={{
              fontSize: 14 * fontScale,
              color: isDark ? "#aaa" : PALETTE.gray,
            }}
          >
            BrainBoost v1.0.0
          </Text>
          <Text
            className="mt-1"
            style={{
              fontSize: 12 * fontScale,
              color: isDark ? "#aaa" : PALETTE.gray,
            }}
          >
            Cognitive Training for Healthy Aging
          </Text>
        </View>
      </ScrollView>

      
      
    </View>

    {/* Modals */}
      {showTextSizeModal && <TextSizeModal />}
      {showThemeModal && <ThemeModal />}
      {showPrivacyModal && <PrivacyModal />}
      {showHelpModal && <HelpModal />}
    </>
  );
};

export default SettingsScreen;
