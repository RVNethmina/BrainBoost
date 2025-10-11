import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext"; // Add this import

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
  theme?: 'light' | 'dark';      // Add theme prop
  fontScale?: number;            // Add fontScale prop
};

const PuzzlePlayTemplate: React.FC<Props> = ({
  title,
  gameType,
  makeQuestion,
  totalQuestions = 10,
  initialTimeSec = 120,
  theme: propTheme,              // Accept theme prop
  fontScale: propFontScale,      // Accept fontScale prop
}) => {
  const navigation = useNavigation<Nav>();
  // Use settings hook if props not provided
  const settings = useSettings();
  const theme = propTheme || settings.theme;
  const fontScale = propFontScale || settings.getFontScale();
  const isDark = theme === 'dark';
  
  const [timeLeft, setTimeLeft] = useState(initialTimeSec);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [idx, setIdx] = useState(0);
  const [questions, setQuestions] = useState<PuzzleQuestion[]>([]);
  const [showStartHint, setShowStartHint] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const optionBg = isDark ? '#3a3a3a' : PALETTE.lightTeal;
  const disabledBg = isDark ? '#2a2a2a' : '#F3F4F6';
  const secondaryTextColor = isDark ? '#ccc' : PALETTE.gray;

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
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header — same structure/colors as MathPlay* */}
      <View 
        className="flex-row items-center justify-between px-5 pt-10 pb-4" 
        style={{ backgroundColor: headerBg }}
      >
        <TouchableOpacity
          onPress={() => { setIsRunning(false); navigation.goBack(); }}
          className="items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal }}
        >
          <Text className="text-2xl" style={{ color: textColor }}>←</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text 
            className="text-sm"
            style={{ 
              fontSize: 14 * fontScale,
              color: secondaryTextColor 
            }}
          >
            {title}
          </Text>
          <Text 
            className="text-xl font-bold"
            style={{ 
              fontSize: 20 * fontScale,
              color: textColor 
            }}
          >
            {formatTime(timeLeft)} · {score}
          </Text>
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
        <View 
          className="p-5 mb-8 border shadow-sm rounded-2xl" 
          style={{ 
            backgroundColor: cardBg, 
            borderColor: PALETTE.lightTeal,
            shadowColor: '#000',
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text 
            className="mb-8 text-3xl font-bold text-center"
            style={{ 
              fontSize: 32 * fontScale,
              color: textColor 
            }}
          >
            {current ? current.prompt : "Loading..."}
          </Text>

          <View className="grid grid-cols-2 gap-4">
            {current?.options.map((opt, i) => {
              const disabled = !isRunning;
              return (
                <TouchableOpacity
                  key={i}
                  className="py-6 border-2 rounded-2xl"
                  style={{ 
                    backgroundColor: disabled ? disabledBg : optionBg, 
                    borderColor: PALETTE.teal, 
                    opacity: disabled ? 0.6 : 1 
                  }}
                  onPress={() => onSelect(i)}
                  disabled={disabled}
                  accessibilityRole="button"
                >
                  <Text 
                    className="text-2xl font-bold text-center"
                    style={{ 
                      fontSize: 24 * fontScale,
                      color: isDark ? '#fff' : PALETTE.teal 
                    }}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Progress */}
        <View className="items-center">
          <Text 
            className="mb-2 text-lg"
            style={{ 
              fontSize: 18 * fontScale,
              color: secondaryTextColor 
            }}
          >
            Question:{" "}
            <Text 
              className="font-bold" 
              style={{ color: PALETTE.teal }}
            >
              {Math.min(idx + 1, totalQuestions)}/{totalQuestions}
            </Text>
          </Text>
          <View style={styles.track}>
            <View 
              style={[
                styles.fill, 
                { 
                  width: `${progressPct}%`, 
                  backgroundColor: PALETTE.teal 
                }
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
              onPress={() => { setShowStartHint(false); setIsRunning(true); }}
            >
              <Text 
                className="text-lg font-semibold text-white"
                style={{ fontSize: 18 * fontScale }}
              >
                Start
              </Text>
            </TouchableOpacity>
          ) : isRunning ? (
            <TouchableOpacity 
              className="px-6 py-4 rounded-2xl" 
              style={{ backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightPink }} 
              onPress={() => setIsRunning(false)}
            >
              <Text 
                className="text-lg font-semibold text-white"
                style={{ fontSize: 18 * fontScale }}
              >
                Pause
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              className="px-6 py-4 rounded-2xl" 
              style={{ backgroundColor: PALETTE.teal }} 
              onPress={() => setIsRunning(true)}
            >
              <Text 
                className="text-lg font-semibold text-white"
                style={{ fontSize: 18 * fontScale }}
              >
                Resume
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: { 
    width: "100%", 
    height: 12, 
    backgroundColor: "#E5E7EB", 
    borderRadius: 8, 
    overflow: "hidden", 
    marginTop: 6 
  },
  fill: { 
    height: "100%" 
  },
});

export default PuzzlePlayTemplate;