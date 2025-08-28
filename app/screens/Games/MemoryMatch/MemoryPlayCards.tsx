// app/src/screens/Games/MemoryMatch/MemoryPlayCards.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from "react-native";

type MemoryPlayCardsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel2"
>;

const INITIAL_TIME = 240; // 4 minutes
const CARD_SETS = [
  ['🍎', '🍌', '🍇', '🍊', '🍓', '🥝'], // Fruits
  ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'], // Animals
  ['🚗', '🚕', '🚙', '🚌', '🚎', '🚐'], // Vehicles
];

type Card = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type GameRound = {
  cards: Card[];
  pairsFound: number;
  moves: number;
  timeBonus: number;
};

const MemoryPlayCards: React.FC = () => {
  const navigation = useNavigation<MemoryPlayCardsNavigationProp>();
  
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'roundComplete'>('start');
  const [canFlip, setCanFlip] = useState<boolean>(true);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TOTAL_ROUNDS = 3;

  // Create shuffled deck for current round
  const createDeck = (round: number): Card[] => {
    const cardSet = CARD_SETS[round % CARD_SETS.length];
    const pairsCount = Math.min(4 + round, 6); // 4-6 pairs
    const selectedSymbols = cardSet.slice(0, pairsCount);
    
    const deck: Card[] = [];
    selectedSymbols.forEach((symbol, index) => {
      // Add pair of cards
      deck.push({ id: index * 2, symbol, isFlipped: false, isMatched: false });
      deck.push({ id: index * 2 + 1, symbol, isFlipped: false, isMatched: false });
    });
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  };

  // Initialize round
  useEffect(() => {
    if (currentRound < TOTAL_ROUNDS) {
      const newDeck = createDeck(currentRound);
      setCards(newDeck);
      setFlippedCards([]);
      setMoves(0);
      setCanFlip(true);
      
      if (currentRound === 0) {
        setGameState('start');
      } else {
        setGameState('playing');
      }
    }
  }, [currentRound]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }

    if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Time up effect
  useEffect(() => {
    if (timeLeft <= 0) {
      endGame("time");
    }
  }, [timeLeft]);

  // Check for matches when 2 cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      setCanFlip(false);
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);
      
      setTimeout(() => {
        if (firstCard?.symbol === secondCard?.symbol) {
          // Match found
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isMatched: true }
                : card
            )
          );
          setScore(s => s + 2); // 2 points per match
          Vibration.vibrate(100);
          
          // Check if round complete
          const matchedCount = cards.filter(c => c.isMatched).length + 2;
          if (matchedCount === cards.length) {
            setTimeout(() => {
              if (currentRound + 1 >= TOTAL_ROUNDS) {
                endGame("finished");
              } else {
                setGameState('roundComplete');
                setTimeout(() => {
                  setCurrentRound(r => r + 1);
                }, 1500);
              }
            }, 500);
          }
        } else {
          // No match - flip cards back
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isFlipped: false }
                : card
            )
          );
          Vibration.vibrate([50, 50, 50]);
        }
        
        setFlippedCards([]);
        setCanFlip(true);
      }, 1000);
    }
  }, [flippedCards, cards]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCardPress = (cardId: number) => {
    if (!isRunning || !canFlip || gameState !== 'playing') return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    // Flip the card
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );
    
    setFlippedCards(prev => [...prev, cardId]);
    
    if (flippedCards.length === 0) {
      setMoves(m => m + 1);
    }
  };

  const endGame = (reason: "time" | "finished") => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const timeTaken = INITIAL_TIME - Math.max(0, timeLeft);
    const totalPairs = cards.filter(c => c.isMatched).length / 2;
    
    navigation.navigate("MemoryResults" as any, {
      score,
      totalQuestions: TOTAL_ROUNDS * 6, // Max possible pairs across all rounds
      timeTaken,
      endedBy: reason,
      gameType: 'cards',
      level: 2,
      difficulty: 'medium'
    } as any);
  };

  const handleStart = () => {
    setIsRunning(true);
    setGameState('playing');
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const progressPercent = Math.min(100, ((currentRound) / TOTAL_ROUNDS) * 100);
  const matchedPairs = cards.filter(c => c.isMatched).length / 2;
  const totalPairs = cards.length / 2;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pt-10 pb-4"
        style={{ backgroundColor: PALETTE.lightPink }}
      >
        <TouchableOpacity
          onPress={() => {
            handlePause();
            navigation.goBack();
          }}
          className="items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-4">
          <View className="items-center mr-2">
            <Text className="text-sm text-gray-600">Time</Text>
            <Text className="text-xl font-bold">{formatTime(timeLeft)}</Text>
          </View>
          <View className="items-center mr-2">
            <Text className="text-sm text-gray-600">Score</Text>
            <Text className="text-xl font-bold">{score}</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-600">Moves</Text>
            <Text className="text-xl font-bold">{moves}</Text>
          </View>
        </View>

        <View style={{ width: 44 }}>
          {gameState === 'start' ? (
            <TouchableOpacity onPress={handleStart}>
              <Text className="text-2xl">▶️</Text>
            </TouchableOpacity>
          ) : isRunning ? (
            <TouchableOpacity onPress={handlePause}>
              <Text className="text-2xl">⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleResume}>
              <Text className="text-2xl">▶️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Game Area */}
      <View className="justify-center flex-1 px-5">
        {gameState === 'start' && (
          <View
            className="p-6 mb-8 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
              Memory Cards
            </Text>
            <Text className="mb-6 text-lg text-center text-gray-600">
              Find matching pairs by flipping cards. Complete 3 rounds with increasing difficulty!
            </Text>
            <TouchableOpacity
              className="px-8 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={handleStart}
            >
              <Text className="text-xl font-semibold text-white text-center">Start Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'roundComplete' && (
          <View
            className="p-6 mb-8 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>
              Round {currentRound + 1} Complete!
            </Text>
            <Text className="text-lg text-center text-gray-600">
              Preparing next round...
            </Text>
          </View>
        )}

        {gameState === 'playing' && (
          <View
            className="p-4 mb-6 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-xl font-bold text-center" style={{ color: PALETTE.teal }}>
              Round {currentRound + 1} - Find {totalPairs} pairs
            </Text>
            <Text className="mb-4 text-center text-gray-600">
              Matches: {matchedPairs}/{totalPairs}
            </Text>

            {/* Cards Grid */}
            <View className="flex-row flex-wrap justify-center gap-2">
              {cards.map((card) => {
                const isFlipped = card.isFlipped || card.isMatched;
                return (
                  <TouchableOpacity
                    key={card.id}
                    className="items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: isFlipped ? PALETTE.lightTeal : PALETTE.orange,
                      borderWidth: 2,
                      borderColor: card.isMatched ? PALETTE.teal : PALETTE.orange,
                      width: 70,
                      height: 70,
                      margin: 4,
                    }}
                    onPress={() => handleCardPress(card.id)}
                    disabled={!canFlip || !isRunning}
                  >
                    <Text className="text-3xl">
                      {isFlipped ? card.symbol : '?'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Progress */}
        <View className="items-center">
          <Text className="mb-2 text-lg text-gray-600">
            Round:{" "}
            <Text className="font-bold" style={{ color: PALETTE.teal }}>
              {Math.min(currentRound + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
            </Text>
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: PALETTE.teal },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default MemoryPlayCards;

const styles = StyleSheet.create({
  progressTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
  },
});