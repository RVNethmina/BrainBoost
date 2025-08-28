// app/src/screens/Games/MemoryMatch/MemoryPlayPattern.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from "react-native";

type MemoryPlayPatternNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel1"
>;

const INITIAL_TIME = 180; // 3 minutes
const TOTAL_ROUNDS = 8;
const SHOW_PATTERN_TIME = 2000; // 2 seconds to show pattern
const COLORS = [PALETTE.teal, PALETTE.orange, PALETTE.red, '#9333EA', '#059669', '#DC2626'];

type PatternRound = {
  pattern: number[];
  userInput: number[];
  completed: boolean;
  correct: boolean;
};

const MemoryPlayPattern: React.FC = () => {
  const navigation = useNavigation<MemoryPlayPatternNavigationProp>();
  
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [gameState, setGameState] = useState<'start' | 'showing' | 'input' | 'feedback'>('start');
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [flashingIndex, setFlashingIndex] = useState<number>(-1);
  const [attempt, setAttempt] = useState<number>(0);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate pattern based on round (progressive difficulty)
  const generatePattern = (round: number): number[] => {
    const length = Math.min(3 + Math.floor(round / 2), 8); // Start with 3, max 8
    const pattern: number[] = [];
    for (let i = 0; i < length; i++) {
      pattern.push(Math.floor(Math.random() * 6)); // 6 colors
    }
    return pattern;
  };

  // Initialize game
  useEffect(() => {
    if (currentRound < TOTAL_ROUNDS) {
      const pattern = generatePattern(currentRound);
      setCurrentPattern(pattern);
      setUserInput([]);
      setGameState('showing');
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

  // Show pattern sequence
  useEffect(() => {
    if (gameState === 'showing') {
      let index = 0;
      const showNext = () => {
        if (index < currentPattern.length) {
          setFlashingIndex(currentPattern[index]);
          setTimeout(() => {
            setFlashingIndex(-1);
            setTimeout(() => {
              index++;
              showNext();
            }, 300);
          }, 600);
        } else {
          setTimeout(() => {
            setGameState('input');
          }, 500);
        }
      };
      showNext();
    }
  }, [gameState, currentPattern]);

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

  const handleColorPress = (colorIndex: number) => {
    if (gameState !== 'input' || !isRunning) return;

    const newInput = [...userInput, colorIndex];
    setUserInput(newInput);
    
    // Provide immediate feedback
    Vibration.vibrate(50);

    // Check if pattern is complete
    if (newInput.length === currentPattern.length) {
      const isCorrect = JSON.stringify(newInput) === JSON.stringify(currentPattern);
      
      if (isCorrect) {
        setScore(s => s + 1);
        setGameState('feedback');
        setTimeout(() => {
          if (currentRound + 1 >= TOTAL_ROUNDS) {
            endGame("finished");
          } else {
            setCurrentRound(r => r + 1);
          }
        }, 1000);
      } else {
        // Allow one retry per round
        if (attempt === 0) {
          setAttempt(1);
          setUserInput([]);
          setGameState('showing'); // Show pattern again
        } else {
          setGameState('feedback');
          setTimeout(() => {
            if (currentRound + 1 >= TOTAL_ROUNDS) {
              endGame("finished");
            } else {
              setCurrentRound(r => r + 1);
              setAttempt(0);
            }
          }, 1000);
        }
      }
    }
  };

  const endGame = (reason: "time" | "finished") => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const timeTaken = INITIAL_TIME - Math.max(0, timeLeft);
    navigation.navigate("MemoryResults" as any, {
      score,
      totalQuestions: TOTAL_ROUNDS,
      timeTaken,
      endedBy: reason,
      gameType: 'pattern',
      level: 1,
      difficulty: 'easy'
    } as any);
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const progressPercent = Math.min(100, ((currentRound) / TOTAL_ROUNDS) * 100);
  const patternLength = currentPattern.length;
  const isPatternComplete = JSON.stringify(userInput) === JSON.stringify(currentPattern);

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
          <View className="items-center mr-4">
            <Text className="text-sm text-gray-600">Time</Text>
            <Text className="text-xl font-bold">{formatTime(timeLeft)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-600">Score</Text>
            <Text className="text-xl font-bold">{score}</Text>
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
        <View
          className="p-5 mb-8 border shadow-sm rounded-2xl"
          style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
        >
          {gameState === 'start' && (
            <View className="items-center">
              <Text className="mb-4 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
                Pattern Memory
              </Text>
              <Text className="mb-6 text-lg text-center text-gray-600">
                Watch the pattern and repeat it back!
              </Text>
              <TouchableOpacity
                className="px-8 py-4 rounded-2xl"
                style={{ backgroundColor: PALETTE.teal }}
                onPress={handleStart}
              >
                <Text className="text-xl font-semibold text-white">Start Game</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'showing' && (
            <View className="items-center">
              <Text className="mb-4 text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>
                Watch the Pattern
              </Text>
              <Text className="mb-6 text-lg text-center text-gray-600">
                Pattern Length: {patternLength}
              </Text>
            </View>
          )}

          {gameState === 'input' && (
            <View className="items-center">
              <Text className="mb-4 text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>
                Repeat the Pattern
              </Text>
              <Text className="mb-6 text-lg text-center text-gray-600">
                {userInput.length}/{patternLength} {attempt > 0 && "(Retry)"}
              </Text>
            </View>
          )}

          {gameState === 'feedback' && (
            <View className="items-center">
              <Text className="mb-4 text-2xl font-bold text-center" style={{ 
                color: isPatternComplete ? PALETTE.teal : PALETTE.red 
              }}>
                {isPatternComplete ? "Correct!" : "Try Again!"}
              </Text>
            </View>
          )}

          {/* Color Grid */}
          <View className="grid grid-cols-3 gap-4 mt-4">
            {COLORS.map((color, index) => {
              const isFlashing = flashingIndex === index;
              const isDisabled = gameState !== 'input' || !isRunning;
              
              return (
                <TouchableOpacity
                  key={index}
                  className="items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: isFlashing ? '#FFFFFF' : color,
                    borderWidth: isFlashing ? 4 : 2,
                    borderColor: color,
                    height: 80,
                    opacity: isDisabled ? 0.6 : 1,
                  }}
                  onPress={() => handleColorPress(index)}
                  disabled={isDisabled}
                >
                  <Text className="text-2xl font-bold text-white">
                    {isFlashing ? '⚡' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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

export default MemoryPlayPattern;

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