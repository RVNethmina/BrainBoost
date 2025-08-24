import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type BrainGamesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BrainGames'
>;

const BrainGames = () => {
  const navigation = useNavigation<BrainGamesScreenNavigationProp>();

  const games = [
    { 
      id: 1, 
      title: 'Memory Match', 
      icon: '🧩', 
      description: 'Find matching pairs',
      difficulty: 'Easy',
      difficultyColor: 'bg-green-100 text-green-700',
      screen: 'MemoryMatch'
    },
    { 
      id: 2, 
      title: 'Math Quiz', 
      icon: '🧮', 
      description: 'Number challenges',
      difficulty: 'Medium',
      difficultyColor: 'bg-yellow-100 text-yellow-700',
      screen: 'MathQuiz'
    },
    { 
      id: 3, 
      title: 'Attention', 
      icon: '🎯', 
      description: 'Focus training',
      difficulty: 'Easy',
      difficultyColor: 'bg-blue-100 text-blue-700',
      screen: 'AttentionGame'
    },
    { 
      id: 4, 
      title: 'Puzzle', 
      icon: '🧩', 
      description: 'Logic problems',
      difficulty: 'Hard',
      difficultyColor: 'bg-red-100 text-red-700',
      screen: 'PuzzleGame'
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
        <Text className="text-2xl font-bold text-gray-800">Brain Games</Text>
        <View className="w-12" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="my-4 text-lg text-center text-gray-600">
          Choose a game to train your brain
        </Text>

        <View className="grid grid-cols-2 gap-4 mb-6">
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              className="items-center p-5 bg-white border border-gray-100 shadow-sm rounded-2xl"
              onPress={() => navigation.navigate(game.screen as keyof RootStackParamList)}
            >
              <Text className="mb-3 text-4xl">{game.icon}</Text>
              <Text className="text-xl font-bold text-center">{game.title}</Text>
              <Text className="mt-2 text-center text-gray-600">{game.description}</Text>
              <View className={`px-3 py-1 rounded-full mt-3 ${game.difficultyColor}`}>
                <Text className="text-sm">{game.difficulty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default BrainGames;