import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type GameResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GameResults'
>;

const PALETTE = {
  red: "#F04F4E",
  teal: "#639D9D",
  lightTeal: "#92BABA",
  orange: "#F3A421",
  lightPink: "#FBD4D3",
};

const GameResultsScreen = () => {
  const navigation = useNavigation<GameResultsScreenNavigationProp>();

  return (
    <View className="flex-1 bg-white">
      {/* Content */}
      <View className="items-center justify-center flex-1 p-5">
        <View className="items-center justify-center w-32 h-32 mb-6 rounded-full" style={{ backgroundColor: PALETTE.orange }}>
          <Text className="text-6xl">🏆</Text>
        </View>
        
        <Text className="mb-4 text-4xl font-bold" style={{ color: PALETTE.teal }}>Excellent!</Text>
        <Text className="mb-8 text-xl text-center text-gray-600">You completed the memory game</Text>
        
        <View className="w-full mb-8 space-y-4">
          <View className="p-5 bg-yellow-100 rounded-2xl">
            <View className="grid grid-cols-3 gap-4">
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>01:45</Text>
                <Text className="text-gray-600">Time</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>18</Text>
                <Text className="text-gray-600">Moves</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>95%</Text>
                <Text className="text-gray-600">Score</Text>
              </View>
            </View>
          </View>
          
          <View className="p-4 rounded-2xl" style={{ backgroundColor: PALETTE.lightPink }}>
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">⭐</Text>
              <View>
                <Text className="font-bold">New Personal Best!</Text>
                <Text className="text-gray-700">You beat your previous time by 15 seconds</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="p-5 space-y-4">
        <TouchableOpacity 
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.teal }}
          onPress={() => navigation.navigate('MemoryGame')}
        >
          <Text className="mr-2 text-2xl">🔄</Text>
          <Text className="text-xl font-semibold text-white">Play Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
          onPress={() => navigation.navigate('BrainGames')}
        >
          <Text className="mr-2 text-2xl">🎮</Text>
          <Text className="text-xl font-semibold text-white">More Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
          onPress={() => navigation.navigate('Home')}
        >
          <Text className="mr-2 text-2xl">🏠</Text>
          <Text className="text-xl font-semibold text-white">Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GameResultsScreen;