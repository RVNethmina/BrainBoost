// app/src/screens/MathQuiz.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type MathQuizScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MathQuiz'
>;

// Define a type for the valid math play routes
type MathPlayRoute = 'MathPlayAddition' | 'MathPlayMultiplication' | 'MathPlayMixed';

const MathQuiz: React.FC = () => {
  const navigation = useNavigation<MathQuizScreenNavigationProp>();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const difficulties = [
    {
      id: 1,
      name: 'Easy',
      description: 'Addition & Subtraction',
      color: PALETTE.lightTeal,
      borderColor: PALETTE.teal,
      textColor: PALETTE.teal,
      selectedBackground: PALETTE.teal,
      selectedBorder: PALETTE.teal,
      selectedTextColor: '#FFFFFF',
      route: 'MathPlayAddition' as MathPlayRoute,
      icon: '➕'
    },
    {
      id: 2,
      name: 'Medium',
      description: 'Multiplication & Division',
      color: '#FFEDCC',
      borderColor: PALETTE.orange,
      textColor: PALETTE.orange,
      selectedBackground: PALETTE.orange,
      selectedBorder: PALETTE.orange,
      selectedTextColor: '#FFFFFF',
      route: 'MathPlayMultiplication' as MathPlayRoute,
      icon: '✖️'
    },
    {
      id: 3,
      name: 'Hard',
      description: 'Mixed Operations',
      color: '#FFE0E0',
      borderColor: PALETTE.red,
      textColor: PALETTE.red,
      selectedBackground: PALETTE.red,
      selectedBorder: PALETTE.red,
      selectedTextColor: '#FFFFFF',
      route: 'MathPlayMixed' as MathPlayRoute,
      icon: '🔀'
    },
  ];

  const onStart = () => {
    if (selectedId == null) {
      Alert.alert('Choose difficulty', 'Please choose a difficulty before starting the quiz.');
      return;
    }

    const selected = difficulties.find((d) => d.id === selectedId);
    if (!selected) {
      // Default to Easy if something goes wrong
      navigation.navigate('MathPlayAddition');
      return;
    }

    // Use a type-safe navigation approach
    switch(selected.route) {
      case 'MathPlayAddition':
        navigation.navigate('MathPlayAddition');
        break;
      case 'MathPlayMultiplication':
        navigation.navigate('MathPlayMultiplication');
        break;
      case 'MathPlayMixed':
        navigation.navigate('MathPlayMixed');
        break;
      default:
        navigation.navigate('MathPlayAddition');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: PALETTE.lightPink }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pt-12 pb-6 shadow-lg sm:px-6"
        style={{ backgroundColor: PALETTE.teal }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-12 h-12 shadow-md sm:w-14 sm:h-14 rounded-xl active:scale-95"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Text className="text-2xl sm:text-3xl" style={{ color: PALETTE.teal }}>←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white sm:text-3xl">Math Quiz</Text>
        <View className="w-12 sm:w-14" />
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-4 sm:px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Hero Section */}
        <View className="items-center my-6 sm:my-8">
          <View
            className="items-center justify-center w-32 h-32 mb-4 rounded-full shadow-lg sm:w-40 sm:h-40 sm:mb-6"
            style={{ backgroundColor: PALETTE.teal }}
          >
            <Text className="text-6xl sm:text-7xl">🧮</Text>
          </View>
          <Text className="mb-2 text-3xl font-bold text-center sm:mb-4 sm:text-4xl" style={{ color: PALETTE.teal }}>
            Math Quiz
          </Text>
          <Text className="px-4 mb-6 text-lg text-center sm:mb-8 sm:text-2xl" style={{ color: PALETTE.teal }}>
            Test your math skills with timed challenges
          </Text>
        </View>

        {/* Difficulty Selection Card */}
        <View
          className="p-4 mx-2 mb-6 shadow-lg sm:p-6 sm:mb-8 rounded-3xl"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Text className="mb-4 text-2xl font-bold text-center sm:mb-6 sm:text-3xl" style={{ color: PALETTE.teal }}>
            Choose Your Challenge
          </Text>

          <View className="space-y-3 sm:space-y-4">
            {difficulties.map((difficulty, index) => {
              const isSelected = difficulty.id === selectedId;
              return (
                <TouchableOpacity
                  key={difficulty.id}
                  className="flex-row items-center p-4 sm:p-5 rounded-2xl active:scale-[0.98] shadow-sm"
                  style={{
                    backgroundColor: isSelected ? difficulty.selectedBackground : difficulty.color,
                    borderWidth: 2,
                    borderColor: isSelected ? difficulty.selectedBorder : difficulty.borderColor,
                    transform: [{ scale: isSelected ? 1.02 : 1 }],
                  }}
                  onPress={() => setSelectedId(difficulty.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${difficulty.name} difficulty: ${difficulty.description}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View 
                    className="items-center justify-center w-12 h-12 mr-4 sm:w-14 sm:h-14 rounded-xl"
                    style={{ 
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)' 
                    }}
                  >
                    <Text className="text-2xl sm:text-3xl">{difficulty.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="mb-1 text-xl font-bold sm:text-2xl"
                      style={{ color: isSelected ? difficulty.selectedTextColor : difficulty.textColor }}
                    >
                      {difficulty.name}
                    </Text>
                    <Text
                      className="text-sm sm:text-lg"
                      style={{ 
                        color: isSelected 
                          ? difficulty.selectedTextColor 
                          : difficulty.textColor,
                        opacity: isSelected ? 0.9 : 0.8 
                      }}
                    >
                      {difficulty.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="ml-2">
                      <Text className="text-xl sm:text-2xl">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center py-5 mx-2 shadow-lg sm:py-6 rounded-3xl active:scale-95"
          style={{ 
            backgroundColor: selectedId ? PALETTE.teal : '#CCCCCC',
            opacity: selectedId ? 1 : 0.6,
          }}
          onPress={onStart}
          disabled={!selectedId}
          accessibilityRole="button"
          accessibilityLabel="Start the math quiz"
          accessibilityState={{ disabled: !selectedId }}
        >
          <Text className="mr-3 text-2xl sm:text-3xl">🎮</Text>
          <Text className="text-xl font-semibold text-white sm:text-2xl">
            {selectedId ? 'Start Quiz' : 'Select Difficulty First'}
          </Text>
        </TouchableOpacity>

        {/* Quick Tips */}
        <View 
          className="p-4 mx-2 mt-6 rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
        >
          <Text className="text-sm text-center sm:text-base" style={{ color: PALETTE.teal }}>
            💡 <Text className="font-semibold">Quick Tip:</Text> You have 2 minutes to answer 10 questions!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default MathQuiz;