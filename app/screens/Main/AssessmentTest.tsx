import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type AssessmentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Assessment'
>;

const AssessmentTest = () => {
  const navigation = useNavigation<AssessmentScreenNavigationProp>();

  const assessments = [
    { 
      id: 1, 
      title: 'Memory Test', 
      icon: '🧠', 
      duration: '15 minutes',
      type: 'Comprehensive',
      typeColor: 'bg-purple-100 text-purple-700',
      screen: 'MemoryTest'
    },
    { 
      id: 2, 
      title: 'Attention Test', 
      icon: '⚡', 
      duration: '10 minutes',
      type: 'Focus',
      typeColor: 'bg-blue-100 text-blue-700',
      screen: 'AttentionTest'
    },
    { 
      id: 3, 
      title: 'Math Assessment', 
      icon: '🔢', 
      duration: '12 minutes',
      type: 'Numerical',
      typeColor: 'bg-green-100 text-green-700',
      screen: 'MathAssessment'
    },
    { 
      id: 4, 
      title: 'Full Assessment', 
      icon: '🎯', 
      duration: '30 minutes',
      type: 'Complete',
      typeColor: 'bg-orange-100 text-orange-700',
      screen: 'FullAssessment'
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-10 pb-4 bg-purple-100">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-12 h-12 bg-gray-100 rounded-xl"
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Assessment Tests</Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="my-4 text-lg text-center text-gray-600">
          Test your cognitive abilities
        </Text>

        <View className="grid grid-cols-2 gap-4 mb-6">
          {assessments.map((assessment) => (
            <TouchableOpacity
              key={assessment.id}
              className="items-center p-5 bg-white border border-gray-100 shadow-sm rounded-2xl"
              onPress={() => navigation.navigate(assessment.screen as keyof RootStackParamList)}
            >
              <Text className="mb-3 text-4xl">{assessment.icon}</Text>
              <Text className="text-xl font-bold text-center">{assessment.title}</Text>
              <Text className="mt-2 text-center text-gray-600">{assessment.duration}</Text>
              <View className={`px-3 py-1 rounded-full mt-3 ${assessment.typeColor}`}>
                <Text className="text-sm">{assessment.type}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AssessmentTest;