// app/screens/Games/MemoryMatch/MemoryPlayCards.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { HapticFeedbackService } from "../../../services/HapticFeedbackService";
import { generateDailySeed, SeededRandom } from "../../../utils/SeededRandom";
import { auth } from '@/config/firebaseConfig';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MemoryPlayCardsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel2"
>;

const INITIAL_TIME = 300;
const CARD_SETS = [
  ['🎨', '🌊', '🍇', '🍊', '🍓', '🥕'],
  ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
  ['🚗', '🚕', '🚙', '🚌', '🚎', '🚐'],
];

type Card = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
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
  const lastWarningRef = useRef<number>(0);
  const randomGen = useRef<SeededRandom | null>(null);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    const userId = auth.currentUser?.uid || 'guest';
    const seed = generateDailySeed(userId);
    randomGen.current = new SeededRandom(seed);
    console.log(`Cards game initialized with seed for user: ${userId}`);
  }, []);

  const createDeck = (round: number): Card[] => {
    const cardSet = CARD_SETS[round % CARD_SETS.length];
    const pairsCount = Math.min(4 + Math.floor(round / 2), 5);
    const selectedSymbols = cardSet.slice(0, pairsCount);
    
    const deck: Card[] = [];
    selectedSymbols.forEach((symbol, index) => {
      deck.push({ id: index * 2, symbol, isFlipped: false, isMatched: false });
      deck.push({ id: index * 2 + 1, symbol, isFlipped: false, isMatched: false });
    });
    
    return randomGen.current!.shuffle(deck);
  };

  useEffect(() => {
    if (currentRound < TOTAL_ROUNDS && randomGen.current) {
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

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          const newTime = t - 1;
          if (newTime !== lastWarningRef.current) {
            HapticFeedbackService.timeBasedWarning(newTime, INITIAL_TIME);
            lastWarningRef.current = newTime;
          }
          return newTime;
        });
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

  useEffect(() => {
    if (timeLeft <= 0) {
      HapticFeedbackService.gameEnd();
      endGame("time");
    }
  }, [timeLeft]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setCanFlip(false);
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);
      
      setTimeout(() => {
        if (firstCard?.symbol === secondCard?.symbol) {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isMatched: true }
                : card
            )
          );
          setScore(s => s + 2);
          HapticFeedbackService.correctAnswer();
          
          const matchedCount = cards.filter(c => c.isMatched).length + 2;
          if (matchedCount === cards.length) {
            setTimeout(() => {
              if (currentRound + 1 >= TOTAL_ROUNDS) {
                HapticFeedbackService.gameEnd();
                endGame("finished");
              } else {
                HapticFeedbackService.levelUp();
                setGameState('roundComplete');
                setTimeout(() => {
                  setCurrentRound(r => r + 1);
                }, 2000);
              }
            }, 500);
          }
        } else {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isFlipped: false }
                : card
            )
          );
          HapticFeedbackService.wrongAnswer();
        }
        
        setFlippedCards([]);
        setCanFlip(true);
      }, 1200);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      HapticFeedbackService.cancel();
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

    HapticFeedbackService.cardFlip();

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
  const totalPairsInGame = cards.filter(c => c.isMatched).length / 2;
  
  navigation.navigate("MemoryResults" as any, {
    score,                      // Raw score (2 points per matched pair)
    totalQuestions: TOTAL_ROUNDS * 6,  // Total possible pairs across all rounds
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
    HapticFeedbackService.gameStart();
  };

  const handlePause = () => {
    setIsRunning(false);
    HapticFeedbackService.buttonPress();
  };

  const handleResume = () => {
    setIsRunning(true);
    HapticFeedbackService.buttonPress();
  };

  const progressPercent = Math.min(100, ((currentRound) / TOTAL_ROUNDS) * 100);
  const matchedPairs = cards.filter(c => c.isMatched).length / 2;
  const totalPairs = cards.length / 2;

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center justify-between px-5 pt-10 pb-4"
        style={{ backgroundColor: PALETTE.lightPink }}
      >
        <TouchableOpacity
          onPress={() => {
            HapticFeedbackService.buttonPress();
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
            <Text className="text-base font-semibold text-gray-600">Time</Text>
            <Text className="text-xl font-bold" style={{ color: timeLeft < 60 ? PALETTE.red : PALETTE.teal }}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View className="items-center mr-2">
            <Text className="text-base font-semibold text-gray-600">Score</Text>
            <Text className="text-xl font-bold" style={{ color: PALETTE.teal }}>
              {score}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-600">Moves</Text>
            <Text className="text-xl font-bold" style={{ color: PALETTE.orange }}>
              {moves}
            </Text>
          </View>
        </View>

        <View style={{ width: 44 }}>
          {gameState === 'start' ? (
            <View style={{ width: 44 }} />
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

      <View className="justify-center flex-1 px-5">
        {gameState === 'start' && (
          <View
            className="p-6 mb-8 border-2 shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-4xl font-bold text-center" style={{ color: PALETTE.teal }}>
              Memory Cards
            </Text>
            <Text className="mb-6 text-xl text-center text-gray-700 leading-7">
              Find matching pairs by tapping cards. Complete 3 rounds with friendly themes!
            </Text>
            <TouchableOpacity
              className="px-10 py-5 rounded-2xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={handleStart}
            >
              <Text className="text-2xl font-semibold text-white text-center">Start Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'roundComplete' && (
          <View
            className="p-6 mb-8 border-2 shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
              ✓ Round {currentRound + 1} Complete!
            </Text>
            <Text className="text-xl text-center text-gray-600">
              Get ready for the next round...
            </Text>
          </View>
        )}

        {gameState === 'playing' && (
          <View
            className="p-5 mb-6 border-2 shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>
              Round {currentRound + 1} - Find {totalPairs} pairs
            </Text>
            <Text className="mb-4 text-lg text-center text-gray-600">
              Matches: {matchedPairs}/{totalPairs}
            </Text>

            <View className="flex-row flex-wrap justify-center gap-3">
              {cards.map((card) => {
                const isFlipped = card.isFlipped || card.isMatched;
                return (
                  <TouchableOpacity
                    key={card.id}
                    className="items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: isFlipped ? PALETTE.lightTeal : PALETTE.orange,
                      borderWidth: 3,
                      borderColor: card.isMatched ? PALETTE.teal : PALETTE.orange,
                      width: 80,
                      height: 80,
                      margin: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                    onPress={() => handleCardPress(card.id)}
                    disabled={!canFlip || !isRunning}
                  >
                    <Text className="text-4xl">
                      {isFlipped ? card.symbol : '?'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View className="items-center">
          <Text className="mb-3 text-xl font-semibold text-gray-600">
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
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
  },
});