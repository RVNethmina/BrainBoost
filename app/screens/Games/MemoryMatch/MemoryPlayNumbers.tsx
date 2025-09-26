// app/src/screens/Games/MemoryMatch/MemoryPlayNumbers.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from "react-native";

type MemoryPlayNumbersNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel3"
>;

const INITIAL_TIME = 240; // 4 minutes
const TOTAL_ROUNDS = 10;
const SHOW_TIME = 3000; // 3 seconds to study numbers

const MemoryPlayNumbers: React.FC = () => {
  const navigation = useNavigation<MemoryPlayNumbersNavigationProp>();
  
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

  // Generate numbers based on round (progressive difficulty)
  const generateNumbers = (round: number): number[] => {
    const digitCount = Math.min(3 + Math.floor(round / 2), 7); // Start with 3, max 7 digits
    const numbers: number[] = [];
    
    for (let i = 0; i < digitCount; i++) {
      // First digit can't be 0 to avoid confusion
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

  // Show timer effect
  useEffect(() => {
    if (gameState === 'showing' && showTimeLeft > 0) {
      if (showIntervalRef.current) clearInterval(showIntervalRef.current);
      showIntervalRef.current = setInterval(() => {
        setShowTimeLeft((t) => {
          if (t <= 1) {
            setGameState('input');
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

  // Time up effect
  useEffect(() => {
    if (timeLeft <= 0) {
      endGame("time");
    }
  }, [timeLeft]);

  // Cleanup on unmount
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
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNumberInput = (digit: string) => {
    if (gameState !== 'input' || !isRunning) return;
    
    if (digit === 'clear') {
      setUserInput('');
      return;
    }
    
    if (digit === 'backspace') {
      setUserInput(prev => prev.slice(0, -1));
      return;
    }
    
    // Don't allow input longer than the target
    if (userInput.length >= currentNumbers.length) return;
    
    setUserInput(prev => prev + digit);
  };

  const submitAnswer = () => {
    if (gameState !== 'input' || !isRunning || userInput.length === 0) return;

    const correctAnswer = currentNumbers.join('');
    const isCorrect = userInput === correctAnswer;
    
    if (isCorrect) {
      const points = currentNumbers.length * 10; // 10 points per digit
      setScore(s => s + points);
      Vibration.vibrate(100);
    } else {
      Vibration.vibrate([100, 50, 100]);
    }
    
    setGameState('feedback');
    
    setTimeout(() => {
      if (currentRound + 1 >= TOTAL_ROUNDS) {
        endGame("finished");
      } else {
        setCurrentRound(r => r + 1);
      }
    }, 2000);
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
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const progressPercent = Math.min(100, ((currentRound) / TOTAL_ROUNDS) * 100);
  const correctAnswer = currentNumbers.join('');
  const isCorrect = userInput === correctAnswer;

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
        <View
          className="p-6 mb-8 border shadow-sm rounded-2xl"
          style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
        >
          {gameState === 'start' && (
            <View className="items-center">
              <Text className="mb-4 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
                Number Memory
              </Text>
              <Text className="mb-6 text-lg text-center text-gray-600">
                Study the numbers, then type them back in the correct order!
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
                Study These Numbers
              </Text>
              <Text className="mb-4 text-lg text-center text-gray-600">
                Time left: {showTimeLeft}s
              </Text>
              
              {/* Large number display */}
              <View 
                className="items-center justify-center p-8 mb-6 rounded-2xl"
                style={{ backgroundColor: PALETTE.lightTeal, minHeight: 120 }}
              >
                <Text 
                  className="font-bold text-center"
                  style={{ fontSize: 48, color: PALETTE.teal, letterSpacing: 8 }}
                >
                  {currentNumbers.join(' ')}
                </Text>
              </View>
              
              <Text className="text-center text-gray-600">
                {currentNumbers.length} digit{currentNumbers.length !== 1 ? 's' : ''} to remember
              </Text>
            </View>
          )}

          {gameState === 'input' && (
            <View className="items-center">
              <Text className="mb-4 text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>
                Enter the Numbers
              </Text>
              <Text className="mb-4 text-lg text-center text-gray-600">
                Type what you remember ({userInput.length}/{currentNumbers.length})
              </Text>
              
              {/* Input display */}
              <View 
                className="items-center justify-center p-6 mb-6 rounded-2xl"
                style={{ backgroundColor: '#F9FAFB', minHeight: 80, width: '100%' }}
              >
                <Text 
                  className="font-bold text-center"
                  style={{ 
                    fontSize: 36, 
                    color: userInput.length > 0 ? PALETTE.teal : '#9CA3AF',
                    letterSpacing: 6
                  }}
                >
                  {userInput || 'Enter numbers...'}
                </Text>
              </View>

              {/* Number pad */}
              <View className="w-full mb-4">
                <View className="flex-row justify-center gap-2 mb-3">
                  {[1, 2, 3].map(num => (
                    <TouchableOpacity
                      key={num}
                      className="items-center justify-center rounded-xl"
                      style={{ backgroundColor: PALETTE.lightTeal, width: 70, height: 60 }}
                      onPress={() => handleNumberInput(num.toString())}
                    >
                      <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className="flex-row justify-center gap-2 mb-3">
                  {[4, 5, 6].map(num => (
                    <TouchableOpacity
                      key={num}
                      className="items-center justify-center rounded-xl"
                      style={{ backgroundColor: PALETTE.lightTeal, width: 70, height: 60 }}
                      onPress={() => handleNumberInput(num.toString())}
                    >
                      <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className="flex-row justify-center gap-2 mb-3">
                  {[7, 8, 9].map(num => (
                    <TouchableOpacity
                      key={num}
                      className="items-center justify-center rounded-xl"
                      style={{ backgroundColor: PALETTE.lightTeal, width: 70, height: 60 }}
                      onPress={() => handleNumberInput(num.toString())}
                    >
                      <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View className="flex-row justify-center gap-2 mb-4">
                  <TouchableOpacity
                    className="items-center justify-center rounded-xl"
                    style={{ backgroundColor: PALETTE.orange, width: 70, height: 60 }}
                    onPress={() => handleNumberInput('clear')}
                  >
                    <Text className="text-lg font-bold text-white">Clear</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="items-center justify-center rounded-xl"
                    style={{ backgroundColor: PALETTE.lightTeal, width: 70, height: 60 }}
                    onPress={() => handleNumberInput('0')}
                  >
                    <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                      0
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="items-center justify-center rounded-xl"
                    style={{ backgroundColor: PALETTE.red, width: 70, height: 60 }}
                    onPress={() => handleNumberInput('backspace')}
                  >
                    <Text className="text-lg font-bold text-white">←</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className="px-8 py-4 rounded-2xl"
                style={{ 
                  backgroundColor: userInput.length > 0 ? PALETTE.teal : '#CCCCCC',
                  width: '100%'
                }}
                onPress={submitAnswer}
                disabled={userInput.length === 0}
              >
                <Text className="text-xl font-semibold text-white text-center">
                  Submit Answer
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'feedback' && (
            <View className="items-center">
              <Text className="mb-4 text-2xl font-bold text-center" style={{ 
                color: isCorrect ? PALETTE.teal : PALETTE.red 
              }}>
                {isCorrect ? "Correct!" : "Not Quite!"}
              </Text>
              
              <View className="p-4 mb-4 rounded-2xl" style={{ backgroundColor: '#F9FAFB', width: '100%' }}>
                <Text className="mb-2 text-center text-gray-600">Correct answer:</Text>
                <Text 
                  className="font-bold text-center"
                  style={{ fontSize: 32, color: PALETTE.teal, letterSpacing: 6 }}
                >
                  {correctAnswer}
                </Text>
              </View>
              
              {userInput !== correctAnswer && (
                <View className="p-4 rounded-2xl" style={{ backgroundColor: '#FEE2E2', width: '100%' }}>
                  <Text className="mb-2 text-center text-gray-600">Your answer:</Text>
                  <Text 
                    className="font-bold text-center"
                    style={{ fontSize: 32, color: PALETTE.red, letterSpacing: 6 }}
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