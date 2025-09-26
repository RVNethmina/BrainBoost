// app/src/screens/Games/Attention/AttentionPlayEasy.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from "react-native";

type AttentionPlayEasyNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AttentionPlayEasy"
>;

const INITIAL_TIME = 180; // 3 minutes
const TOTAL_ROUNDS = 10;
const GRID_SIZE = 12; // 3x4 grid for easy level
const TARGET_COUNT = 2; // Number of targets per round

const SYMBOLS = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'];
const SHAPES = ['●', '■', '▲', '♦', '★', '♠'];

type GridItem = {
  id: number;
  symbol: string;
  isTarget: boolean;
  isSelected: boolean;
  position: { row: number, col: number };
};

const AttentionPlayEasy: React.FC = () => {
  const navigation = useNavigation<AttentionPlayEasyNavigationProp>();
  
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [gameState, setGameState] = useState<'start' | 'showing' | 'playing' | 'feedback'>('start');
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [targetSymbol, setTargetSymbol] = useState<string>('');
  const [targetsFound, setTargetsFound] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [correctSelections, setCorrectSelections] = useState<number>(0);
  const [totalSelections, setTotalSelections] = useState<number>(0);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate grid for current round
  const generateGrid = (round: number): { items: GridItem[], target: string } => {
    const target = SYMBOLS[round % SYMBOLS.length];
    const distractors = SYMBOLS.filter(s => s !== target);
    
    // Create grid items
    const items: GridItem[] = [];
    let targetCount = 0;
    
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      
      // Decide if this should be a target (ensure we have exactly TARGET_COUNT targets)
      const shouldBeTarget = targetCount < TARGET_COUNT && 
        (Math.random() < 0.3 || (GRID_SIZE - i) <= (TARGET_COUNT - targetCount));
      
      let symbol: string;
      if (shouldBeTarget) {
        symbol = target;
        targetCount++;
      } else {
        // Use random distractor
        symbol = distractors[Math.floor(Math.random() * distractors.length)];
      }
      
      items.push({
        id: i,
        symbol,
        isTarget: shouldBeTarget,
        isSelected: false,
        position: { row, col }
      });
    }
    
    // Ensure we have exactly TARGET_COUNT targets
    while (targetCount < TARGET_COUNT) {
      const randomIndex = Math.floor(Math.random() * GRID_SIZE);
      if (!items[randomIndex].isTarget) {
        items[randomIndex].symbol = target;
        items[randomIndex].isTarget = true;
        targetCount++;
      }
    }
    
    return { items, target };
  };

  // Initialize round
  useEffect(() => {
    if (currentRound < TOTAL_ROUNDS) {
      const { items, target } = generateGrid(currentRound);
      setGridItems(items);
      setTargetSymbol(target);
      setTargetsFound(0);
      
      if (currentRound === 0) {
        setGameState('start');
      } else {
        setGameState('showing');
        setTimeout(() => {
          setGameState('playing');
          setRoundStartTime(Date.now());
        }, 2000);
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

  // Check if round is complete
  useEffect(() => {
    if (gameState === 'playing' && targetsFound === TARGET_COUNT) {
      setGameState('feedback');
      setTimeout(() => {
        if (currentRound + 1 >= TOTAL_ROUNDS) {
          endGame("finished");
        } else {
          setCurrentRound(r => r + 1);
        }
      }, 1500);
    }
  }, [targetsFound, gameState, currentRound]);

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

  const handleItemPress = (itemId: number) => {
    if (gameState !== 'playing' || !isRunning) return;

    const item = gridItems.find(g => g.id === itemId);
    if (!item || item.isSelected) return;

    const reactionTime = Date.now() - roundStartTime;
    setTotalSelections(prev => prev + 1);

    // Update grid item
    setGridItems(prev => 
      prev.map(g => 
        g.id === itemId ? { ...g, isSelected: true } : g
      )
    );

    if (item.isTarget) {
      // Correct target found
      setTargetsFound(prev => prev + 1);
      setCorrectSelections(prev => prev + 1);
      setScore(s => s + 10);
      setReactionTimes(prev => [...prev, reactionTime]);
      Vibration.vibrate(100);
    } else {
      // Wrong selection
      setScore(s => Math.max(0, s - 2)); // Small penalty
      Vibration.vibrate([50, 50, 50]);
    }
  };

  const endGame = (reason: "time" | "finished") => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const timeTaken = INITIAL_TIME - Math.max(0, timeLeft);
    const avgReactionTime = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;
    const accuracy = totalSelections > 0 ? Math.round((correctSelections / totalSelections) * 100) : 0;
    
    navigation.navigate("AttentionResults" as any, {
      score,
      totalQuestions: TOTAL_ROUNDS * TARGET_COUNT,
      timeTaken,
      endedBy: reason,
      gameType: 'symbol_search',
      level: 1,
      difficulty: 'easy',
      accuracy,
      avgReactionTime,
      totalSelections,
      correctSelections
    } as any);
  };

  const handleStart = () => {
    setIsRunning(true);
    setGameState('showing');
    setTimeout(() => {
      setGameState('playing');
      setRoundStartTime(Date.now());
    }, 2000);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
    if (gameState === 'playing') {
      setRoundStartTime(Date.now());
    }
  };

  const progressPercent = Math.min(100, ((currentRound) / TOTAL_ROUNDS) * 100);
  const accuracy = totalSelections > 0 ? Math.round((correctSelections / totalSelections) * 100) : 0;

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
          <View className="items-center">
            <Text className="text-sm text-gray-600">Time</Text>
            <Text className="text-lg font-bold">{formatTime(timeLeft)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-600">Score</Text>
            <Text className="text-lg font-bold">{score}</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-600">Round</Text>
            <Text className="text-lg font-bold">{currentRound + 1}/{TOTAL_ROUNDS}</Text>
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
              Symbol Search
            </Text>
            <Text className="mb-6 text-lg text-center text-gray-600">
              Find and tap all target symbols as quickly as possible. You'll see the target symbol at the top of each round.
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

        {gameState === 'showing' && (
          <View
            className="p-6 mb-8 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>
              Round {currentRound + 1}
            </Text>
            <Text className="mb-4 text-lg text-center text-gray-600">
              Find all instances of this symbol:
            </Text>
            
            <View 
              className="items-center justify-center p-8 mb-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.lightTeal }}
            >
              <Text style={{ fontSize: 60 }}>{targetSymbol}</Text>
            </View>
            
            <Text className="text-center text-gray-600">
              Look for {TARGET_COUNT} of these symbols
            </Text>
          </View>
        )}

        {gameState === 'playing' && (
          <View
            className="p-4 mb-6 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold" style={{ color: PALETTE.teal }}>
                Find: {targetSymbol}
              </Text>
              <Text className="text-lg text-gray-600">
                Found: {targetsFound}/{TARGET_COUNT}
              </Text>
            </View>

            {/* Grid */}
            <View className="flex-row flex-wrap justify-center gap-2">
              {gridItems.map((item) => {
                const isCorrectTarget = item.isTarget && item.isSelected;
                const isWrongSelection = !item.isTarget && item.isSelected;
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    className="items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: isCorrectTarget 
                        ? '#D1FAE5' 
                        : isWrongSelection 
                        ? '#FEE2E2' 
                        : PALETTE.lightTeal,
                      borderWidth: 2,
                      borderColor: isCorrectTarget 
                        ? '#059669' 
                        : isWrongSelection 
                        ? '#DC2626' 
                        : PALETTE.teal,
                      width: 70,
                      height: 70,
                      margin: 2,
                      opacity: item.isSelected ? 0.8 : 1,
                    }}
                    onPress={() => handleItemPress(item.id)}
                    disabled={!isRunning || item.isSelected}
                  >
                    <Text style={{ fontSize: 28 }}>
                      {item.symbol}
                    </Text>
                    {item.isSelected && (
                      <View className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-sm" style={{ color: isCorrectTarget ? '#059669' : '#DC2626' }}>
                          {isCorrectTarget ? '✓' : '✗'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {totalSelections > 0 && (
              <View className="mt-4 p-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
                <Text className="text-center text-gray-600">
                  Accuracy: {accuracy}% ({correctSelections}/{totalSelections})
                </Text>
              </View>
            )}
          </View>
        )}

        {gameState === 'feedback' && (
          <View
            className="p-6 mb-8 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-2xl font-bold text-center" style={{ 
              color: targetsFound === TARGET_COUNT ? PALETTE.teal : PALETTE.orange 
            }}>
              {targetsFound === TARGET_COUNT ? "Perfect!" : `Found ${targetsFound}/${TARGET_COUNT}`}
            </Text>
            
            <Text className="text-center text-gray-600">
              {targetsFound === TARGET_COUNT 
                ? "You found all the targets!" 
                : "Keep practicing your attention skills!"}
            </Text>
          </View>
        )}

        {/* Progress */}
        <View className="items-center">
          <Text className="mb-2 text-lg text-gray-600">
            Round: {Math.min(currentRound + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
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

export default AttentionPlayEasy;

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