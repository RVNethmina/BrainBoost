// app/src/screens/Games/Attention/AttentionAssessmentIntro.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '@/app/contexts/SettingsContext'; // Add this import

type AttentionAssessmentIntroNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AttentionAssessmentIntro'
>;

const AttentionAssessmentIntro: React.FC = () => {
  const navigation = useNavigation<AttentionAssessmentIntroNavigationProp>();
  // Add settings hook
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';
  
  const [hasReadInstructions, setHasReadInstructions] = useState(false);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : PALETTE.lightPink;
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const headerBg = isDark ? '#2a2a2a' : PALETTE.teal;
  const cardBg = isDark ? '#2a2a2a' : '#FFFFFF';
  const secondaryTextColor = isDark ? '#ccc' : PALETTE.gray;
  const lightCardBg = isDark ? '#3a3a3a' : PALETTE.lightTeal;
  const warningBg = isDark ? '#4a3a00' : '#FEF3C7';
  const infoBg = isDark ? '#2a3a4a' : '#F0F9FF';
  const consentBg = isDark ? '#4a2a2a' : '#FEF2F2';

  const handleStartAssessment = () => {
    if (!hasReadInstructions) {
      Alert.alert(
        'Please Review Instructions',
        'Please read through all instructions carefully before starting the assessment.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Start Attention Assessment?',
      'This assessment cannot be paused once started. Make sure you are in a quiet environment and ready to focus for the next 10-12 minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Assessment',
          onPress: () => navigation.navigate('AttentionAssessmentRun' as any),
        },
      ]
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pt-12 pb-6"
        style={{ backgroundColor: headerBg }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-14 h-14 rounded-xl"
          style={{ backgroundColor: isDark ? '#3a3a3a' : '#FFFFFF' }}
        >
          <Text className="text-3xl" style={{ color: isDark ? '#fff' : PALETTE.teal }}>←</Text>
        </TouchableOpacity>
        <Text 
          className="text-3xl font-bold"
          style={{ 
            fontSize: 32 * fontScale,
            color: '#FFFFFF' 
          }}
        >
          Attention Assessment
        </Text>
        <View className="w-14" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center my-8">
          <View
            className="items-center justify-center w-40 h-40 mb-6 rounded-full"
            style={{ backgroundColor: PALETTE.teal }}
          >
            <Text className="text-7xl">🎯</Text>
          </View>
          <Text 
            className="mb-4 text-4xl font-bold" 
            style={{ 
              fontSize: 36 * fontScale,
              color: textColor 
            }}
          >
            Attention Assessment
          </Text>
          <Text 
            className="mb-8 text-2xl text-center" 
            style={{ 
              fontSize: 24 * fontScale,
              color: textColor 
            }}
          >
            Measure your focus & concentration
          </Text>
        </View>

        <View
          className="p-6 mb-8 rounded-3xl"
          style={{ 
            backgroundColor: cardBg, 
            elevation: 5, 
            shadowColor: '#000', 
            shadowOpacity: isDark ? 0.3 : 0.1, 
            shadowRadius: 10 
          }}
        >
          <Text 
            className="mb-6 text-3xl font-bold text-center" 
            style={{ 
              fontSize: 32 * fontScale,
              color: PALETTE.teal 
            }}
          >
            Assessment Overview
          </Text>

          <View 
            className="p-4 mb-6 rounded-2xl" 
            style={{ backgroundColor: warningBg }}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <Text className="text-2xl">⏱️</Text>
              <Text 
                className="text-lg font-semibold"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: isDark ? '#fff' : PALETTE.darkGray 
                }}
              >
                Duration: 10-12 minutes
              </Text>
            </View>
            <View className="flex-row items-center gap-3 mb-3">
              <Text className="text-2xl">🎯</Text>
              <Text 
                className="text-lg font-semibold"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: isDark ? '#fff' : PALETTE.darkGray 
                }}
              >
                Tasks: 3 different attention tests
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">📊</Text>
              <Text 
                className="text-lg font-semibold"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: isDark ? '#fff' : PALETTE.darkGray 
                }}
              >
                Measures: Speed, accuracy, sustained focus
              </Text>
            </View>
          </View>

          <Text 
            className="mb-4 text-2xl font-bold" 
            style={{ 
              fontSize: 24 * fontScale,
              color: PALETTE.teal 
            }}
          >
            What to Expect
          </Text>

          <View className="mb-6 space-y-4">
            <View 
              className="p-4 rounded-2xl" 
              style={{ backgroundColor: lightCardBg }}
            >
              <Text 
                className="mb-2 text-lg font-semibold" 
                style={{ 
                  fontSize: 18 * fontScale,
                  color: PALETTE.teal 
                }}
              >
                Task 1: Visual Search (4 minutes)
              </Text>
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                Find specific symbols among distractors. This measures selective attention and visual processing speed.
              </Text>
            </View>

            <View 
              className="p-4 rounded-2xl" 
              style={{ backgroundColor: isDark ? '#4a3a2a' : '#FFEDCC' }}
            >
              <Text 
                className="mb-2 text-lg font-semibold" 
                style={{ 
                  fontSize: 18 * fontScale,
                  color: PALETTE.orange 
                }}
              >
                Task 2: Sustained Focus (4 minutes)
              </Text>
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                Maintain attention over time while responding to target stimuli. This tests concentration endurance.
              </Text>
            </View>

            <View 
              className="p-4 rounded-2xl" 
              style={{ backgroundColor: isDark ? '#4a2a2a' : '#FFE0E0' }}
            >
              <Text 
                className="mb-2 text-lg font-semibold" 
                style={{ 
                  fontSize: 18 * fontScale,
                  color: PALETTE.red 
                }}
              >
                Task 3: Divided Attention (3 minutes)
              </Text>
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                Track multiple targets simultaneously. This evaluates your ability to split focus effectively.
              </Text>
            </View>
          </View>

          <Text 
            className="mb-4 text-2xl font-bold" 
            style={{ 
              fontSize: 24 * fontScale,
              color: PALETTE.teal 
            }}
          >
            Important Instructions
          </Text>

          <View className="mb-6 space-y-3">
            <View className="flex-row items-start gap-3">
              <Text 
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >•</Text>
              <Text 
                className="flex-1"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                <Text className="font-semibold">Work as quickly and accurately as possible.</Text> Speed and precision are both important.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text 
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >•</Text>
              <Text 
                className="flex-1"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                <Text className="font-semibold">Cannot be paused or restarted.</Text> Complete the entire assessment in one session.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text 
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >•</Text>
              <Text 
                className="flex-1"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                <Text className="font-semibold">Sit in a quiet environment.</Text> Minimize distractions for accurate results.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text 
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >•</Text>
              <Text 
                className="flex-1"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                <Text className="font-semibold">Use your dominant hand.</Text> Hold the device comfortably for quick tapping.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text 
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >•</Text>
              <Text 
                className="flex-1"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                <Text className="font-semibold">Don't guess.</Text> Only tap when you're confident you see a target.
              </Text>
            </View>
          </View>

          <View 
            className="p-4 mb-6 rounded-2xl" 
            style={{ backgroundColor: infoBg }}
          >
            <Text 
              className="mb-3 text-lg font-semibold" 
              style={{ 
                fontSize: 18 * fontScale,
                color: PALETTE.teal 
              }}
            >
              Assessment Results Will Include:
            </Text>
            <View className="space-y-2">
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }}
              >• Overall attention score (0-100)</Text>
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }}
              >• Reaction time analysis</Text>
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }}
              >• Accuracy percentage</Text>
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }}
              >• Sustained attention rating</Text>
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }}
              >• Comparison with age group norms</Text>
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }}
              >• Personalized recommendations</Text>
            </View>
          </View>

          {/* Consent and Ready Check */}
          <View 
            className="p-4 mb-6 rounded-2xl" 
            style={{ backgroundColor: consentBg }}
          >
            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() => setHasReadInstructions(!hasReadInstructions)}
            >
              <View
                className="items-center justify-center w-6 h-6 rounded border-2"
                style={{
                  borderColor: hasReadInstructions ? PALETTE.teal : (isDark ? '#666' : '#9CA3AF'),
                  backgroundColor: hasReadInstructions ? PALETTE.teal : 'transparent',
                }}
              >
                {hasReadInstructions && (
                  <Text className="text-white text-sm">✓</Text>
                )}
              </View>
              <Text 
                className="flex-1 text-lg"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                I have read and understood all instructions for this attention assessment
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-6 mb-10 rounded-3xl"
          style={{ 
            backgroundColor: hasReadInstructions ? PALETTE.teal : (isDark ? '#3a3a3a' : '#CCCCCC'),
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: isDark ? 0.4 : 0.2,
            shadowRadius: 5
          }}
          onPress={handleStartAssessment}
          disabled={!hasReadInstructions}
        >
          <Text className="mr-3 text-3xl">🎯</Text>
          <Text 
            className="text-2xl font-semibold text-white"
            style={{ fontSize: 24 * fontScale }}
          >
            Begin Assessment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AttentionAssessmentIntro;