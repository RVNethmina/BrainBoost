// app/src/screens/Games/Attention/AttentionQuiz.tsx
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

type AttentionPlayRoute =
  | 'AttentionPlayEasy'
  | 'AttentionPlayMedium'
  | 'AttentionPlayHard';

const AttentionQuiz: React.FC = () => {
  const navigation = useNavigation<AttentionQuizScreenNavigationProp>();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const attentionGames = [
    {
      id: 1,
      name: 'Symbol Search',
      description: 'Find target symbols quickly',
      difficulty: 'Easy',
      color: PALETTE.lightTeal,
      borderColor: PALETTE.teal,
      textColor: PALETTE.teal,
      selectedBackground: PALETTE.teal,
      selectedBorder: PALETTE.teal,
      selectedTextColor: '#FFFFFF',
      route: 'AttentionPlayEasy' as AttentionPlayRoute,
      icon: '🔍',
      details: '10 rounds • Large targets • 3 minutes',
      description2: 'Perfect for beginners - find simple shapes and symbols on screen.'
    },
    {
      id: 2,
      name: 'Color Focus',
      description: 'Spot colors while ignoring distractors',
      difficulty: 'Medium',
      color: '#FFEDCC',
      borderColor: PALETTE.orange,
      textColor: PALETTE.orange,
      selectedBackground: PALETTE.orange,
      selectedBorder: PALETTE.orange,
      selectedTextColor: '#FFFFFF',
      route: 'AttentionPlayMedium' as AttentionPlayRoute,
      icon: '🎨',
      details: '12 rounds • Mixed targets • 4 minutes',
      description2: 'Find specific colored shapes while ignoring similar distractors.'
    },
    {
      id: 3,
      name: 'Speed Challenge',
      description: 'Fast-paced target detection',
      difficulty: 'Hard',
      color: '#FFE0E0',
      borderColor: PALETTE.red,
      textColor: PALETTE.red,
      selectedBackground: PALETTE.red,
      selectedBorder: PALETTE.red,
      selectedTextColor: '#FFFFFF',
      route: 'AttentionPlayHard' as AttentionPlayRoute,
      icon: '⚡',
      details: '15 rounds • Quick responses • 5 minutes',
      description2: 'Advanced challenge with time pressure and complex patterns.'
    },
  ];

  const onStart = () => {
    if (selectedId == null) {
      Alert.alert('Choose Game', 'Please select an attention game before starting.');
      return;
    }

    const selected = attentionGames.find((g) => g.id === selectedId);
    if (!selected) return;

    navigation.navigate(selected.route);
  };

  const selectedGame = attentionGames.find(g => g.id === selectedId);

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
        <Text className="text-3xl font-bold text-white">Attention Games</Text>
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
          <Text className="mb-4 text-4xl font-bold" style={{ color: PALETTE.teal }}>Attention Training</Text>
          <Text className="mb-8 text-2xl text-center" style={{ color: PALETTE.teal }}>
            Sharpen your focus & concentration
          </Text>
        </View>

        <View
          className="p-6 mb-8 rounded-3xl"
          style={{ backgroundColor: '#FFFFFF', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}
        >
          <Text className="mb-6 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
            Choose Your Challenge
          </Text>

          <View className="space-y-5">
            {attentionGames.map((game) => {
              const isSelected = game.id === selectedId;
              return (
                <TouchableOpacity
                  key={game.id}
                  className="py-5 pl-5 pr-3 rounded-2xl"
                  style={{
                    backgroundColor: isSelected ? game.selectedBackground : game.color,
                    borderWidth: 3,
                    borderColor: isSelected ? game.selectedBorder : game.borderColor,
                  }}
                  onPress={() => setSelectedId(game.id)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Text className="mr-4 text-3xl">{game.icon}</Text>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text
                            className="text-2xl font-bold"
                            style={{ color: isSelected ? game.selectedTextColor : game.textColor }}
                          >
                            {game.name}
                          </Text>
                          <View
                            className="px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' 
                            }}
                          >
                            <Text
                              className="text-xs font-semibold"
                              style={{ color: isSelected ? game.selectedTextColor : game.textColor }}
                            >
                              {game.difficulty}
                            </Text>
                          </View>
                        </View>
                        <Text
                          className="text-lg mb-1"
                          style={{ color: isSelected ? game.selectedTextColor : game.textColor }}
                        >
                          {game.description}
                        </Text>
                        <Text
                          className="text-sm"
                          style={{ 
                            color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' 
                          }}
                        >
                          {game.details}
                        </Text>
                      </View>
                    </View>
                    
                    {isSelected && (
                      <View
                        className="items-center justify-center w-8 h-8 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                      >
                        <Text className="text-lg text-white">✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Game Preview */}
          {selectedGame && (
            <View 
              className="p-4 mt-6 rounded-2xl"
              style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            >
              <Text className="mb-2 text-lg font-semibold" style={{ color: PALETTE.teal }}>
                About {selectedGame.name}:
              </Text>
              <View className="flex-row items-start gap-2">
                <Text className="text-base text-gray-700">•</Text>
                <Text className="flex-1 text-base text-gray-700">
                  {selectedGame.description2}
                </Text>
              </View>
            </View>
          )}

          {/* Helpful Tips Section */}
          <View 
            className="p-4 mt-6 rounded-2xl"
            style={{ backgroundColor: '#F0F9FF' }}
          >
            <Text className="mb-2 text-lg font-semibold" style={{ color: PALETTE.teal }}>
              💡 Attention Training Tips:
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-gray-700">•</Text>
                <Text className="flex-1 text-sm text-gray-700">Focus on accuracy first, speed will come naturally</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-gray-700">•</Text>
                <Text className="flex-1 text-sm text-gray-700">Take a moment to understand the target before starting</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-gray-700">•</Text>
                <Text className="flex-1 text-sm text-gray-700">Practice regularly - consistency improves concentration</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-gray-700">•</Text>
                <Text className="flex-1 text-sm text-gray-700">Don't worry about mistakes - learning from them helps focus</Text>
              </View>
            </View>
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
          <Text className="mr-3 text-3xl">👁️</Text>
          <Text className="text-2xl font-semibold text-white">Start Training</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AttentionQuiz;