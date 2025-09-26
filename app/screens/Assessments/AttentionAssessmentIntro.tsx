// app/src/screens/Games/Attention/AttentionAssessmentIntro.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type AttentionAssessmentIntroNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AttentionAssessmentIntro'
>;

const AttentionAssessmentIntro: React.FC = () => {
  const navigation = useNavigation<AttentionAssessmentIntroNavigationProp>();
  const [hasReadInstructions, setHasReadInstructions] = useState(false);

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
    <View className="flex-1" style={{ backgroundColor: PALETTE.lightPink }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pt-12 pb-6"
        style={{ backgroundColor: PALETTE.teal }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-14 h-14 rounded-xl"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Text className="text-3xl" style={{ color: PALETTE.teal }}>←</Text>
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white">Attention Assessment</Text>
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
          <Text className="mb-4 text-4xl font-bold" style={{ color: PALETTE.teal }}>
            Attention Assessment
          </Text>
          <Text className="mb-8 text-2xl text-center" style={{ color: PALETTE.teal }}>
            Measure your focus & concentration
          </Text>
        </View>

        <View
          className="p-6 mb-8 rounded-3xl"
          style={{ backgroundColor: '#FFFFFF', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}
        >
          <Text className="mb-6 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
            Assessment Overview
          </Text>

          <View className="p-4 mb-6 rounded-2xl" style={{ backgroundColor: '#FEF3C7' }}>
            <View className="flex-row items-center gap-3 mb-3">
              <Text className="text-2xl">⏱️</Text>
              <Text className="text-lg font-semibold">Duration: 10-12 minutes</Text>
            </View>
            <View className="flex-row items-center gap-3 mb-3">
              <Text className="text-2xl">🎯</Text>
              <Text className="text-lg font-semibold">Tasks: 3 different attention tests</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">📊</Text>
              <Text className="text-lg font-semibold">Measures: Speed, accuracy, sustained focus</Text>
            </View>
          </View>

          <Text className="mb-4 text-2xl font-bold" style={{ color: PALETTE.teal }}>
            What to Expect
          </Text>

          <View className="mb-6 space-y-4">
            <View className="p-4 rounded-2xl" style={{ backgroundColor: PALETTE.lightTeal }}>
              <Text className="mb-2 text-lg font-semibold" style={{ color: PALETTE.teal }}>
                Task 1: Visual Search (4 minutes)
              </Text>
              <Text className="text-gray-700">
                Find specific symbols among distractors. This measures selective attention and visual processing speed.
              </Text>
            </View>

            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#FFEDCC' }}>
              <Text className="mb-2 text-lg font-semibold" style={{ color: PALETTE.orange }}>
                Task 2: Sustained Focus (4 minutes)
              </Text>
              <Text className="text-gray-700">
                Maintain attention over time while responding to target stimuli. This tests concentration endurance.
              </Text>
            </View>

            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#FFE0E0' }}>
              <Text className="mb-2 text-lg font-semibold" style={{ color: PALETTE.red }}>
                Task 3: Divided Attention (3 minutes)
              </Text>
              <Text className="text-gray-700">
                Track multiple targets simultaneously. This evaluates your ability to split focus effectively.
              </Text>
            </View>
          </View>

          <Text className="mb-4 text-2xl font-bold" style={{ color: PALETTE.teal }}>
            Important Instructions
          </Text>

          <View className="mb-6 space-y-3">
            <View className="flex-row items-start gap-3">
              <Text className="text-lg text-gray-700">•</Text>
              <Text className="flex-1 text-lg text-gray-700">
                <Text className="font-semibold">Work as quickly and accurately as possible.</Text> Speed and precision are both important.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text className="text-lg text-gray-700">•</Text>
              <Text className="flex-1 text-lg text-gray-700">
                <Text className="font-semibold">Cannot be paused or restarted.</Text> Complete the entire assessment in one session.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text className="text-lg text-gray-700">•</Text>
              <Text className="flex-1 text-lg text-gray-700">
                <Text className="font-semibold">Sit in a quiet environment.</Text> Minimize distractions for accurate results.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text className="text-lg text-gray-700">•</Text>
              <Text className="flex-1 text-lg text-gray-700">
                <Text className="font-semibold">Use your dominant hand.</Text> Hold the device comfortably for quick tapping.
              </Text>
            </View>
            <View className="flex-row items-start gap-3">
              <Text className="text-lg text-gray-700">•</Text>
              <Text className="flex-1 text-lg text-gray-700">
                <Text className="font-semibold">Don't guess.</Text> Only tap when you're confident you see a target.
              </Text>
            </View>
          </View>

          <View className="p-4 mb-6 rounded-2xl" style={{ backgroundColor: '#F0F9FF' }}>
            <Text className="mb-3 text-lg font-semibold" style={{ color: PALETTE.teal }}>
              Assessment Results Will Include:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-700">• Overall attention score (0-100)</Text>
              <Text className="text-gray-700">• Reaction time analysis</Text>
              <Text className="text-gray-700">• Accuracy percentage</Text>
              <Text className="text-gray-700">• Sustained attention rating</Text>
              <Text className="text-gray-700">• Comparison with age group norms</Text>
              <Text className="text-gray-700">• Personalized recommendations</Text>
            </View>
          </View>

          {/* Consent and Ready Check */}
          <View className="p-4 mb-6 rounded-2xl" style={{ backgroundColor: '#FEF2F2' }}>
            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() => setHasReadInstructions(!hasReadInstructions)}
            >
              <View
                className="items-center justify-center w-6 h-6 rounded border-2"
                style={{
                  borderColor: hasReadInstructions ? PALETTE.teal : '#9CA3AF',
                  backgroundColor: hasReadInstructions ? PALETTE.teal : 'transparent',
                }}
              >
                {hasReadInstructions && (
                  <Text className="text-white text-sm">✓</Text>
                )}
              </View>
              <Text className="flex-1 text-lg text-gray-700">
                I have read and understood all instructions for this attention assessment
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-6 mb-10 rounded-3xl"
          style={{ 
            backgroundColor: hasReadInstructions ? PALETTE.teal : '#CCCCCC',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 5
          }}
          onPress={handleStartAssessment}
          disabled={!hasReadInstructions}
        >
          <Text className="mr-3 text-3xl">🎯</Text>
          <Text className="text-2xl font-semibold text-white">Begin Assessment</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AttentionAssessmentIntro;