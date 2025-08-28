// app/src/screens/Games/MemoryMatch/MemoryQuiz.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type MemoryQuizScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MemoryQuiz'
>;

type MemoryPlayRoute =
  | 'MemoryPlayLevel1'
  | 'MemoryPlayLevel2'
  | 'MemoryPlayLevel3'
  | 'MemoryPlayLevel4';

const MemoryQuiz: React.FC = () => {
  const navigation = useNavigation<MemoryQuizScreenNavigationProp>();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const memoryGames = [
    {
      id: 1,
      name: 'Pattern Memory',
      description: 'Watch & repeat color patterns',
      difficulty: 'Easy',
      color: PALETTE.lightTeal,
      borderColor: PALETTE.teal,
      textColor: PALETTE.teal,
      selectedBackground: PALETTE.teal,
      selectedBorder: PALETTE.teal,
      selectedTextColor: '#FFFFFF',
      route: 'MemoryPlayLevel1' as MemoryPlayRoute,
      icon: '🎨',
      details: 'Progressive patterns • 8 rounds • 3 minutes',
      description2: 'Perfect for beginners - watch colorful patterns and repeat them back.'
    },
    {
      id: 2,
      name: 'Memory Cards',
      description: 'Find matching card pairs',
      difficulty: 'Easy',
      color: '#FFEDCC',
      borderColor: PALETTE.orange,
      textColor: PALETTE.orange,
      selectedBackground: PALETTE.orange,
      selectedBorder: PALETTE.orange,
      selectedTextColor: '#FFFFFF',
      route: 'MemoryPlayLevel2' as MemoryPlayRoute,
      icon: '🃏',
      details: '3 rounds • Growing difficulty • 4 minutes',
      description2: 'Classic matching game with friendly themes like fruits and animals.'
    },
    {
      id: 3,
      name: 'Number Memory',
      description: 'Remember number sequences',
      difficulty: 'Medium',
      color: '#FFE0E0',
      borderColor: PALETTE.red,
      textColor: PALETTE.red,
      selectedBackground: PALETTE.red,
      selectedBorder: PALETTE.red,
      selectedTextColor: '#FFFFFF',
      route: 'MemoryPlayLevel3' as MemoryPlayRoute,
      icon: '🔢',
      details: '10 rounds • Growing sequences • 4 minutes',
      description2: 'Study numbers then type them back - great for concentration training.'
    },
    {
      id: 4,
      name: 'Picture Memory',
      description: 'Remember everyday objects',
      difficulty: 'Medium',
      color: '#E6F1F1',
      borderColor: '#9333EA',
      textColor: '#9333EA',
      selectedBackground: '#9333EA',
      selectedBorder: '#9333EA',
      selectedTextColor: '#FFFFFF',
      route: 'MemoryPlayLevel4' as MemoryPlayRoute,
      icon: '🖼️',
      details: '8 rounds • Familiar themes • 5 minutes',
      description2: 'Study pictures of familiar items, then identify what you saw.'
    },
  ];

  const onStart = () => {
    if (selectedId == null) {
      Alert.alert('Choose Game', 'Please select a memory game before starting.');
      return;
    }

    const selected = memoryGames.find((g) => g.id === selectedId);
    if (!selected) return;

    navigation.navigate(selected.route);
  };

  const selectedGame = memoryGames.find(g => g.id === selectedId);

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
        <Text className="text-3xl font-bold text-white">Memory Games</Text>
        <View className="w-14" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center my-8">
          <View
            className="items-center justify-center w-40 h-40 mb-6 rounded-full"
            style={{ backgroundColor: PALETTE.teal }}
          >
            <Text className="text-7xl">🧠</Text>
          </View>
          <Text className="mb-4 text-4xl font-bold" style={{ color: PALETTE.teal }}>Memory Training</Text>
          <Text className="mb-8 text-2xl text-center" style={{ color: PALETTE.teal }}>
            Fun & engaging brain exercises
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
            {memoryGames.map((game) => {
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
              💡 Memory Training Tips:
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-gray-700">•</Text>
                <Text className="flex-1 text-sm text-gray-700">Start with easier games and work your way up</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-gray-700">•</Text>
                <Text className="flex-1 text-sm text-gray-700">Take breaks between rounds to stay focused</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-gray-700">•</Text>
                <Text className="flex-1 text-sm text-gray-700">Play regularly for best results - even 10 minutes helps!</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-sm text-gray-700">•</Text>
                <Text className="flex-1 text-sm text-gray-700">Don't worry about perfect scores - improvement is the goal</Text>
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
          <Text className="mr-3 text-3xl">🧠</Text>
          <Text className="text-2xl font-semibold text-white">Start Training</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MemoryQuiz;