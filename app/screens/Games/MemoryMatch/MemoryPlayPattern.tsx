// app/screens/Games/MemoryMatch/MemoryPlayPattern.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { HapticFeedbackService } from "../../../services/HapticFeedbackService";
import { generateDailySeed, SeededRandom } from "../../../utils/SeededRandom";
import { auth } from '@/config/firebaseConfig';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MemoryPlayPatternNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel1"
>;

const INITIAL_TIME = 240;
const TOTAL_ROUNDS = 8;
const COLORS = [PALETTE.teal, PALETTE.orange, PALETTE.red, '#9333EA', '#059669', '#DC2626'];

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
  const lastWarningRef = useRef<number>(0);
  const randomGen = useRef<SeededRandom | null>(null);

  // Initialize seeded random generator with user ID
  useEffect(() => {
    const userId = auth.currentUser?.uid || 'guest';
    const seed = generateDailySeed(userId);
    randomGen.current = new SeededRandom(seed);
    console.log(`Pattern game initialized with seed for user: ${userId}`);
  }, []);

  // Generate pattern with seeded randomness
  const generatePattern = (round: number): number[] => {
    const length = Math.min(3 + Math.floor(round / 3), 6);
    const pattern: number[] = [];
    const rng = randomGen.current!;
    
    for (let i = 0; i < length; i++) {
      pattern.push(rng.nextInt(6));
    }
    return pattern;
  };

  // Initialize game - auto-start removed
  useEffect(() => {
    if (currentRound < TOTAL_ROUNDS && randomGen.current) {
      const pattern = generatePattern(currentRound);
      setCurrentPattern(pattern);
      setUserInput([]);
      setAttempt(0);
      
      if (currentRound === 0) {
        setGameState('start');
      } else {
        setGameState('showing');
      }
    }
  }, [currentRound]);

  // Timer effect
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

  // Time up effect
  useEffect(() => {
    if (timeLeft <= 0) {
      HapticFeedbackService.gameEnd();
      endGame("time");
    }
  }, [timeLeft]);

  // Show pattern sequence
  useEffect(() => {
    if (gameState === 'showing' && isRunning) {
      let index = 0;
      const showNext = () => {
        if (index < currentPattern.length) {
          setFlashingIndex(currentPattern[index]);
          HapticFeedbackService.cardFlip();
          setTimeout(() => {
            setFlashingIndex(-1);
            setTimeout(() => {
              index++;
              showNext();
            }, 400);
          }, 700);
        } else {
          setTimeout(() => {
            setGameState('input');
            HapticFeedbackService.buttonPress();
          }, 600);
        }
      };
      showNext();
    }
  }, [gameState, currentPattern, isRunning]);

  // Cleanup
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

  const handleColorPress = (colorIndex: number) => {
    if (gameState !== 'input' || !isRunning) return;

    HapticFeedbackService.selection();
    const newInput = [...userInput, colorIndex];
    setUserInput(newInput);

    if (newInput.length === currentPattern.length) {
      const isCorrect = JSON.stringify(newInput) === JSON.stringify(currentPattern);
      
      if (isCorrect) {
        setScore(s => s + 1);
        HapticFeedbackService.correctAnswer();
        setGameState('feedback');
        setTimeout(() => {
          if (currentRound + 1 >= TOTAL_ROUNDS) {
            HapticFeedbackService.gameEnd();
            endGame("finished");
          } else {
            HapticFeedbackService.levelUp();
            setCurrentRound(r => r + 1);
          }
        }, 1500);
      } else {
        if (attempt === 0) {
          setAttempt(1);
          setUserInput([]);
          HapticFeedbackService.warning();
          setGameState('showing');
        } else {
          HapticFeedbackService.wrongAnswer();
          setGameState('feedback');
          setTimeout(() => {
            if (currentRound + 1 >= TOTAL_ROUNDS) {
              HapticFeedbackService.gameEnd();
              endGame("finished");
            } else {
              setCurrentRound(r => r + 1);
            }
          }, 1500);
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
    score,                      // Raw score (1 point per correct pattern)
    totalQuestions: TOTAL_ROUNDS,  // 8 rounds total
    timeTaken,
    endedBy: reason,
    gameType: 'pattern',
    level: 1,
    difficulty: 'easy'
  } as any);
};

  const handleStart = () => {
    setIsRunning(true);
    setGameState('showing');
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
          <View className="items-center mr-4">
            <Text className="text-base font-semibold text-gray-600">Time</Text>
            <Text className="text-2xl font-bold" style={{ color: timeLeft < 30 ? PALETTE.red : PALETTE.teal }}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-600">Score</Text>
            <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
              {score}
            </Text>
          </View>
        </View>

        {/* Pause/Resume button only shown after game starts */}
        <View style={{ width: 44 }}>
          {gameState !== 'start' && (
            isRunning ? (
              <TouchableOpacity onPress={handlePause}>
                <Text className="text-2xl">⏸️</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleResume}>
                <Text className="text-2xl">▶️</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Game Area */}
      <View className="justify-center flex-1 px-5">
        <View
          className="p-6 mb-8 border-2 shadow-sm rounded-2xl"
          style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
        >
          {gameState === 'start' && (
            <View className="items-center">
              <Text className="mb-4 text-4xl font-bold text-center" style={{ color: PALETTE.teal }}>
                Pattern Memory
              </Text>
              <Text className="mb-6 text-xl text-center text-gray-700 leading-7">
                Watch the colors light up, then tap them in the same order!
              </Text>
              <TouchableOpacity
                className="px-10 py-5 rounded-2xl"
                style={{ backgroundColor: PALETTE.teal }}
                onPress={handleStart}
              >
                <Text className="text-2xl font-semibold text-white">Start Game</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'showing' && (
            <View className="items-center">
              <Text className="mb-4 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
                👀 Watch Carefully
              </Text>
              <Text className="mb-6 text-xl text-center text-gray-600">
                Pattern Length: {patternLength} colors
              </Text>
            </View>
          )}

          {gameState === 'input' && (
            <View className="items-center">
              <Text className="mb-4 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
                ✋ Your Turn
              </Text>
              <Text className="mb-6 text-xl text-center text-gray-600">
                {userInput.length}/{patternLength} {attempt > 0 && "⚠️ (Second Try)"}
              </Text>
            </View>
          )}

          {gameState === 'feedback' && (
            <View className="items-center">
              <Text className="mb-4 text-3xl font-bold text-center" style={{ 
                color: isPatternComplete ? PALETTE.teal : PALETTE.orange 
              }}>
                {isPatternComplete ? "✓ Correct!" : "↻ Try Again!"}
              </Text>
            </View>
          )}

          {/* Color Grid */}
          <View className="flex-row flex-wrap justify-center gap-4 mt-6">
            {COLORS.map((color, index) => {
              const isFlashing = flashingIndex === index;
              const isDisabled = gameState !== 'input' || !isRunning;
              
              return (
                <TouchableOpacity
                  key={index}
                  className="items-center justify-center rounded-3xl"
                  style={{
                    backgroundColor: isFlashing ? '#FFFFFF' : color,
                    borderWidth: isFlashing ? 6 : 3,
                    borderColor: color,
                    height: 100,
                    width: '28%',
                    opacity: isDisabled ? 0.6 : 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                  onPress={() => handleColorPress(index)}
                  disabled={isDisabled}
                >
                  <Text className="text-4xl font-bold">
                    {isFlashing ? '⚡' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Progress */}
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

export default MemoryPlayPattern;

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