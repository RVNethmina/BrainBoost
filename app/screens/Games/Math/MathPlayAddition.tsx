// Optimized MathPlayAddition.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, Text, TouchableOpacity, View } from "react-native";

type MathPlayScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MathPlayAddition"
>;

const INITIAL_TIME = 120;
const TOTAL_QUESTIONS = 10;
const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type Question = {
  a: number;
  b: number;
  correctAnswer: number;
  options: number[];
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeAdditionQuestion(minOperand = 1, maxOperand = 50): Question {
  const a = randInt(minOperand, maxOperand);
  const b = randInt(minOperand, maxOperand);
  const correct = a + b;

  const options = new Set<number>();
  options.add(correct);

  while (options.size < 4) {
    const offsetChoice = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];
    const offset = offsetChoice[Math.floor(Math.random() * offsetChoice.length)];
    const candidate = correct + offset;
    if (candidate >= 0) options.add(candidate);
  }

  const optionsArr = shuffle(Array.from(options));
  return { a, b, correctAnswer: correct, options: optionsArr };
}

const MathPlayAddition: React.FC = () => {
  const navigation = useNavigation<MathPlayScreenNavigationProp>();
  
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [showStartHint, setShowStartHint] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Memoize question generation
  const generateQuestions = useCallback(() => {
    const q: Question[] = Array.from({ length: TOTAL_QUESTIONS }, () =>
      makeAdditionQuestion(1, 50)
    );
    setQuestionList(q);
  }, []);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  // Pulse animation for time warning
  useEffect(() => {
    if (timeLeft <= 30 && timeLeft > 0 && isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [timeLeft, isRunning]);

  // Optimized timer with better cleanup
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft]);

  // End game effects
  useEffect(() => {
    if (timeLeft <= 0 && isRunning) {
      endQuiz("time");
    }
  }, [timeLeft, isRunning]);

  useEffect(() => {
    if (currentQuestionIndex >= TOTAL_QUESTIONS && isRunning) {
      endQuiz("finished");
    }
  }, [currentQuestionIndex, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const animateQuestion = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAnswer = async (selected: number) => {
    if (!isRunning || selectedOption !== null) return;

    const current = questionList[currentQuestionIndex];
    if (!current) return;

    setSelectedOption(selected);
    const isCorrect = selected === current.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    // Haptic feedback
    try {
      if (Haptics?.notificationAsync) {
        await Haptics.notificationAsync(
          isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
        );
      }
    } catch (error) {
      console.log('Haptic feedback not available');
    }

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Brief pause to show feedback
    setTimeout(() => {
      setSelectedOption(null);
      setFeedback(null);
      setCurrentQuestionIndex((i) => i + 1);
      animateQuestion();
    }, 800);
  };

  const endQuiz = useCallback((reason: "time" | "finished") => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const timeTaken = INITIAL_TIME - Math.max(0, timeLeft);
    
    navigation.navigate("MathResults" as any, {
      score,
      totalQuestions: TOTAL_QUESTIONS,
      timeTaken,
      endedBy: reason,
      gameType: 'addition'
    } as any);
  }, [navigation, score, timeLeft]);

  const handleStart = () => {
    setShowStartHint(false);
    setIsRunning(true);
    animateQuestion();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const current = questionList[currentQuestionIndex];
  const progressPercent = Math.min(100, (currentQuestionIndex / TOTAL_QUESTIONS) * 100);

  // Time warning colors
  const getTimeColor = () => {
    if (timeLeft <= 10) return PALETTE.red;
    if (timeLeft <= 30) return PALETTE.orange;
    return PALETTE.neutralDark;
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className={`${Platform.OS === 'ios' ? 'pt-14' : 'pt-12'} pb-4 px-4 md:px-6`}
        style={{ backgroundColor: PALETTE.lightPink }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              handlePause();
              navigation.goBack();
            }}
            className="items-center justify-center w-12 h-12 shadow-sm md:w-14 md:h-14 rounded-2xl"
            style={{ backgroundColor: 'white' }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text className="text-2xl md:text-3xl">←</Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center flex-1 gap-6 md:gap-8">
            <Animated.View 
              className="items-center"
              style={{ transform: [{ scale: timeLeft <= 30 ? pulseAnim : 1 }] }}
            >
              <Text className="text-xs font-medium md:text-sm" style={{ color: PALETTE.neutralMuted }}>
                TIME
              </Text>
              <Text className="text-2xl font-bold md:text-3xl" style={{ color: getTimeColor() }}>
                {formatTime(timeLeft)}
              </Text>
            </Animated.View>
            
            <View className="items-center">
              <Text className="text-xs font-medium md:text-sm" style={{ color: PALETTE.neutralMuted }}>
                SCORE
              </Text>
              <Text className="text-2xl font-bold md:text-3xl" style={{ color: PALETTE.teal }}>
                {score}/{TOTAL_QUESTIONS}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={isRunning ? handlePause : handleResume}
            className="items-center justify-center w-12 h-12 shadow-sm md:w-14 md:h-14 rounded-2xl"
            style={{ backgroundColor: 'white' }}
            accessibilityLabel={isRunning ? "Pause" : "Resume"}
            accessibilityRole="button"
          >
            <Text className="text-2xl md:text-3xl">{isRunning ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        <View className={`flex-1 ${isTablet ? 'max-w-3xl mx-auto w-full' : ''}`}>
          {/* Progress Bar */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold md:text-base" style={{ color: PALETTE.neutralDark }}>
                Question {Math.min(currentQuestionIndex + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}
              </Text>
              <Text className="text-sm font-bold md:text-base" style={{ color: PALETTE.teal }}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View className="h-3 overflow-hidden bg-gray-200 rounded-full md:h-4">
              <Animated.View
                className="h-full rounded-full"
                style={{ 
                  width: `${progressPercent}%`, 
                  backgroundColor: PALETTE.teal,
                  opacity: fadeAnim
                }}
              />
            </View>
          </View>

          {/* Question Card */}
          <Animated.View
            className="p-6 mb-6 bg-white shadow-lg rounded-3xl md:p-8"
            style={{ 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              borderWidth: 2,
              borderColor: PALETTE.lightTeal
            }}
          >
            <Text className="mb-8 text-4xl font-bold text-center md:text-5xl lg:text-6xl md:mb-10" 
                  style={{ color: PALETTE.neutralDark }}>
              {current ? `${current.a} + ${current.b} = ?` : "Loading..."}
            </Text>

            {/* Options Grid */}
            <View className="flex-row flex-wrap justify-between">
              {current?.options.map((option, index) => {
                const disabled = !isRunning || selectedOption !== null;
                const isSelected = selectedOption === option;
                const isCorrect = feedback && isSelected && feedback === 'correct';
                const isIncorrect = feedback && isSelected && feedback === 'incorrect';
                
                let buttonColor = PALETTE.lightTeal;
                let borderColor = PALETTE.teal;
                let textColor = PALETTE.teal;
                
                if (isCorrect) {
                  buttonColor = PALETTE.green;
                  borderColor = PALETTE.green;
                  textColor = 'white';
                } else if (isIncorrect) {
                  buttonColor = PALETTE.red;
                  borderColor = PALETTE.red;
                  textColor = 'white';
                } else if (disabled && !isSelected) {
                  buttonColor = '#F3F4F6';
                  textColor = PALETTE.neutralMuted;
                }

                return (
                  <TouchableOpacity
                    key={index}
                    className={`${isTablet ? 'w-[48%]' : 'w-[47%]'} py-6 md:py-8 rounded-2xl mb-3 md:mb-4`}
                    style={{
                      backgroundColor: buttonColor,
                      borderWidth: 2,
                      borderColor: borderColor,
                      opacity: disabled && !isSelected ? 0.6 : 1,
                    }}
                    onPress={() => handleAnswer(option)}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={`Option ${option}`}
                  >
                    <Text className="text-2xl font-bold text-center md:text-3xl lg:text-4xl" 
                          style={{ color: textColor }}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Start/Pause Button */}
          {!isRunning && (
            <TouchableOpacity
              className="px-8 py-5 mx-auto shadow-md md:py-6 md:px-10 rounded-3xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={showStartHint ? handleStart : handleResume}
              accessibilityRole="button"
            >
              <Text className="text-xl font-bold text-center text-white md:text-2xl">
                {showStartHint ? 'Start Quiz' : 'Resume Quiz'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default MathPlayAddition;