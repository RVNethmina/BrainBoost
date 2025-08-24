import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type MathPlayScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MathPlay'
>;

const MathPlay = () => {
  const navigation = useNavigation<MathPlayScreenNavigationProp>();
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const totalQuestions = 10;

  // Sample questions
  const questions = [
    { question: '15 + 23 = ?', options: ['35', '38', '42', '40'], correctIndex: 1 },
    { question: '7 × 6 = ?', options: ['42', '49', '36', '56'], correctIndex: 0 },
    { question: '48 ÷ 8 = ?', options: ['6', '7', '8', '5'], correctIndex: 0 },
  ];

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (selectedIndex: number, correctIndex: number) => {
    if (selectedIndex === correctIndex) {
      setScore(score + 1);
    }
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Navigate to results screen
      navigation.navigate('GameResults');
    }
  };

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
        
        <View className="flex-row items-center gap-4">
          <View className="items-center">
            <Text className="text-sm text-gray-600">Time</Text>
            <Text className="text-xl font-bold">{formatTime(timeLeft)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-600">Score</Text>
            <Text className="text-xl font-bold">{score}</Text>
          </View>
        </View>
        
        <TouchableOpacity>
          <Text className="text-2xl">⏸️</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="justify-center flex-1 px-5">
        <View className="p-5 mb-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <Text className="mb-8 text-4xl font-bold text-center">
            {questions[currentQuestion % questions.length].question}
          </Text>
          
          <View className="grid grid-cols-2 gap-4">
            {questions[currentQuestion % questions.length].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                className="py-6 bg-blue-100 border-2 border-blue-300 rounded-2xl"
                onPress={() => handleAnswer(index, questions[currentQuestion % questions.length].correctIndex)}
              >
                <Text className="text-2xl font-bold text-center">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View className="items-center">
          <Text className="mb-2 text-lg text-gray-600">
            Question: <Text className="font-bold text-purple-600">{currentQuestion + 1}/{totalQuestions}</Text>
          </Text>
          <View className="w-full h-3 bg-gray-200 rounded-full">
            <View 
              className="h-full bg-purple-500 rounded-full" 
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }} 
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default MathPlay;