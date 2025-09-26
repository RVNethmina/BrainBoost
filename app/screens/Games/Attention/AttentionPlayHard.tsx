// app/src/screens/Games/Attention/AttentionPlayHard.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from "react-native";

type AttentionPlayHardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AttentionPlayHard"
>;

const INITIAL_TIME = 300; // 5 minutes
const TOTAL_ROUNDS = 15;
const GRID_SIZE = 20; // 4x5 grid for hard level
const TARGET_COUNT = 4; // Number of targets per round
const ROUND_TIME_LIMIT = 15; // 15 seconds per round

const COMPLEX_PATTERNS = [
  { symbol: '◆', color: '#EF4444', name: 'red diamond' },
  { symbol: '◆', color: '#10B981', name: 'green diamond' },
  { symbol: '◆', color: '#3B82F6', name: 'blue diamond' },
  { symbol: '●', color: '#EF4444', name: 'red circle' },
  { symbol: '●', color: '#10B981', name: 'green circle' },
  { symbol: '●', color: '#3B82F6', name: 'blue circle' },
  { symbol: '■', color: '#EF4444', name: 'red square' },
  { symbol: '■', color: '#10B981', name: 'green square' },
  { symbol: '■', color: '#3B82F6', name: 'blue square' },
  { symbol: '▲', color: '#F59E0B', name: 'orange triangle' },
];

type GridItem = {
  id: number;
  pattern: typeof COMPLEX_PATTERNS[0];
  isTarget: boolean;
  isSelected: boolean;
  position: { row: number, col: number };
};

const AttentionPlayHard: React.FC = () => {
  const navigation = useNavigation<AttentionPlayHardNavigationProp>();
  
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [roundTimeLeft, setRoundTimeLeft] = useState<number>(ROUND_TIME_LIMIT);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [gameState, setGameState] = useState<'start' | 'showing' | 'playing' | 'feedback' | 'timeout'>('start');
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [targetPattern, setTargetPattern] = useState<typeof COMPLEX_PATTERNS[0] | null>(null);
  const [targetsFound, setTargetsFound] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [correctSelections, setCorrectSelections] = useState<number>(0);
  const [totalSelections, setTotalSelections] = useState<number>(0);
  const [missedRounds, setMissedRounds] = useState<number>(0);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate grid for current round
  const generateGrid = (round: number): { items: GridItem[], target: typeof COMPLEX_PATTERNS[0] } => {
    const target = COMPLEX_PATTERNS[round % COMPLEX_PATTERNS.length];
    
    // Create more challenging distractors (similar colors or shapes)
    const distractors = COMPLEX_PATTERNS.filter(p => 
      p.color !== target.color || p.symbol !== target.symbol
    );
    
    // Add some similar distractors for extra challenge
    const similarDistractors = COMPLEX_PATTERNS.filter(p => 
      (p.color === target.color && p.symbol !== target.symbol) ||
      (p.color !== target.color && p.symbol === target.symbol)
    );
    
    const allDistractors = [...distractors, ...similarDistractors];
    
    // Create grid items
    const items: GridItem[] = [];
    let targetCount = 0;
    
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      
      // Decide if this should be a target
      const shouldBeTarget = targetCount < TARGET_COUNT && 
        (Math.random() < 0.25 || (GRID_SIZE - i) <= (TARGET_COUNT - targetCount));
      
      let pattern: typeof COMPLEX_PATTERNS[0];
      if (shouldBeTarget) {
        pattern = target;
        targetCount++;
      } else {
        // Use random distractor with bias toward similar ones for difficulty
        const usesSimilar = Math.random() < 0.4;
        const distractorPool = usesSimilar && similarDistractors.length > 0 
          ? similarDistractors 
          : allDistractors;
        pattern = distractorPool[Math.floor(Math.random() * distractorPool.length)];
      }
      
      items.push({
        id: i,
        pattern,
        isTarget: shouldBeTarget,
        isSelected: false,
        position: { row, col }
      });
    }
    
    // Ensure we have exactly TARGET_COUNT targets
    while (targetCount < TARGET_COUNT) {
      const randomIndex = Math.floor(Math.random() * GRID_SIZE);
      if (!items[randomIndex].isTarget) {
        items[randomIndex].pattern = target;
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
      setTargetPattern(target);
      setTargetsFound(0);
      setRoundTimeLeft(ROUND_TIME_LIMIT);
      
      if (currentRound === 0) {
        setGameState('start');
      } else {
        setGameState('showing');
        setTimeout(() => {
          setGameState('playing');
          setRoundStartTime(Date.now());
        }, 1500); // Shorter preview for hard mode
      }
    }
  }, [currentRound]);

  // Main timer effect
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

  // Round timer effect
  useEffect(() => {
    if (gameState === 'playing' && isRunning && roundTimeLeft > 0) {
      if (roundIntervalRef.current) clearInterval(roundIntervalRef.current);
      roundIntervalRef.current = setInterval(() => {
        setRoundTimeLeft((t) => {
          if (t <= 1) {
            setGameState('timeout');
            setMissedRounds(prev => prev + 1);
            setTimeout(() => {
              if (currentRound + 1 >= TOTAL_ROUNDS) {
                endGame("finished");
              } else {
                setCurrentRound(r => r + 1);
              }
            }, 1500);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    if (gameState !== 'playing' && roundIntervalRef.current) {
      clearInterval(roundIntervalRef.current);
      roundIntervalRef.current = null;
    }

    return () => {
      if (roundIntervalRef.current) {
        clearInterval(roundIntervalRef.current);
        roundIntervalRef.current = null;
      }
    };
  }, [gameState, isRunning, roundTimeLeft]);

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
      }, 1000); // Faster transitions for hard mode
    }
  }, [targetsFound, gameState, currentRound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (roundIntervalRef.current) {
        clearInterval(roundIntervalRef.current);
        roundIntervalRef.current = null;
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
      setScore(s => s + 20); // Higher points for hard difficulty
      setReactionTimes(prev => [...prev, reactionTime]);
      Vibration.vibrate(100);
    } else {
      // Wrong selection
      setScore(s => Math.max(0, s - 5)); // Larger penalty for hard
      Vibration.vibrate([50, 50, 50]);
    }
  };

  const endGame = (reason: "time" | "finished") => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (roundIntervalRef.current) {
      clearInterval(roundIntervalRef.current);
      roundIntervalRef.current = null;
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
      gameType: 'speed_challenge',
      level: 3,
      difficulty: 'hard',
      accuracy,
      avgReactionTime,
      totalSelections,
      correctSelections,
      missedRounds
    } as any);
  };

  const handleStart = () => {
    setIsRunning(true);
    setGameState('showing');
    setTimeout(() => {
      setGameState('playing');
      setRoundStartTime(Date.now());
    }, 1500);
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

        <View className="flex-row items-center gap-3">
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
              Speed Challenge
            </Text>
            <Text className="mb-6 text-lg text-center text-gray-600">
              Fast-paced attention training! Find targets quickly while avoiding similar distractors. Each round has a 15-second time limit.
            </Text>
            <TouchableOpacity
              className="px-8 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={handleStart}
            >
              <Text className="text-xl font-semibold text-white text-center">Start Challenge</Text>
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
              Find all instances of this target:
            </Text>
            
            {targetPattern && (
              <View 
                className="items-center justify-center p-6 mb-4 rounded-2xl"
                style={{ backgroundColor: PALETTE.lightTeal }}
              >
                <Text style={{ fontSize: 50, color: targetPattern.color }}>
                  {targetPattern.symbol}
                </Text>
                <Text className="mt-2 text-lg font-semibold" style={{ color: PALETTE.teal }}>
                  {targetPattern.name}
                </Text>
              </View>
            )}
            
            <Text className="text-center text-gray-600">
              Find {TARGET_COUNT} targets in 15 seconds!
            </Text>
          </View>
        )}

        {gameState === 'playing' && (
          <View
            className="p-4 mb-6 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-bold" style={{ color: PALETTE.teal }}>
                  Find:
                </Text>
                {targetPattern && (
                  <View className="flex-row items-center gap-1">
                    <Text style={{ fontSize: 20, color: targetPattern.color }}>
                      {targetPattern.symbol}
                    </Text>
                  </View>
                )}
              </View>
              <View className="items-center">
                <Text className="text-lg text-gray-600">
                  Found: {targetsFound}/{TARGET_COUNT}
                </Text>
                <Text className="text-sm font-bold" style={{ 
                  color: roundTimeLeft <= 5 ? PALETTE.red : PALETTE.orange 
                }}>
                  Time: {roundTimeLeft}s
                </Text>
              </View>
            </View>

            {/* Grid */}
            <View className="flex-row flex-wrap justify-center gap-1">
              {gridItems.map((item) => {
                const isCorrectTarget = item.isTarget && item.isSelected;
                const isWrongSelection = !item.isTarget && item.isSelected;
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    className="items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: isCorrectTarget 
                        ? '#D1FAE5' 
                        : isWrongSelection 
                        ? '#FEE2E2' 
                        : '#F9FAFB',
                      borderWidth: 1,
                      borderColor: isCorrectTarget 
                        ? '#059669' 
                        : isWrongSelection 
                        ? '#DC2626' 
                        : '#E5E7EB',
                      width: 55,
                      height: 55,
                      margin: 1,
                      opacity: item.isSelected ? 0.8 : 1,
                    }}
                    onPress={() => handleItemPress(item.id)}
                    disabled={!isRunning || item.isSelected}
                  >
                    <Text style={{ fontSize: 20, color: item.pattern.color }}>
                      {item.pattern.symbol}
                    </Text>
                    {item.isSelected && (
                      <View className="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 items-center justify-center">
                        <Text className="text-xs" style={{ color: isCorrectTarget ? '#059669' : '#DC2626' }}>
                          {isCorrectTarget ? '✓' : '✗'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {totalSelections > 0 && (
              <View className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
                <Text className="text-center text-gray-600">
                  Accuracy: {accuracy}% • Avg RT: {reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a,b) => a+b, 0)/reactionTimes.length) : 0}ms
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
              {targetsFound === TARGET_COUNT ? "Perfect Speed!" : `Found ${targetsFound}/${TARGET_COUNT}`}
            </Text>
            
            <Text className="text-center text-gray-600">
              {targetsFound === TARGET_COUNT 
                ? "Lightning fast attention!" 
                : "Keep pushing your focus speed!"}
            </Text>
          </View>
        )}

        {gameState === 'timeout' && (
          <View
            className="p-6 mb-8 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.red }}
          >
            <Text className="mb-4 text-2xl font-bold text-center" style={{ color: PALETTE.red }}>
              Time's Up!
            </Text>
            <Text className="text-center text-gray-600">
              Moving to next round...
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
                { width: `${progressPercent}%`, backgroundColor: PALETTE.red },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default AttentionPlayHard;

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