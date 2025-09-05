import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;

export type PuzzleQuestion = {
  prompt: string;
  options: string[];      // 4 options (text or emoji)
  correctIndex: number;   // 0..3
};

type Props = {
  title: string;                 // header title (e.g., "Odd")
  gameType: string;              // short tag: "odd" | "seq" | "arrow" | "comp"
  makeQuestion: () => PuzzleQuestion;
  totalQuestions?: number;       // default 10
  initialTimeSec?: number;       // default 120
};

const PuzzlePlayTemplate: React.FC<Props> = ({
  title,
  gameType,
  makeQuestion,
  totalQuestions = 10,
  initialTimeSec = 120,
}) => {
  const navigation = useNavigation<Nav>();
  const [timeLeft, setTimeLeft] = useState(initialTimeSec);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [idx, setIdx] = useState(0);
  const [questions, setQuestions] = useState<PuzzleQuestion[]>([]);
  const [showStartHint, setShowStartHint] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // build questions
  useEffect(() => {
    setQuestions(Array.from({ length: totalQuestions }, () => makeQuestion()));
  }, [totalQuestions, makeQuestion]);

  // timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current && clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    if (!isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // time up
  useEffect(() => {
    if (timeLeft <= 0) end("timeUp");
  }, [timeLeft]);

  // finished questions
  useEffect(() => {
    if (idx >= totalQuestions) end("completed");
  }, [idx, totalQuestions]);

  const end = (endedBy: "timeUp" | "completed") => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = initialTimeSec - Math.max(0, timeLeft);

    // reuses MathResults + its params (score, totalQuestions, timeTaken, endedBy, gameType)
    navigation.navigate("MathResults", { score, totalQuestions, timeTaken, endedBy, gameType });
  };

  const current = questions[idx % (questions.length || 1)];
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const onSelect = (choiceIndex: number) => {
    if (!isRunning || !current) return;
    if (choiceIndex === current.correctIndex) setScore((s) => s + 1);
    setIdx((i) => i + 1);
  };
  const progressPct = Math.min(100, (idx / totalQuestions) * 100);

  return (
    <View className="flex-1 bg-white">
      {/* Header — same structure/colors as MathPlay* */}
      <View className="flex-row items-center justify-between px-5 pt-10 pb-4" style={{ backgroundColor: PALETTE.lightPink }}>
        <TouchableOpacity
          onPress={() => { setIsRunning(false); navigation.goBack(); }}
          className="items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-sm text-gray-600">{title}</Text>
          <Text className="text-xl font-bold">{formatTime(timeLeft)} · {score}</Text>
        </View>

        <View style={{ width: 44 }}>
          {isRunning ? (
            <TouchableOpacity onPress={() => setIsRunning(false)}>
              <Text className="text-2xl">⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsRunning(true)}>
              <Text className="text-2xl">{showStartHint ? "▶️" : "▶️"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <View className="justify-center flex-1 px-5">
        <View className="p-5 mb-8 border shadow-sm rounded-2xl" style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}>
          <Text className="mb-8 text-3xl font-bold text-center">{current ? current.prompt : "Loading..."}</Text>

          <View className="grid grid-cols-2 gap-4">
            {current?.options.map((opt, i) => {
              const disabled = !isRunning;
              return (
                <TouchableOpacity
                  key={i}
                  className="py-6 border-2 rounded-2xl"
                  style={{ backgroundColor: disabled ? "#F3F4F6" : PALETTE.lightTeal, borderColor: PALETTE.teal, opacity: disabled ? 0.6 : 1 }}
                  onPress={() => onSelect(i)}
                  disabled={disabled}
                  accessibilityRole="button"
                >
                  <Text className="text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Progress */}
        <View className="items-center">
          <Text className="mb-2 text-lg text-gray-600">
            Question: <Text className="font-bold" style={{ color: PALETTE.teal }}>{Math.min(idx + 1, totalQuestions)}/{totalQuestions}</Text>
          </Text>
          <View style={styles.track}><View style={[styles.fill, { width: `${progressPct}%`, backgroundColor: PALETTE.teal }]} /></View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-center mt-6">
          {!isRunning && showStartHint ? (
            <TouchableOpacity className="px-6 py-4 rounded-2xl" style={{ backgroundColor: PALETTE.teal }} onPress={() => { setShowStartHint(false); setIsRunning(true); }}>
              <Text className="text-lg font-semibold text-white">Start</Text>
            </TouchableOpacity>
          ) : isRunning ? (
            <TouchableOpacity className="px-6 py-4 rounded-2xl" style={{ backgroundColor: PALETTE.lightPink }} onPress={() => setIsRunning(false)}>
              <Text className="text-lg font-semibold text-white">Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="px-6 py-4 rounded-2xl" style={{ backgroundColor: PALETTE.teal }} onPress={() => setIsRunning(true)}>
              <Text className="text-lg font-semibold text-white">Resume</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: { width: "100%", height: 12, backgroundColor: "#E5E7EB", borderRadius: 8, overflow: "hidden", marginTop: 6 },
  fill: { height: "100%" },
});

export default PuzzlePlayTemplate;
