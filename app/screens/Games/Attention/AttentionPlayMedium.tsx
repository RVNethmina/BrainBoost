// app/src/screens/Games/Attention/AttentionPlayMedium.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext";
import {
  FatigueDetectionService,
  FatigueLevel,
} from "@/app/services/fatigueDetectionService";

type AttentionPlayMediumNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AttentionPlayMedium"
>;

const INITIAL_TIME = 240; // 4 minutes
const TOTAL_ROUNDS = 12;
const GRID_SIZE = 16; // 4x4 grid for medium level
const TARGET_COUNT = 3; // Number of targets per round

const COLOR_SHAPES = [
  { color: '#EF4444', shape: '●', name: 'red circle' },
  { color: '#10B981', shape: '●', name: 'green circle' },
  { color: '#3B82F6', shape: '●', name: 'blue circle' },
  { color: '#F59E0B', shape: '●', name: 'yellow circle' },
  { color: '#EF4444', shape: '■', name: 'red square' },
  { color: '#10B981', shape: '■', name: 'green square' },
  { color: '#3B82F6', shape: '■', name: 'blue square' },
  { color: '#F59E0B', shape: '■', name: 'yellow square' },
];

type GridItem = {
  id: number;
  colorShape: typeof COLOR_SHAPES[0];
  isTarget: boolean;
  isSelected: boolean;
  position: { row: number, col: number };
};

const AttentionPlayMedium: React.FC = () => {
  const navigation = useNavigation<AttentionPlayMediumNavigationProp>();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';
  
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [gameState, setGameState] = useState<'start' | 'showing' | 'playing' | 'feedback' | 'fatigueWarning'>('start');
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [targetShape, setTargetShape] = useState<typeof COLOR_SHAPES[0] | null>(null);
  const [targetsFound, setTargetsFound] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [correctSelections, setCorrectSelections] = useState<number>(0);
  const [totalSelections, setTotalSelections] = useState<number>(0);
  
  // Fatigue Detection States
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>('none');
  const [fatigueMessage, setFatigueMessage] = useState<string>('');
  const [showFatigueWarning, setShowFatigueWarning] = useState<boolean>(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fatigueServiceRef = useRef<FatigueDetectionService | null>(null);
  const fatigueCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
  const secondaryTextColor = isDark ? '#ccc' : PALETTE.gray;

  // Initialize fatigue service on mount
  useEffect(() => {
    fatigueServiceRef.current = new FatigueDetectionService();
    return () => {
      if (fatigueCheckIntervalRef.current) {
        clearInterval(fatigueCheckIntervalRef.current);
      }
    };
  }, []);

  // Generate grid for current round
  const generateGrid = (round: number): { items: GridItem[], target: typeof COLOR_SHAPES[0] } => {
    const target = COLOR_SHAPES[round % COLOR_SHAPES.length];
    const distractors = COLOR_SHAPES.filter(s => 
      s.color !== target.color || s.shape !== target.shape
    );
    
    const items: GridItem[] = [];
    let targetCount = 0;
    
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      
      const shouldBeTarget = targetCount < TARGET_COUNT && 
        (Math.random() < 0.25 || (GRID_SIZE - i) <= (TARGET_COUNT - targetCount));
      
      let colorShape: typeof COLOR_SHAPES[0];
      if (shouldBeTarget) {
        colorShape = target;
        targetCount++;
      } else {
        colorShape = distractors[Math.floor(Math.random() * distractors.length)];
      }
      
      items.push({
        id: i,
        colorShape,
        isTarget: shouldBeTarget,
        isSelected: false,
        position: { row, col }
      });
    }
    
    while (targetCount < TARGET_COUNT) {
      const randomIndex = Math.floor(Math.random() * GRID_SIZE);
      if (!items[randomIndex].isTarget) {
        items[randomIndex].colorShape = target;
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
      setTargetShape(target);
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

  // Fatigue check effect - runs every 3 seconds during gameplay
  useEffect(() => {
    if (gameState === 'playing' && isRunning && fatigueServiceRef.current) {
      if (fatigueCheckIntervalRef.current) {
        clearInterval(fatigueCheckIntervalRef.current);
      }

      fatigueCheckIntervalRef.current = setInterval(() => {
        const analysis = fatigueServiceRef.current!.analyzeFatigue();
        setFatigueLevel(analysis.fatigueLevel);
        setFatigueMessage(analysis.recommendation);

        if (analysis.shouldRecommendBreak && !showFatigueWarning) {
          setShowFatigueWarning(true);
          setGameState('fatigueWarning');
          setIsRunning(false);
          
          setTimeout(() => {
            setShowFatigueWarning(false);
            setGameState('playing');
            setIsRunning(true);
          }, 5000);
        }
      }, 3000);
    }

    return () => {
      if (fatigueCheckIntervalRef.current) {
        clearInterval(fatigueCheckIntervalRef.current);
      }
    };
  }, [gameState, isRunning, showFatigueWarning]);

  // Time up effect
  useEffect(() => {
    if (timeLeft <= 0) {
      endGame("time");
    }
  }, [timeLeft]);

  // Check if round is complete
  useEffect(() => {
    if (gameState === 'playing' && targetsFound === TARGET_COUNT) {
      const accuracy = (correctSelections / Math.max(1, totalSelections)) * 100;
      const avgRT = reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 0;

      if (fatigueServiceRef.current) {
        fatigueServiceRef.current.addPerformanceData(
          currentRound,
          accuracy,
          avgRT
        );
      }

      setGameState('feedback');
      setTimeout(() => {
        if (currentRound + 1 >= TOTAL_ROUNDS) {
          endGame("finished");
        } else {
          setCurrentRound(r => r + 1);
        }
      }, 1500);
    }
  }, [targetsFound, gameState, currentRound, correctSelections, totalSelections, reactionTimes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (fatigueCheckIntervalRef.current) {
        clearInterval(fatigueCheckIntervalRef.current);
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

    setGridItems(prev => 
      prev.map(g => 
        g.id === itemId ? { ...g, isSelected: true } : g
      )
    );

    if (item.isTarget) {
      setTargetsFound(prev => prev + 1);
      setCorrectSelections(prev => prev + 1);
      setScore(s => s + 15);
      setReactionTimes(prev => [...prev, reactionTime]);
      Vibration.vibrate(100);
    } else {
      setScore(s => Math.max(0, s - 3));
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
      gameType: 'color_focus',
      level: 2,
      difficulty: 'medium',
      accuracy,
      avgReactionTime,
      totalSelections,
      correctSelections,
      fatigueLevel,
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

  const getFatigueColor = () => {
    switch (fatigueLevel) {
      case 'high': return PALETTE.red;
      case 'moderate': return PALETTE.orange;
      case 'early': return '#F59E0B';
      default: return PALETTE.teal;
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pt-10 pb-4"
        style={{ backgroundColor: headerBg }}
      >
        <TouchableOpacity
          onPress={() => {
            handlePause();
            navigation.goBack();
          }}
          className="items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
        >
          <Text className="text-2xl" style={{ color: PALETTE.darkGray }}>←</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-4">
          <View className="items-center">
            <Text 
              className="text-sm" 
              style={{ 
                fontSize: 12 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Time
            </Text>
            <Text 
              className="font-bold" 
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View className="items-center">
            <Text 
              className="text-sm" 
              style={{ 
                fontSize: 12 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Score
            </Text>
            <Text 
              className="font-bold" 
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              {score}
            </Text>
          </View>
          <View className="items-center">
            <Text 
              className="text-sm" 
              style={{ 
                fontSize: 12 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Round
            </Text>
            <Text 
              className="font-bold" 
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              {currentRound + 1}/{TOTAL_ROUNDS}
            </Text>
          </View>
        </View>

        {fatigueLevel !== 'none' && (
          <View 
            className="items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: getFatigueColor() }}
          >
            <Text className="text-lg">
              {fatigueLevel === 'high' ? '😴' : fatigueLevel === 'moderate' ? '😐' : '😊'}
            </Text>
          </View>
        )}

        <View style={{ width: fatigueLevel !== 'none' ? 0 : 44 }}>
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
        {gameState === 'fatigueWarning' && (
          <View
            className="p-6 mb-8 border-2 shadow-sm rounded-2xl"
            style={{ 
              backgroundColor: cardBg, 
              borderColor: getFatigueColor() 
            }}
          >
            <Text 
              className="mb-4 font-bold text-center text-3xl"
              style={{ color: getFatigueColor() }}
            >
              {fatigueLevel === 'high' ? '💙 Rest Recommended' : '⚠️ Fatigue Detected'}
            </Text>
            <Text 
              className="mb-6 text-center" 
              style={{ 
                fontSize: 18 * fontScale,
                color: textColor 
              }}
            >
              {fatigueMessage}
            </Text>
            <Text 
              className="text-center text-sm" 
              style={{ 
                fontSize: 14 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Resuming in a moment...
            </Text>
          </View>
        )}

        {gameState === 'start' && (
          <View
            className="p-6 mb-8 border-2 shadow-sm rounded-2xl"
            style={{ 
              backgroundColor: cardBg, 
              borderColor: PALETTE.lightTeal 
            }}
          >
            <Text 
              className="mb-4 font-bold text-center" 
              style={{ 
                fontSize: 28 * fontScale,
                color: PALETTE.teal 
              }}
            >
              Color Focus
            </Text>
            <Text 
              className="mb-6 text-center" 
              style={{ 
                fontSize: 18 * fontScale,
                color: textColor 
              }}
            >
              Find all items that match the target color and shape. The game adapts to keep you comfortable!
            </Text>
            <TouchableOpacity
              className="px-8 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={handleStart}
            >
              <Text 
                className="font-semibold text-center text-white" 
                style={{ fontSize: 20 * fontScale }}
              >
                Start Game
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'showing' && (
          <View
            className="p-6 mb-8 border-2 shadow-sm rounded-2xl"
            style={{ 
              backgroundColor: cardBg, 
              borderColor: PALETTE.lightTeal 
            }}
          >
            <Text 
              className="mb-4 font-bold text-center" 
              style={{ 
                fontSize: 24 * fontScale,
                color: PALETTE.teal 
              }}
            >
              Round {currentRound + 1}
            </Text>
            <Text 
              className="mb-4 text-center" 
              style={{ 
                fontSize: 18 * fontScale,
                color: textColor 
              }}
            >
              Find all instances of this target:
            </Text>
            
            {targetShape && (
              <View 
                className="items-center justify-center p-8 mb-4 rounded-2xl"
                style={{ backgroundColor: PALETTE.lightTeal }}
              >
                <Text style={{ fontSize: 60, color: targetShape.color }}>
                  {targetShape.shape}
                </Text>
                <Text 
                  className="mt-2 font-semibold" 
                  style={{ 
                    fontSize: 18 * fontScale,
                    color: PALETTE.teal 
                  }}
                >
                  {targetShape.name}
                </Text>
              </View>
            )}
            
            <Text 
              className="text-center" 
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              Look for {TARGET_COUNT} of these items
            </Text>
          </View>
        )}

        {gameState === 'playing' && (
          <View
            className="p-4 mb-6 border-2 shadow-sm rounded-2xl"
            style={{ 
              backgroundColor: cardBg, 
              borderColor: PALETTE.lightTeal 
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Text 
                  className="font-bold" 
                  style={{ 
                    fontSize: 18 * fontScale,
                    color: PALETTE.teal 
                  }}
                >
                  Find:
                </Text>
                {targetShape && (
                  <View className="flex-row items-center gap-1">
                    <Text style={{ fontSize: 24, color: targetShape.color }}>
                      {targetShape.shape}
                    </Text>
                    <Text 
                      className="text-sm" 
                      style={{ 
                        fontSize: 14 * fontScale,
                        color: PALETTE.teal 
                      }}
                    >
                      ({targetShape.name})
                    </Text>
                  </View>
                )}
              </View>
              <Text 
                style={{ 
                  fontSize: 18 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                Found: {targetsFound}/{TARGET_COUNT}
              </Text>
            </View>

            {/* Grid */}
            <View className="flex-row flex-wrap justify-center gap-1">
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
                        : isDark ? '#3a3a3a' : '#F9FAFB',
                      borderWidth: 2,
                      borderColor: isCorrectTarget 
                        ? '#059669' 
                        : isWrongSelection 
                        ? '#DC2626' 
                        : isDark ? '#555' : '#E5E7EB',
                      width: 65,
                      height: 65,
                      margin: 1,
                      opacity: item.isSelected ? 0.8 : 1,
                    }}
                    onPress={() => handleItemPress(item.id)}
                    disabled={!isRunning || item.isSelected}
                  >
                    <Text style={{ fontSize: 24, color: item.colorShape.color }}>
                      {item.colorShape.shape}
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
              <View 
                className="mt-4 p-3 rounded-xl" 
                style={{ backgroundColor: isDark ? '#3a3a3a' : '#F9FAFB' }}
              >
                <View className="flex-row justify-between items-center">
                  <Text 
                    className="text-center" 
                    style={{ 
                      fontSize: 16 * fontScale,
                      color: textColor 
                    }}
                  >
                    Accuracy: {accuracy}% ({correctSelections}/{totalSelections})
                  </Text>
                  {fatigueLevel !== 'none' && (
                    <View 
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: getFatigueColor() + '20' }}
                    >
                      <Text 
                        style={{ 
                          fontSize: 12 * fontScale,
                          color: getFatigueColor(),
                          fontWeight: '600'
                        }}
                      >
                        {fatigueLevel === 'high' ? 'High Fatigue' : fatigueLevel === 'moderate' ? 'Moderate Fatigue' : 'Early Fatigue'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {gameState === 'feedback' && (
          <View
            className="p-6 mb-8 border-2 shadow-sm rounded-2xl"
            style={{ 
              backgroundColor: cardBg, 
              borderColor: PALETTE.lightTeal 
            }}
          >
            <Text 
              className="mb-4 font-bold text-center" 
              style={{ 
                fontSize: 24 * fontScale,
                color: targetsFound === TARGET_COUNT ? PALETTE.teal : PALETTE.orange 
              }}
            >
              {targetsFound === TARGET_COUNT ? "Excellent Focus!" : `Found ${targetsFound}/${TARGET_COUNT}`}
            </Text>
            
            <Text 
              className="text-center" 
              style={{ 
                fontSize: 18 * fontScale,
                color: textColor 
              }}
            >
              {targetsFound === TARGET_COUNT 
                ? "Your attention skills are sharp!" 
                : "Keep training your focus abilities!"}
            </Text>
          </View>
        )}

        {/* Progress */}
        <View className="items-center">
          <Text 
            className="mb-2" 
            style={{ 
              fontSize: 18 * fontScale,
              color: textColor 
            }}
          >
            Round: {Math.min(currentRound + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { 
                  width: `${progressPercent}%`, 
                  backgroundColor: PALETTE.orange 
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default AttentionPlayMedium;

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