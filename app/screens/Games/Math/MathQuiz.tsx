import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type MathQuizScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MathQuiz'
>;

const MathQuiz = () => {
  const navigation = useNavigation<MathQuizScreenNavigationProp>();

  const difficulties = [
    {
      id: 1,
      name: 'Easy',
      description: 'Addition & Subtraction',
      color: 'bg-green-100 border-green-300',
      textColor: 'text-green-700'
    },
    {
      id: 2,
      name: 'Medium',
      description: 'Multiplication & Division',
      color: 'bg-gray-100 border-gray-300',
      textColor: 'text-gray-700'
    },
    {
      id: 3,
      name: 'Hard',
      description: 'Mixed Operations',
      color: 'bg-gray-100 border-gray-300',
      textColor: 'text-gray-700'
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
        <Text className="text-2xl font-bold text-gray-800">Math Quiz</Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center my-8">
          <View className="items-center justify-center w-32 h-32 mb-6 bg-yellow-200 rounded-full">
            <Text className="text-6xl">🧮</Text>
          </View>
          <Text className="mb-4 text-3xl font-bold">Math Quiz</Text>
          <Text className="mb-8 text-xl text-gray-600">Solve math problems quickly</Text>
        </View>

        <View className="p-5 mb-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <Text className="mb-4 text-2xl font-bold text-center">Choose Difficulty</Text>
          <View className="space-y-3">
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.id}
                className={`py-4 rounded-2xl border-2 ${difficulty.color} ${difficulty.textColor}`}
                onPress={() => navigation.navigate('MathPlay')}
              >
                <Text className="text-lg font-semibold text-center">
                  🟢 {difficulty.name} ({difficulty.description})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-5 mb-8 bg-purple-500 rounded-2xl"
          onPress={() => navigation.navigate('MathPlay')}
        >
          <Text className="mr-2 text-2xl">🎮</Text>
          <Text className="text-xl font-semibold text-white">Start Quiz</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MathQuiz;