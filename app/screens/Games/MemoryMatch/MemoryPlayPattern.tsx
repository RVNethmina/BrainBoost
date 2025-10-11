// app/src/screens/Games/MemoryMatch/MemoryPlayPattern.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { HapticFeedbackService } from "../../../services/HapticFeedbackService";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext"; // Add this import

type MemoryPlayPatternNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel1"
>;

const INITIAL_TIME = 240; // 4 minutes (increased from 3)
const TOTAL_ROUNDS = 8;
const COLORS = [PALETTE.teal, PALETTE.orange, PALETTE.red, '#9333EA', '#059669', '#DC2626'];

const MemoryPlayPattern: React.FC = () => {
  const navigation = useNavigation<MemoryPlayPatternNavigationProp>();
  // Add settings hook
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';
  
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

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;

  // Generate pattern - IMPROVED for elderly (slower progression)
  const generatePattern = (round: number): number[] => {
    const length = Math.min(3 + Math.floor(round / 3), 6); // Slower: 3->4->5->6 max
    const pattern: number[] = [];
    for (let i = 0; i < length; i++) {
      pattern.push(Math.floor(Math.random() * 6));
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
      setAttempt(0);
    }
  }, [currentRound]);

  // Timer effect with haptic warnings
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          const newTime = t - 1;
          // Haptic time warnings for elderly users
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

  // Show pattern sequence - IMPROVED with haptic
  useEffect(() => {
    if (gameState === 'showing') {
      let index = 0;
      const showNext = () => {
        if (index < currentPattern.length) {
          setFlashingIndex(currentPattern[index]);
          HapticFeedbackService.cardFlip(); // Haptic for each pattern step
          setTimeout(() => {
            setFlashingIndex(-1);
            setTimeout(() => {
              index++;
              showNext();
            }, 400); // Slower for elderly (was 300)
          }, 700); // Longer flash (was 600)
        } else {
          setTimeout(() => {
            setGameState('input');
            HapticFeedbackService.buttonPress(); // Ready signal
          }, 600);
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

    HapticFeedbackService.selection(); // Haptic on press
    const newInput = [...userInput, colorIndex];
    setUserInput(newInput);

    // Check if pattern is complete
    if (newInput.length === currentPattern.length) {
      const isCorrect = JSON.stringify(newInput) === JSON.stringify(currentPattern);
      
      if (isCorrect) {
        setScore(s => s + 1);
        HapticFeedbackService.correctAnswer(); // Success haptic
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
        // Allow one retry per round
        if (attempt === 0) {
          setAttempt(1);
          setUserInput([]);
          HapticFeedbackService.warning(); // Retry haptic
          setGameState('showing');
        } else {
          HapticFeedbackService.wrongAnswer(); // Failed haptic
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
    const percentageScore = (score / TOTAL_ROUNDS) * 100;
    HapticFeedbackService.scoreBasedFeedback(percentageScore);
    
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
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pt-10 pb-4"
        style={{ backgroundColor: headerBg }}
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
          <Text className="text-2xl" style={{ color: textColor }}>←</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-4">
          <View className="items-center mr-4">
            <Text 
              className="text-base font-semibold"
              style={{ fontSize: 16 * fontScale, color: isDark ? '#ccc' : PALETTE.darkGray }}
            >
              Time
            </Text>
            <Text 
              className="text-2xl font-bold" 
              style={{ 
                fontSize: 24 * fontScale,
                color: timeLeft < 30 ? PALETTE.red : PALETTE.teal 
              }}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View className="items-center">
            <Text 
              className="text-base font-semibold"
              style={{ fontSize: 16 * fontScale, color: isDark ? '#ccc' : PALETTE.darkGray }}
            >
              Score
            </Text>
            <Text 
              className="text-2xl font-bold" 
              style={{ 
                fontSize: 24 * fontScale,
                color: PALETTE.teal 
              }}
            >
              {score}
            </Text>
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
          className="p-6 mb-8 border-2 shadow-sm rounded-2xl"
          style={{ 
            backgroundColor: cardBg, 
            borderColor: PALETTE.lightTeal,
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10
          }}
        >
          {gameState === 'start' && (
            <View className="items-center">
              <Text 
                className="mb-4 text-4xl font-bold text-center" 
                style={{ 
                  fontSize: 36 * fontScale,
                  color: PALETTE.teal 
                }}
              >
                Pattern Memory
              </Text>
              <Text 
                className="mb-6 text-xl text-center leading-7"
                style={{ 
                  fontSize: 20 * fontScale,
                  color: textColor 
                }}
              >
                Watch the colors light up, then tap them in the same order!
              </Text>
              <TouchableOpacity
                className="px-10 py-5 rounded-2xl"
                style={{ backgroundColor: PALETTE.teal }}
                onPress={handleStart}
              >
                <Text 
                  className="text-2xl font-semibold text-white"
                  style={{ fontSize: 24 * fontScale }}
                >
                  Start Game
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'showing' && (
            <View className="items-center">
              <Text 
                className="mb-4 text-3xl font-bold text-center" 
                style={{ 
                  fontSize: 32 * fontScale,
                  color: PALETTE.teal 
                }}
              >
                👀 Watch Carefully
              </Text>
              <Text 
                className="mb-6 text-xl text-center"
                style={{ 
                  fontSize: 20 * fontScale,
                  color: textColor 
                }}
              >
                Pattern Length: {patternLength} colors
              </Text>
            </View>
          )}

          {gameState === 'input' && (
            <View className="items-center">
              <Text 
                className="mb-4 text-3xl font-bold text-center" 
                style={{ 
                  fontSize: 32 * fontScale,
                  color: PALETTE.teal 
                }}
              >
                ✋ Your Turn
              </Text>
              <Text 
                className="mb-6 text-xl text-center"
                style={{ 
                  fontSize: 20 * fontScale,
                  color: textColor 
                }}
              >
                {userInput.length}/{patternLength} {attempt > 0 && "⚠️ (Second Try)"}
              </Text>
            </View>
          )}

          {gameState === 'feedback' && (
            <View className="items-center">
              <Text 
                className="mb-4 text-3xl font-bold text-center" 
                style={{ 
                  fontSize: 32 * fontScale,
                  color: isPatternComplete ? PALETTE.teal : PALETTE.orange 
                }}
              >
                {isPatternComplete ? "✓ Correct!" : "↻ Try Again!"}
              </Text>
            </View>
          )}

          {/* Color Grid - LARGER for elderly */}
          <View className="flex-row flex-wrap justify-center gap-4 mt-6">
            {COLORS.map((color, index) => {
              const isFlashing = flashingIndex === index;
              const isDisabled = gameState !== 'input' || !isRunning;
              
              return (
                <TouchableOpacity
                  key={index}
                  className="items-center justify-center rounded-3xl"
                  style={{
                    backgroundColor: isFlashing ? (isDark ? '#1a1a1a' : '#FFFFFF') : color,
                    borderWidth: isFlashing ? 6 : 3,
                    borderColor: color,
                    height: 100, // Larger (was 80)
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

        {/* Progress - LARGER text */}
        <View className="items-center">
          <Text 
            className="mb-3 text-xl font-semibold"
            style={{ 
              fontSize: 20 * fontScale,
              color: textColor 
            }}
          >
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
    height: 16, // Thicker (was 12)
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
  },
});