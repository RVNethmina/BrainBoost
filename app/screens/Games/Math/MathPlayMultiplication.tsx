// app/src/screens/MathPlayMultiplication.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MathPlayScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MathPlayMultiplication"
>;

const INITIAL_TIME = 120; // seconds
const TOTAL_QUESTIONS = 10;

type Question = {
  a: number;
  b: number;
  correctAnswer: number;
  options: number[]; // length 4
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

function makeMultiplicationQuestion(minOperand = 1, maxOperand = 12): Question {
  const a = randInt(minOperand, maxOperand);
  const b = randInt(minOperand, maxOperand);
  const correct = a * b;

  const options = new Set<number>();
  options.add(correct);

  // create 3 plausible distractors
  while (options.size < 4) {
    // For multiplication, use factors or near multiples
    const offsetChoice = [-10, -8, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8, 10];
    const offset = offsetChoice[Math.floor(Math.random() * offsetChoice.length)];
    const candidate = correct + offset;
    if (candidate >= 0) options.add(candidate);
  }

  const optionsArr = shuffle(Array.from(options));
  return {
    a, b,
    correctAnswer: correct,
    options: optionsArr,
  };
}

const MathPlayMultiplication: React.FC = () => {
  const navigation = useNavigation<MathPlayScreenNavigationProp>();

  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showStartHint, setShowStartHint] = useState<boolean>(true);

  // generate questions on mount
  useEffect(() => {
    const q: Question[] = Array.from({ length: TOTAL_QUESTIONS }, () =>
      makeMultiplicationQuestion(1, 12)
    );
    setQuestionList(q);
  }, []);

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

  // when time runs out
  useEffect(() => {
    if (timeLeft <= 0) {
      endQuiz("time");
    }
  }, [timeLeft]);

  // end quiz when all questions done
  useEffect(() => {
    if (currentQuestionIndex >= TOTAL_QUESTIONS) {
      endQuiz("finished");
    }
  }, [currentQuestionIndex]);

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

  const handleAnswer = (selected: number) => {
    if (!isRunning) return;

    const current = questionList[currentQuestionIndex % questionList.length];
    if (!current) return;
    if (selected === current.correctAnswer) {
      setScore((s) => s + 1);
    }
    setCurrentQuestionIndex((i) => i + 1);
  };

  const endQuiz = (reason: "time" | "finished") => {
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
      gameType: 'multiplication'
    } as any);
  };

  const handleStart = () => {
    setShowStartHint(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const current = questionList[currentQuestionIndex % questionList.length];

  const progressPercent = Math.min(
    100,
    ((currentQuestionIndex) / TOTAL_QUESTIONS) * 100
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pt-10 pb-4 shadow-lg sm:px-6 sm:pt-12 sm:pb-6"
        style={{ backgroundColor: PALETTE.lightPink }}
      >
        <TouchableOpacity
          onPress={() => {
            handlePause();
            navigation.goBack();
          }}
          className="items-center justify-center w-10 h-10 shadow-md sm:w-12 sm:h-12 rounded-xl active:scale-95"
          style={{ backgroundColor: PALETTE.lightTeal }}
        >
          <Text className="text-xl sm:text-2xl">←</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-3 sm:gap-4">
          <View 
            className="items-center px-3 py-2 shadow-sm rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          >
            <Text className="text-xs font-medium sm:text-sm" style={{ color: PALETTE.orange }}>Time</Text>
            <Text 
              className="text-lg font-bold sm:text-xl" 
              style={{ color: timeLeft <= 30 ? PALETTE.red : PALETTE.orange }}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View 
            className="items-center px-3 py-2 shadow-sm rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          >
            <Text className="text-xs font-medium sm:text-sm" style={{ color: PALETTE.orange }}>Score</Text>
            <Text className="text-lg font-bold sm:text-xl" style={{ color: PALETTE.orange }}>
              {score}
            </Text>
          </View>
        </View>

        <View className="items-center w-10 sm:w-12">
          {isRunning ? (
            <TouchableOpacity 
              onPress={handlePause}
              className="active:scale-95"
            >
              <Text className="text-xl sm:text-2xl">⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={isRunning ? handlePause : handleResume}
              className="active:scale-95"
            >
              <Text className="text-xl sm:text-2xl">{showStartHint ? "▶️" : "▶️"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View className="justify-center flex-1 px-4 sm:px-6">
        {/* Question Card */}
        <View
          className="p-6 mb-6 border-2 shadow-lg sm:p-8 sm:mb-8 rounded-3xl"
          style={{ backgroundColor: "white", borderColor: '#FFEDCC' }}
        >
          {/* Question Display */}
          <View className="mb-6 sm:mb-8">
            <Text className="text-3xl font-bold text-center sm:text-4xl lg:text-5xl" style={{ color: PALETTE.orange }}>
              {current ? `${current.a} × ${current.b} = ?` : "Loading..."}
            </Text>
          </View>

          {/* Answer Options Grid */}
          <View className="gap-3 sm:gap-4">
            <View className="flex-row gap-3 sm:gap-4">
              {current?.options.slice(0, 2).map((option, index) => {
                const disabled = !isRunning;
                return (
                  <TouchableOpacity
                    key={index}
                    className="flex-1 py-4 border-2 shadow-sm sm:py-6 rounded-2xl active:scale-95"
                    style={{
                      backgroundColor: disabled ? "#F3F4F6" : '#FFEDCC',
                      borderColor: PALETTE.orange,
                      opacity: disabled ? 0.6 : 1,
                    }}
                    onPress={() => handleAnswer(option)}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={`Answer option: ${option}`}
                  >
                    <Text
                      className="text-xl font-bold text-center sm:text-2xl"
                      style={{ color: disabled ? '#9CA3AF' : PALETTE.orange }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="flex-row gap-3 sm:gap-4">
              {current?.options.slice(2, 4).map((option, index) => {
                const disabled = !isRunning;
                return (
                  <TouchableOpacity
                    key={index + 2}
                    className="flex-1 py-4 border-2 shadow-sm sm:py-6 rounded-2xl active:scale-95"
                    style={{
                      backgroundColor: disabled ? "#F3F4F6" : '#FFEDCC',
                      borderColor: PALETTE.orange,
                      opacity: disabled ? 0.6 : 1,
                    }}
                    onPress={() => handleAnswer(option)}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={`Answer option: ${option}`}
                  >
                    <Text
                      className="text-xl font-bold text-center sm:text-2xl"
                      style={{ color: disabled ? '#9CA3AF' : PALETTE.orange }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View className="items-center mb-6">
          <Text className="mb-3 text-base text-gray-600 sm:text-lg">
            Question:{" "}
            <Text className="font-bold" style={{ color: PALETTE.orange }}>
              {Math.min(currentQuestionIndex + 1, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}
            </Text>
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: PALETTE.orange },
              ]}
            />
          </View>
        </View>

        {/* Control Button */}
        <View className="items-center">
          {!isRunning && showStartHint ? (
            <TouchableOpacity
              className="px-8 py-4 shadow-lg sm:px-12 sm:py-5 rounded-3xl active:scale-95"
              style={{ backgroundColor: PALETTE.orange }}
              onPress={handleStart}
              accessibilityRole="button"
              accessibilityLabel="Start the quiz"
            >
              <Text className="text-lg font-semibold text-white sm:text-xl">🚀 Start Quiz</Text>
            </TouchableOpacity>
          ) : isRunning ? (
            <TouchableOpacity
              className="px-8 py-4 shadow-lg sm:px-12 sm:py-5 rounded-3xl active:scale-95"
              style={{ backgroundColor: PALETTE.red }}
              onPress={handlePause}
              accessibilityRole="button"
              accessibilityLabel="Pause the quiz"
            >
              <Text className="text-lg font-semibold text-white sm:text-xl">⏸️ Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="px-8 py-4 shadow-lg sm:px-12 sm:py-5 rounded-3xl active:scale-95"
              style={{ backgroundColor: PALETTE.orange }}
              onPress={handleResume}
              accessibilityRole="button"
              accessibilityLabel="Resume the quiz"
            >
              <Text className="text-lg font-semibold text-white sm:text-xl">▶️ Resume</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default MathPlayMultiplication;

const styles = StyleSheet.create({
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
});