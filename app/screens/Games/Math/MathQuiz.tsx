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
        <Text className="text-3xl font-bold text-white">Math Quiz</Text>
        <View className="w-14" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center my-8">
          <View
            className="items-center justify-center w-40 h-40 mb-6 rounded-full"
            style={{ backgroundColor: PALETTE.teal }}
          >
            <Text className="text-7xl">🧮</Text>
          </View>
          <Text className="mb-4 text-4xl font-bold" style={{ color: PALETTE.teal }}>Math Quiz</Text>
          <Text className="mb-8 text-2xl text-center" style={{ color: PALETTE.teal }}>
            Solve math problems quickly
          </Text>
        </View>

        <View
          className="p-6 mb-8 rounded-3xl"
          style={{ backgroundColor: '#FFFFFF', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}
        >
          <Text className="mb-6 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
            Choose Difficulty
          </Text>

          <View className="space-y-5">
            {difficulties.map((difficulty) => {
              const isSelected = difficulty.id === selectedId;
              return (
                <TouchableOpacity
                  key={difficulty.id}
                  className="flex-row items-center justify-start py-5 pl-5 rounded-2xl"
                  style={{
                    backgroundColor: isSelected ? difficulty.selectedBackground : difficulty.color,
                    borderWidth: 3,
                    borderColor: isSelected ? difficulty.selectedBorder : difficulty.borderColor,
                  }}
                  onPress={() => setSelectedId(difficulty.id)}
                  accessibilityRole="button"
                >
                  <Text className="mr-4 text-3xl">{difficulty.icon}</Text>
                  <View>
                    <Text
                      className="text-2xl font-bold"
                      style={{ color: isSelected ? difficulty.selectedTextColor : difficulty.textColor }}
                    >
                      {difficulty.name}
                    </Text>
                    <Text
                      className="text-lg"
                      style={{ color: isSelected ? difficulty.selectedTextColor : difficulty.textColor }}
                    >
                      {difficulty.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-6 mb-10 rounded-3xl"
          style={{ 
            backgroundColor: selectedId ? PALETTE.teal : '#CCCCCC',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 5
          }}
          onPress={onStart}
          disabled={!selectedId}
        >
          <Text className="mr-3 text-3xl">🎮</Text>
          <Text className="text-2xl font-semibold text-white">Start Quiz</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MathQuiz;