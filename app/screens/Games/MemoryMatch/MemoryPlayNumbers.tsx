// app/screens/Games/MemoryMatch/MemoryPlayNumbers.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { HapticFeedbackService } from "../../../services/HapticFeedbackService";
import { generateDailySeed, SeededRandom } from "../../../utils/SeededRandom";
import { auth } from '@/config/firebaseConfig';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MemoryPlayNumbersNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel3"
>;

const INITIAL_TIME = 300;
const TOTAL_ROUNDS = 8;
const SHOW_TIME = 4000;

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
  const lastWarningRef = useRef<number>(0);
  const randomGen = useRef<SeededRandom | null>(null);

  useEffect(() => {
    const userId = auth.currentUser?.uid || 'guest';
    const seed = generateDailySeed(userId);
    randomGen.current = new SeededRandom(seed);
    console.log(`Numbers game initialized with seed for user: ${userId}`);
  }, []);

  const generateNumbers = (round: number): number[] => {
    const digitCount = Math.min(3 + Math.floor(round / 3), 6);
    const numbers: number[] = [];
    const rng = randomGen.current!;
    
    for (let i = 0; i < digitCount; i++) {
      if (i === 0) {
        numbers.push(rng.nextInt(9) + 1);
      } else {
        numbers.push(rng.nextInt(10));
      }
    }
    
    return numbers;
  };

  useEffect(() => {
    if (currentRound < TOTAL_ROUNDS && randomGen.current) {
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
    if (gameState === 'showing' && showTimeLeft > 0 && isRunning) {
      if (showIntervalRef.current) clearInterval(showIntervalRef.current);
      showIntervalRef.current = setInterval(() => {
        setShowTimeLeft((t) => {
          if (t <= 1) {
            setGameState('input');
            HapticFeedbackService.buttonPress();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    if ((gameState !== 'showing' || !isRunning) && showIntervalRef.current) {
      clearInterval(showIntervalRef.current);
      showIntervalRef.current = null;
    }

    return () => {
      if (showIntervalRef.current) {
        clearInterval(showIntervalRef.current);
        showIntervalRef.current = null;
      }
    };
  }, [gameState, showTimeLeft, isRunning]);

  useEffect(() => {
    if (timeLeft <= 0) {
      HapticFeedbackService.gameEnd();
      endGame("time");
    }
  }, [timeLeft]);

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
    
    HapticFeedbackService.selection();
    
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
      HapticFeedbackService.correctAnswer();
    } else {
      HapticFeedbackService.wrongAnswer();
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
    }, 2500);
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
    score,                      // Raw score (10-60 points per correct answer)
    totalQuestions: TOTAL_ROUNDS,  // 8 rounds total
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
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-600">Time</Text>
            <Text className="text-xl font-bold" style={{ color: timeLeft < 60 ? PALETTE.red : PALETTE.teal }}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-600">Score</Text>
            <Text className="text-xl font-bold" style={{ color: PALETTE.teal }}>
              {score}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-600">Round</Text>
            <Text className="text-xl font-bold" style={{ color: PALETTE.orange }}>
              {currentRound + 1}/{TOTAL_ROUNDS}
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
        <View
          className="p-6 mb-8 border-2 shadow-sm rounded-2xl"
          style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
        >
          {gameState === 'start' && (
            <View className="items-center">
              <Text className="mb-4 text-4xl font-bold text-center" style={{ color: PALETTE.teal }}>
                Number Memory
              </Text>
              <Text className="mb-6 text-xl text-center text-gray-700 leading-7">
                Study the numbers carefully, then type them back in the correct order!
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
                👀 Study These Numbers
              </Text>
              <Text className="mb-4 text-xl text-center font-semibold" style={{ color: PALETTE.orange }}>
                Time left: {showTimeLeft}s
              </Text>
              
              <View 
                className="items-center justify-center p-8 mb-6 rounded-2xl"
                style={{ backgroundColor: PALETTE.lightTeal, minHeight: 140 }}
              >
                <Text 
                  className="font-bold text-center"
                  style={{ fontSize: 56, color: PALETTE.teal, letterSpacing: 12 }}
                >
                  {currentNumbers.join(' ')}
                </Text>
              </View>
              
              <Text className="text-xl text-center text-gray-600">
                {currentNumbers.length} digit{currentNumbers.length !== 1 ? 's' : ''} to remember
              </Text>
            </View>
          )}

          {gameState === 'input' && (
            <View className="items-center">
              <Text className="mb-4 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
                ✏️ Enter the Numbers
              </Text>
              <Text className="mb-4 text-xl text-center text-gray-600">
                Type what you remember ({userInput.length}/{currentNumbers.length})
              </Text>
              
              <View 
                className="items-center justify-center p-6 mb-6 rounded-2xl"
                style={{ backgroundColor: '#F9FAFB', minHeight: 100, width: '100%' }}
              >
                <Text 
                  className="font-bold text-center"
                  style={{ 
                    fontSize: 44, 
                    color: userInput.length > 0 ? PALETTE.teal : '#9CA3AF',
                    letterSpacing: 8
                  }}
                >
                  {userInput || 'Tap numbers...'}
                </Text>
              </View>

              <View className="w-full mb-4">
                <View className="flex-row justify-center gap-3 mb-3">
                  {[1, 2, 3].map(num => (
                    <TouchableOpacity
                      key={num}
                      className="items-center justify-center rounded-2xl"
                      style={{ backgroundColor: PALETTE.lightTeal, width: 80, height: 70 }}
                      onPress={() => handleNumberInput(num.toString())}
                    >
                      <Text className="text-3xl font-bold" style={{ color: PALETTE.teal }}>
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
                      style={{ backgroundColor: PALETTE.lightTeal, width: 80, height: 70 }}
                      onPress={() => handleNumberInput(num.toString())}
                    >
                      <Text className="text-3xl font-bold" style={{ color: PALETTE.teal }}>
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
                      style={{ backgroundColor: PALETTE.lightTeal, width: 80, height: 70 }}
                      onPress={() => handleNumberInput(num.toString())}
                    >
                      <Text className="text-3xl font-bold" style={{ color: PALETTE.teal }}>
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
                    <Text className="text-base font-bold text-white">Clear</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="items-center justify-center rounded-2xl"
                    style={{ backgroundColor: PALETTE.lightTeal, width: 80, height: 70 }}
                    onPress={() => handleNumberInput('0')}
                  >
                    <Text className="text-3xl font-bold" style={{ color: PALETTE.teal }}>
                      0
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="items-center justify-center rounded-2xl"
                    style={{ backgroundColor: PALETTE.red, width: 80, height: 70 }}
                    onPress={() => handleNumberInput('backspace')}
                  >
                    <Text className="text-xl font-bold text-white">←</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className="px-8 py-5 rounded-2xl"
                style={{ 
                  backgroundColor: userInput.length > 0 ? PALETTE.teal : '#CCCCCC',
                  width: '100%'
                }}
                onPress={submitAnswer}
                disabled={userInput.length === 0}
              >
                <Text className="text-2xl font-semibold text-white text-center">
                  Submit Answer
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'feedback' && (
            <View className="items-center">
              <Text className="mb-4 text-3xl font-bold text-center" style={{ 
                color: isCorrect ? PALETTE.teal : PALETTE.red 
              }}>
                {isCorrect ? "✓ Correct!" : "✗ Not Quite!"}
              </Text>
              
              <View className="p-5 mb-4 rounded-2xl" style={{ backgroundColor: '#F9FAFB', width: '100%' }}>
                <Text className="mb-2 text-lg text-center text-gray-600">Correct answer:</Text>
                <Text 
                  className="font-bold text-center"
                  style={{ fontSize: 40, color: PALETTE.teal, letterSpacing: 8 }}
                >
                  {correctAnswer}
                </Text>
              </View>
              
              {userInput !== correctAnswer && (
                <View className="p-5 rounded-2xl" style={{ backgroundColor: '#FEE2E2', width: '100%' }}>
                  <Text className="mb-2 text-lg text-center text-gray-600">Your answer:</Text>
                  <Text 
                    className="font-bold text-center"
                    style={{ fontSize: 40, color: PALETTE.red, letterSpacing: 8 }}
                  >
                    {userInput || 'No answer'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

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