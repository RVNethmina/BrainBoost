// app/src/screens/AssessmentTest.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Use the generic navigation prop for the whole stack (not just 'Assessment')
type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

// Narrow union of the assessment route names
type AssessmentRoute = 'MemoryTest' | 'AttentionTest' | 'MathAssessment' | 'FullAssessment';

const AssessmentTest: React.FC = () => {
  const navigation = useNavigation<RootNavProp>();

  const assessments: {
    id: number;
    title: string;
    icon: string;
    duration: string;
    type: string;
    screen: AssessmentRoute;
    bgColor: string;
    textColor: string;
  }[] = [
    {
      id: 1,
      title: 'Memory Test',
      icon: '🧠',
      duration: '15 minutes',
      type: 'Comprehensive',
      screen: 'MemoryTest',
      bgColor: PALETTE.lightTeal,
      textColor: PALETTE.teal,
    },
    {
      id: 2,
      title: 'Attention Test',
      icon: '⚡',
      duration: '10 minutes',
      type: 'Focus',
      screen: 'AttentionTest',
      bgColor: PALETTE.lightPink,
      textColor: PALETTE.orange,
    },
    {
      id: 3,
      title: 'Math Assessment',
      icon: '🔢',
      duration: '12 minutes',
      type: 'Numerical',
      screen: 'MathAssessment',
      bgColor: PALETTE.lightPink,
      textColor: PALETTE.red,
    },
    {
      id: 4,
      title: 'Full Assessment',
      icon: '🎯',
      duration: '30 minutes',
      type: 'Complete',
      screen: 'FullAssessment',
      bgColor: PALETTE.lightTeal,
      textColor: PALETTE.teal,
    },
  ];

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
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Assessment Tests</Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="my-4 text-lg text-center text-gray-600">Test your cognitive abilities</Text>

        <View className="grid grid-cols-2 gap-4 mb-6">
          {assessments.map((assessment) => (
            <TouchableOpacity
              key={assessment.id}
              className="items-center p-5 border shadow-sm rounded-2xl"
              style={{
                backgroundColor: 'white',
                borderColor: PALETTE.lightTeal,
              }}
              onPress={() => navigation.navigate(assessment.screen)}
            >
              <Text className="mb-3 text-4xl">{assessment.icon}</Text>
              <Text className="text-xl font-bold text-center">{assessment.title}</Text>
              <Text className="mt-2 text-center text-gray-600">{assessment.duration}</Text>
              <View
                className="px-3 py-1 mt-3 rounded-full"
                style={{
                  backgroundColor: assessment.bgColor,
                }}
              >
                <Text className="text-sm" style={{ color: assessment.textColor }}>
                  {assessment.type}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AssessmentTest;
