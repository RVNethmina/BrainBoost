// app/src/screens/AttentionQuiz.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type AttentionQuizScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AttentionQuiz'
>;

// Define a type for the valid attention play routes
type AttentionPlayRoute = 'AttentionPlayEasy' | 'AttentionPlayMedium' | 'AttentionPlayHard';

const AttentionQuiz: React.FC = () => {
  const navigation = useNavigation<AttentionQuizScreenNavigationProp>();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const difficulties = [
    {
      id: 1,
      name: 'Easy',
      description: 'Slow pace, large targets',
      color: PALETTE.lightTeal,
      borderColor: PALETTE.teal,
      textColor: PALETTE.teal,
      selectedBackground: PALETTE.teal,
      selectedBorder: PALETTE.teal,
      selectedTextColor: '#FFFFFF',
      route: 'AttentionPlayEasy' as AttentionPlayRoute,
      icon: '🎯',
      details: '• 2-second target display\n• Large shapes\n• Clear colors'
    },
    {
      id: 2,
      name: 'Medium',
      description: 'Moderate pace, medium targets',
      color: '#FFEDCC',
      borderColor: PALETTE.orange,
      textColor: PALETTE.orange,
      selectedBackground: PALETTE.orange,
      selectedBorder: PALETTE.orange,
      selectedTextColor: '#FFFFFF',
      route: 'AttentionPlayMedium' as AttentionPlayRoute,
      icon: '⚡',
      details: '• 1.5-second display\n• Medium shapes\n• More distractors'
    },
    {
      id: 3,
      name: 'Hard',
      description: 'Fast pace, small targets',
      color: '#FFE0E0',
      borderColor: PALETTE.red,
      textColor: PALETTE.red,
      selectedBackground: PALETTE.red,
      selectedBorder: PALETTE.red,
      selectedTextColor: '#FFFFFF',
      route: 'AttentionPlayHard' as AttentionPlayRoute,
      icon: '🚀',
      details: '• 1-second display\n• Small shapes\n• Many distractors'
    },
  ];

  const onStart = () => {
    if (selectedId == null) {
      Alert.alert('Choose difficulty', 'Please choose a difficulty before starting the attention game.');
      return;
    }

    const selected = difficulties.find((d) => d.id === selectedId);
    if (!selected) {
      // Default to Easy if something goes wrong
      navigation.navigate('AttentionPlayEasy');
      return;
    }

    // Use a type-safe navigation approach
    switch(selected.route) {
      case 'AttentionPlayEasy':
        navigation.navigate('AttentionPlayEasy');
        break;
      case 'AttentionPlayMedium':
        navigation.navigate('AttentionPlayMedium');
        break;
      case 'AttentionPlayHard':
        navigation.navigate('AttentionPlayHard');
        break;
      default:
        navigation.navigate('AttentionPlayEasy');
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
        <Text className="text-3xl font-bold text-white">Attention Game</Text>
        <View className="w-14" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center my-8">
          <View
            className="items-center justify-center w-40 h-40 mb-6 rounded-full"
            style={{ backgroundColor: PALETTE.teal }}
          >
            <Text className="text-7xl">👁️</Text>
          </View>
          <Text className="mb-4 text-4xl font-bold" style={{ color: PALETTE.teal }}>Target Focus</Text>
          <Text className="mb-2 text-xl text-center" style={{ color: PALETTE.teal }}>
            Find and tap the target shapes
          </Text>
          <Text className="mb-8 text-lg text-center text-gray-600">
            Look for red circles among other shapes
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
                  className="py-5 pl-5 rounded-2xl"
                  style={{
                    backgroundColor: isSelected ? difficulty.selectedBackground : difficulty.color,
                    borderWidth: 3,
                    borderColor: isSelected ? difficulty.selectedBorder : difficulty.borderColor,
                  }}
                  onPress={() => setSelectedId(difficulty.id)}
                  accessibilityRole="button"
                >
                  <View className="flex-row items-start justify-start">
                    <Text className="mr-4 text-3xl">{difficulty.icon}</Text>
                    <View className="flex-1">
                      <Text
                        className="text-2xl font-bold mb-1"
                        style={{ color: isSelected ? difficulty.selectedTextColor : difficulty.textColor }}
                      >
                        {difficulty.name}
                      </Text>
                      <Text
                        className="text-lg mb-2"
                        style={{ color: isSelected ? difficulty.selectedTextColor : difficulty.textColor }}
                      >
                        {difficulty.description}
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ 
                          color: isSelected ? difficulty.selectedTextColor : difficulty.textColor,
                          opacity: 0.8
                        }}
                      >
                        {difficulty.details}
                      </Text>
                    </View>
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
          <Text className="text-2xl font-semibold text-white">Start Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AttentionQuiz;