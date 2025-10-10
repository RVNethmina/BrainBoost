// app/src/screens/Games/MemoryMatch/MemoryPlayNumbers.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { HapticFeedbackService } from "../../../services/HapticFeedbackService";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext";

type MemoryPlayNumbersNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel3"
>;

const INITIAL_TIME = 300; // 5 minutes (increased from 4)
const TOTAL_ROUNDS = 8; // Reduced from 10 for elderly
const SHOW_TIME = 4000; // 4 seconds (increased from 3)

const MemoryPlayNumbers: React.FC = () => {
  const navigation = useNavigation<MemoryPlayNumbersNavigationProp>();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';
  
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [gameState, setGameState] = useState<'start' | 'showing' | 'input' | 'feedback'>('start');
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [showTimeLeft, setShowTimeLeft] = useState<number>(0);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const showIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastWarningRef = useRef<number>(0);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const secondaryTextColor = isDark ? '#ccc' : PALETTE.gray;
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
  const inputBg = isDark ? '#3a3a3a' : '#F9FAFB';
  const feedbackBg = isDark ? '#3a3a3a' : '#F9FAFB';
  const errorBg = isDark ? '#4a2a2a' : '#FEE2E2';

  // Generate numbers - IMPROVED for elderly (slower progression)
  const generateNumbers = (round: number): number[] => {
    const digitCount = Math.min(3 + Math.floor(round / 3), 6); // Slower: 3->4->5->6 max
    const numbers: number[] = [];
    
    for (let i = 0; i < digitCount; i++) {
      if (i === 0) {
        numbers.push(Math.floor(Math.random() * 9) + 1);
      } else {
        numbers.push(Math.floor(Math.random() * 10));
      }
    }
    
    return numbers;
  };

  // Initialize round
  useEffect(() => {
    if (currentRound < TOTAL_ROUNDS) {
      const numbers = generateNumbers(currentRound);
      setCurrentNumbers(numbers);
      setUserInput('');
      
      if (currentRound === 0) {
        setGameState('start');
      } else {
        setGameState('showing');
        setShowTimeLeft(SHOW_TIME / 1000);
      }
    }
  }, [currentRound]);

  // Timer with haptic warnings
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

  // Show timer
  useEffect(() => {
    if (gameState === 'showing' && showTimeLeft > 0) {
      if (showIntervalRef.current) clearInterval(showIntervalRef.current);
      showIntervalRef.current = setInterval(() => {
        setShowTimeLeft((t) => {
          if (t <= 1) {
            setGameState('input');
            HapticFeedbackService.buttonPress(); // Ready signal
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    if (gameState !== 'showing' && showIntervalRef.current) {
      clearInterval(showIntervalRef.current);
      showIntervalRef.current = null;
    }

    return () => {
      if (showIntervalRef.current) {
        clearInterval(showIntervalRef.current);
        showIntervalRef.current = null;
      }
    };
  }, [gameState, showTimeLeft]);

  // Time up
  useEffect(() => {
    if (timeLeft <= 0) {
      HapticFeedbackService.gameEnd();
      endGame("time");
    }
  }, [timeLeft]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (showIntervalRef.current) {
        clearInterval(showIntervalRef.current);
        showIntervalRef.current = null;
      }
      HapticFeedbackService.cancel();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNumberInput = (digit: string) => {
    if (gameState !== 'input' || !isRunning) return;
    
    HapticFeedbackService.selection(); // Haptic on keypress
    
    if (digit === 'clear') {
      setUserInput('');
      return;
    }
    
    if (digit === 'backspace') {
      setUserInput(prev => prev.slice(0, -1));
      return;
    }
    
    if (userInput.length >= currentNumbers.length) return;
    
    setUserInput(prev => prev + digit);
  };

  const submitAnswer = () => {
    if (gameState !== 'input' || !isRunning || userInput.length === 0) return;

    const correctAnswer = currentNumbers.join('');
    const isCorrect = userInput === correctAnswer;
    
    if (isCorrect) {
      const points = currentNumbers.length * 10;
      setScore(s => s + points);
      HapticFeedbackService.correctAnswer(); // Success haptic
    } else {
      HapticFeedbackService.wrongAnswer(); // Wrong haptic
    }
    
    setGameState('feedback');
    
    setTimeout(() => {
      if (currentRound + 1 >= TOTAL_ROUNDS) {
        HapticFeedbackService.gameEnd();
        endGame("finished");
      } else {
        HapticFeedbackService.levelUp();
        setCurrentRound(r => r + 1);
      }
    }, 2500); // Longer feedback time for elderly
  };

  const endGame = (reason: "time" | "finished") => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (showIntervalRef.current) {
      clearInterval(showIntervalRef.current);
      showIntervalRef.current = null;
    }
    
    const timeTaken = INITIAL_TIME - Math.max(0, timeLeft);
    const maxPossibleScore = TOTAL_ROUNDS * 60; // Approximate max
    const percentageScore = (score / maxPossibleScore) * 100;
    HapticFeedbackService.scoreBasedFeedback(percentageScore);
    
    navigation.navigate("MemoryResults" as any, {
      score,
      totalQuestions: TOTAL_ROUNDS,
      timeTaken,
      endedBy: reason,
      gameType: 'numbers',
      level: 3,
      difficulty: 'hard'
    } as any);
  };

  const handleStart = () => {
    setIsRunning(true);
    setGameState('showing');
    setShowTimeLeft(SHOW_TIME / 1000);
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
  const correctAnswer = currentNumbers.join('');
  const isCorrect = userInput === correctAnswer;

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
          <Text className="text-2xl" style={{ color: PALETTE.darkGray }}>←</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-4">
          <View className="items-center">
            <Text 
              className="font-semibold" 
              style={{ 
                fontSize: 14 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Time
            </Text>
            <Text 
              className="font-bold" 
              style={{ 
                fontSize: 18 * fontScale,
                color: timeLeft < 60 ? PALETTE.red : PALETTE.teal 
              }}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View className="items-center">
            <Text 
              className="font-semibold" 
              style={{ 
                fontSize: 14 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Score
            </Text>
            <Text 
              className="font-bold" 
              style={{ 
                fontSize: 18 * fontScale,
                color: PALETTE.teal 
              }}
            >
              {score}
            </Text>
          </View>
          <View className="items-center">
            <Text 
              className="font-semibold" 
              style={{ 
                fontSize: 14 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Round
            </Text>
            <Text 
              className="font-bold" 
              style={{ 
                fontSize: 18 * fontScale,
                color: PALETTE.orange 
              }}
            >
              {currentRound + 1}/{TOTAL_ROUNDS}
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
          style={{ backgroundColor: cardBg, borderColor: PALETTE.lightTeal }}
        >
          {gameState === 'start' && (
            <View className="items-center">
              <Text 
                className="mb-4 font-bold text-center" 
                style={{ 
                  fontSize: 32 * fontScale,
                  color: PALETTE.teal 
                }}
              >
                Number Memory
              </Text>
              <Text 
                className="mb-6 text-center leading-7" 
                style={{ 
                  fontSize: 20 * fontScale,
                  color: textColor 
                }}
              >
                Study the numbers carefully, then type them back in the correct order!
              </Text>
              <TouchableOpacity
                className="px-10 py-5 rounded-2xl"
                style={{ backgroundColor: PALETTE.teal }}
                onPress={handleStart}
              >
                <Text 
                  className="font-semibold text-white" 
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
                className="mb-4 font-bold text-center" 
                style={{ 
                  fontSize: 28 * fontScale,
                  color: PALETTE.teal 
                }}
              >
                👀 Study These Numbers
              </Text>
              <Text 
                className="mb-4 text-center font-semibold" 
                style={{ 
                  fontSize: 20 * fontScale,
                  color: PALETTE.orange 
                }}
              >
                Time left: {showTimeLeft}s
              </Text>
              
              {/* Large number display */}
              <View 
                className="items-center justify-center p-8 mb-6 rounded-2xl"
                style={{ backgroundColor: isDark ? '#3a5a5a' : PALETTE.lightTeal, minHeight: 140 }}
              >
                <Text 
                  className="font-bold text-center"
                  style={{ 
                    fontSize: 56 * fontScale, 
                    color: PALETTE.teal, 
                    letterSpacing: 12 
                  }}
                >
                  {currentNumbers.join(' ')}
                </Text>
              </View>
              
              <Text 
                className="text-center" 
                style={{ 
                  fontSize: 20 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                {currentNumbers.length} digit{currentNumbers.length !== 1 ? 's' : ''} to remember
              </Text>
            </View>
          )}

          {gameState === 'input' && (
            <View className="items-center">
              <Text 
                className="mb-4 font-bold text-center" 
                style={{ 
                  fontSize: 28 * fontScale,
                  color: PALETTE.teal 
                }}
              >
                ✏️ Enter the Numbers
              </Text>
              <Text 
                className="mb-4 text-center" 
                style={{ 
                  fontSize: 20 * fontScale,
                  color: secondaryTextColor 
                }}
              >
                Type what you remember ({userInput.length}/{currentNumbers.length})
              </Text>
              
              {/* Input display - LARGER */}
              <View 
                className="items-center justify-center p-6 mb-6 rounded-2xl"
                style={{ backgroundColor: inputBg, minHeight: 100, width: '100%' }}
              >
                <Text 
                  className="font-bold text-center"
                  style={{ 
                    fontSize: 44 * fontScale, 
                    color: userInput.length > 0 ? PALETTE.teal : (isDark ? '#6B7280' : '#9CA3AF'),
                    letterSpacing: 8
                  }}
                >
                  {userInput || 'Tap numbers...'}
                </Text>
              </View>

              {/* Number pad - LARGER buttons */}
              <View className="w-full mb-4">
                <View className="flex-row justify-center gap-3 mb-3">
                  {[1, 2, 3].map(num => (
                    <TouchableOpacity
                      key={num}
                      className="items-center justify-center rounded-2xl"
                      style={{ 
                        backgroundColor: isDark ? '#3a5a5a' : PALETTE.lightTeal, 
                        width: 80, 
                        height: 70 
                      }}
                      onPress={() => handleNumberInput(num.toString())}
                    >
                      <Text 
                        className="font-bold" 
                        style={{ 
                          fontSize: 28 * fontScale,
                          color: PALETTE.teal 
                        }}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className="flex-row justify-center gap-3 mb-3">
                  {[4, 5, 6].map(num => (
                    <TouchableOpacity
                      key={num}
                      className="items-center justify-center rounded-2xl"
                      style={{ 
                        backgroundColor: isDark ? '#3a5a5a' : PALETTE.lightTeal, 
                        width: 80, 
                        height: 70 
                      }}
                      onPress={() => handleNumberInput(num.toString())}
                    >
                      <Text 
                        className="font-bold" 
                        style={{ 
                          fontSize: 28 * fontScale,
                          color: PALETTE.teal 
                        }}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className="flex-row justify-center gap-3 mb-3">
                  {[7, 8, 9].map(num => (
                    <TouchableOpacity
                      key={num}
                      className="items-center justify-center rounded-2xl"
                      style={{ 
                        backgroundColor: isDark ? '#3a5a5a' : PALETTE.lightTeal, 
                        width: 80, 
                        height: 70 
                      }}
                      onPress={() => handleNumberInput(num.toString())}
                    >
                      <Text 
                        className="font-bold" 
                        style={{ 
                          fontSize: 28 * fontScale,
                          color: PALETTE.teal 
                        }}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className="flex-row justify-center gap-3 mb-4">
                  <TouchableOpacity
                    className="items-center justify-center rounded-2xl"
                    style={{ backgroundColor: PALETTE.orange, width: 80, height: 70 }}
                    onPress={() => handleNumberInput('clear')}
                  >
                    <Text 
                      className="font-bold text-white" 
                      style={{ fontSize: 16 * fontScale }}
                    >
                      Clear
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="items-center justify-center rounded-2xl"
                    style={{ 
                      backgroundColor: isDark ? '#3a5a5a' : PALETTE.lightTeal, 
                      width: 80, 
                      height: 70 
                    }}
                    onPress={() => handleNumberInput('0')}
                  >
                    <Text 
                      className="font-bold" 
                      style={{ 
                        fontSize: 28 * fontScale,
                        color: PALETTE.teal 
                      }}
                    >
                      0
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="items-center justify-center rounded-2xl"
                    style={{ backgroundColor: PALETTE.red, width: 80, height: 70 }}
                    onPress={() => handleNumberInput('backspace')}
                  >
                    <Text 
                      className="font-bold text-white" 
                      style={{ fontSize: 20 * fontScale }}
                    >
                      ←
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className="px-8 py-5 rounded-2xl"
                style={{ 
                  backgroundColor: userInput.length > 0 ? PALETTE.teal : (isDark ? '#555' : '#CCCCCC'),
                  width: '100%'
                }}
                onPress={submitAnswer}
                disabled={userInput.length === 0}
              >
                <Text 
                  className="font-semibold text-center text-white" 
                  style={{ fontSize: 24 * fontScale }}
                >
                  Submit Answer
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'feedback' && (
            <View className="items-center">
              <Text 
                className="mb-4 font-bold text-center" 
                style={{ 
                  fontSize: 28 * fontScale,
                  color: isCorrect ? PALETTE.teal : PALETTE.red 
                }}
              >
                {isCorrect ? "✓ Correct!" : "✗ Not Quite!"}
              </Text>
              
              <View 
                className="p-5 mb-4 rounded-2xl" 
                style={{ backgroundColor: feedbackBg, width: '100%' }}
              >
                <Text 
                  className="mb-2 text-center" 
                  style={{ 
                    fontSize: 18 * fontScale,
                    color: secondaryTextColor 
                  }}
                >
                  Correct answer:
                </Text>
                <Text 
                  className="font-bold text-center"
                  style={{ 
                    fontSize: 40 * fontScale, 
                    color: PALETTE.teal, 
                    letterSpacing: 8 
                  }}
                >
                  {correctAnswer}
                </Text>
              </View>
              
              {userInput !== correctAnswer && (
                <View 
                  className="p-5 rounded-2xl" 
                  style={{ backgroundColor: errorBg, width: '100%' }}
                >
                  <Text 
                    className="mb-2 text-center" 
                    style={{ 
                      fontSize: 18 * fontScale,
                      color: secondaryTextColor 
                    }}
                  >
                    Your answer:
                  </Text>
                  <Text 
                    className="font-bold text-center"
                    style={{ 
                      fontSize: 40 * fontScale, 
                      color: PALETTE.red, 
                      letterSpacing: 8 
                    }}
                  >
                    {userInput || 'No answer'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Progress */}
        <View className="items-center">
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

export default MemoryPlayNumbers;

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