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
          {isRunning ? (
            <TouchableOpacity onPress={handlePause}>
              <Text className="text-2xl">⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={isRunning ? handlePause : handleResume}>
              <Text className="text-2xl">{showStartHint ? "▶️" : "▶️"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Questions */}
      <View className="justify-center flex-1 px-5">
        <View
          className="p-5 mb-8 border shadow-sm rounded-2xl"
          style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
        >
          <Text className="mb-8 text-4xl font-bold text-center">
            {current ? `${current.a} × ${current.b} = ?` : "Loading..."}
          </Text>

          <View className="grid grid-cols-2 gap-4">
            {current
              ? current.options.map((option, index) => {
                  const disabled = !isRunning;
                  return (
                    <TouchableOpacity
                      key={index}
                      className="py-6 border-2 rounded-2xl"
                      style={{
                        backgroundColor: disabled ? "#F3F4F6" : PALETTE.lightTeal,
                        borderColor: PALETTE.teal,
                        opacity: disabled ? 0.6 : 1,
                      }}
                      onPress={() => handleAnswer(option)}
                      disabled={disabled}
                      accessibilityRole="button"
                    >
                      <Text
                        className="text-2xl font-bold text-center"
                        style={{ color: PALETTE.teal }}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              : null}
          </View>
        </View>

        {/* Progressbar */}
        <View className="items-center">
          <Text className="mb-2 text-lg text-gray-600">
            Question:{" "}
            <Text className="font-bold" style={{ color: PALETTE.teal }}>
              {Math.min(currentQuestionIndex + 1, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}
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

        {/* Controls */}
        <View className="flex-row items-center justify-center mt-6">
          {!isRunning && showStartHint ? (
            <TouchableOpacity
              className="px-6 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={handleStart}
            >
              <Text className="text-lg font-semibold text-white">Start</Text>
            </TouchableOpacity>
          ) : isRunning ? (
            <TouchableOpacity
              className="px-6 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.lightPink }}
              onPress={handlePause}
            >
              <Text className="text-lg font-semibold text-white">Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="px-6 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={handleResume}
            >
              <Text className="text-lg font-semibold text-white">Resume</Text>
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