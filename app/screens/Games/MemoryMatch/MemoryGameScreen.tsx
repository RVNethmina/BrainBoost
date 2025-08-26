import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type MemoryGameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MemoryGame'
>;

const PALETTE = {
  red: "#F04F4E",
  teal: "#639D9D",
  lightTeal: "#92BABA",
  orange: "#F3A421",
  lightPink: "#FBD4D3",
};

const MemoryGameScreen = () => {
  const navigation = useNavigation<MemoryGameScreenNavigationProp>();
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  // Card data
  const cards = [
    { id: 1, emoji: '🐱', matched: false },
    { id: 2, emoji: '🐶', matched: false },
    { id: 3, emoji: '🐱', matched: false },
    { id: 4, emoji: '🦊', matched: false },
    { id: 5, emoji: '🐸', matched: false },
    { id: 6, emoji: '🐶', matched: false },
    { id: 7, emoji: '🐸', matched: false },
    { id: 8, emoji: '🦊', matched: false },
    { id: 9, emoji: '🐰', matched: false },
    { id: 10, emoji: '🐯', matched: false },
    { id: 11, emoji: '🐰', matched: false },
    { id: 12, emoji: '🐯', matched: false },
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCardPress = (index: number) => {
    if (!gameStarted) setGameStarted(true);
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);
    setMoves(moves + 1);

    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        // Match found
        setMatchedCards([...matchedCards, firstIndex, secondIndex]);
        setFlippedCards([]);
      } else {
        // No match, flip back after delay
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const getCardStyle = (index: number) => {
    if (flippedCards.includes(index) || matchedCards.includes(index)) {
      return matchedCards.includes(index) 
        ? { backgroundColor: PALETTE.lightTeal, borderColor: PALETTE.teal }
        : { backgroundColor: PALETTE.lightPink, borderColor: PALETTE.red };
    }
    return { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' };
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-10 pb-4" style={{ backgroundColor: PALETTE.lightPink }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center gap-4">
          <View className="items-center">
            <Text className="text-sm text-gray-600">Time</Text>
            <Text className="text-xl font-bold">{formatTime(time)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-600">Moves</Text>
            <Text className="text-xl font-bold">{moves}</Text>
          </View>
        </View>
        
        <TouchableOpacity>
          <Text className="text-2xl">⏸️</Text>
        </TouchableOpacity>
      </View>

      {/* Game Board */}
      <View className="items-center justify-center flex-1 p-5">
        <View className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              className="items-center justify-center w-16 h-16 border-2 rounded-xl"
              style={getCardStyle(index)}
              onPress={() => handleCardPress(index)}
            >
              <Text className="text-2xl">
                {flippedCards.includes(index) || matchedCards.includes(index) ? card.emoji : '?'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="items-center">
          <Text className="mb-2 text-lg text-gray-600">
            Pairs Found: <Text className="font-bold" style={{ color: PALETTE.teal }}>
              {matchedCards.length / 2}/{cards.length / 2}
            </Text>
          </Text>
          <View className="w-full h-3 bg-gray-200 rounded-full">
            <View 
              className="h-full rounded-full"
              style={{ 
                width: `${(matchedCards.length / cards.length) * 100}%`,
                backgroundColor: PALETTE.teal
              }} 
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-4 p-5">
        <TouchableOpacity 
          className="flex-row items-center justify-center flex-1 py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
        >
          <Text className="mr-2 text-2xl">💡</Text>
          <Text className="font-semibold text-white">Hint</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-row items-center justify-center flex-1 py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
          onPress={() => {
            setTime(0);
            setMoves(0);
            setFlippedCards([]);
            setMatchedCards([]);
            setGameStarted(false);
          }}
        >
          <Text className="mr-2 text-2xl">🔄</Text>
          <Text className="font-semibold text-white">Restart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MemoryGameScreen;