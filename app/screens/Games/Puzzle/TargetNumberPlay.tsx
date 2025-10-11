// screens/Games/Puzzle/TargetNumberPlay.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext"; // Add this import

type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
type Diff = "easy" | "medium" | "hard";
type Range = readonly [number, number];

type Props = {
  assessmentMode?: boolean;
  onComplete?: (res: {
    accuracy: number;
    score: number;
    mistakes: number;
    timeTaken: number;
    avgRT: number;
  }) => void;
};

function cfg(diff: Diff): { N: number; range: Range; time: number } {
  if (diff === "easy") return { N: 3, range: [1, 9] as const, time: 60 };
  if (diff === "medium") return { N: 4, range: [1, 12] as const, time: 80 };
  return { N: 5, range: [1, 20] as const, time: 100 };
}

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randExcept = (min: number, max: number, except: number) => {
  let v = rand(min, max);
  while (v === except) v = rand(min, max);
  return v;
};

export default function TargetNumberPlay({
  assessmentMode = false,
  onComplete,
}: Props) {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  // Add settings hook
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';
  
  const diff: Diff = route.params?.difficulty || "easy";
  const { N, range, time } = cfg(diff);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
  const cardBg = isDark ? '#3a3a3a' : PALETTE.lightTeal;
  const disabledBg = isDark ? '#2a2a2a' : '#E5E7EB';
  const secondaryTextColor = isDark ? '#ccc' : '#6B7280';

  const [grid, setGrid] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(rand(range[0], range[1]));
  const [timeLeft, setTimeLeft] = useState(time);
  const [running, setRunning] = useState(false);

  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const remainingRef = useRef(0); // keep exact, no stale closures

  const [level, setLevel] = useState(1); // exactly 4 levels

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  // Build a round where ONLY the chosen positions equal target
  const makeRound = () => {
    const t = rand(range[0], range[1]);
    const cells = N * N;
    const numTargets = Math.max(3, Math.min(7, Math.floor(cells / 2)));

    // full shuffle of positions -> truly random placement
    const positions = Array.from({ length: cells }, (_, i) => i).sort(
      () => Math.random() - 0.5
    );
    const targetPositions = new Set(positions.slice(0, numTargets));

    const g = Array.from({ length: cells }, (_, i) =>
      targetPositions.has(i) ? t : randExcept(range[0], range[1], t) // NEVER accidentally equals target
    );

    setGrid(g);
    setTarget(t);
    setRemaining(numTargets);
    remainingRef.current = numTargets;
  };

  useEffect(() => {
    resetGame();
  }, [N, diff]);

  const resetGame = () => {
    setScore(0);
    setMistakes(0);
    setLevel(1);
    setTimeLeft(time);
    setRunning(false);
    startTimeRef.current = Date.now();
    makeRound();
  };

  // timer
  useEffect(() => {
    if (running && timeLeft > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) end("timeUp");
  }, [timeLeft]);

  useEffect(() => {
    if (mistakes >= 5) {
      Alert.alert("Game Over", "Too many wrong taps.");
      end("timeUp");
    }
  }, [mistakes]);

  const end = (endedBy: "completed" | "timeUp") => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    const accuracy = score > 0 ? (score / (score + mistakes)) * 100 : 0;
    const avgRT = score > 0 ? Math.round((timeTaken * 1000) / score) : 0;

    if (assessmentMode && onComplete) {
      onComplete({ accuracy, score, mistakes, timeTaken, avgRT });
      return;
    }

    nav.navigate("MathResults", {
      score,
      totalQuestions: score + mistakes,
      timeTaken,
      endedBy,
      gameType: "target-number",
    });
  };

  const tap = (i: number) => {
    if (!running) return;
    if (grid[i] === -1) return; // already tapped

    if (grid[i] !== target) {
      setMistakes((m) => m + 1);
      return;
    }

    // mark hit
    setGrid((g) => {
      const copy = [...g];
      copy[i] = -1;
      return copy;
    });
    setScore((s) => s + 1);

    // decrement remaining using REF to avoid stale closures
    const nextRem = remainingRef.current - 1;
    remainingRef.current = nextRem;
    setRemaining(nextRem);

    if (nextRem === 0) {
      // finished this level
      if (level >= 4) {
        end("completed");
      } else {
        setLevel((l) => l + 1);
        makeRound();
      }
    }
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 12,
          backgroundColor: headerBg,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setRunning(false);
            nav.goBack();
          }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal,
          }}
        >
          <Text style={{ fontSize: 24, color: textColor }}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={{ 
            fontSize: 14 * fontScale, 
            color: secondaryTextColor 
          }}>
            Target Number
          </Text>
          <Text style={{ 
            fontSize: 16 * fontScale, 
            color: textColor 
          }}>
            ⏱ {formatTime(timeLeft)} · ⭐ {score} · ❌ {mistakes}/5 · Lvl {level}/4
          </Text>
          <Text style={{ 
            fontSize: 12 * fontScale, 
            color: secondaryTextColor 
          }}>
            Remaining this level: {remaining}
          </Text>
        </View>
        <View style={{ width: 44, alignItems: "center" }}>
          {running ? (
            <TouchableOpacity onPress={() => setRunning(false)}>
              <Text style={{ fontSize: 24 }}>⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setRunning(true)}>
              <Text style={{ fontSize: 24 }}>▶️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={{ 
            fontSize: 28 * fontScale, 
            fontWeight: "800", 
            color: PALETTE.teal 
          }}>
            Target: {target}
          </Text>
          <Text style={{ 
            fontSize: 16 * fontScale, 
            color: secondaryTextColor 
          }}>
            Tap all "{target}" tiles · remaining: {remaining}
          </Text>
        </View>

        {/* Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {grid.map((v, i) => {
            const hit = v === -1;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => tap(i)}
                style={{
                  width: `${100 / N}%`,
                  maxWidth: 120,
                  aspectRatio: 1,
                  margin: 6,
                  borderWidth: 2,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: hit ? disabledBg : cardBg,
                  borderColor: PALETTE.teal,
                  opacity: hit ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 24 * fontScale,
                    fontWeight: "800",
                    color: isDark ? '#fff' : PALETTE.teal,
                  }}
                >
                  {hit ? "✓" : v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Controls */}
        <View
          style={{
            alignItems: "center",
            marginTop: 16,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {!running ? (
            <TouchableOpacity
              onPress={() => setRunning(true)}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: PALETTE.teal,
                marginHorizontal: 8,
              }}
            >
              <Text style={{ 
                color: "white", 
                fontSize: 18 * fontScale, 
                fontWeight: "700" 
              }}>
                Start
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setRunning(false)}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightPink,
                marginHorizontal: 8,
              }}
            >
              <Text style={{ 
                color: "white", 
                fontSize: 18 * fontScale, 
                fontWeight: "700" 
              }}>
                Pause
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={resetGame}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: "#F59E0B",
              marginHorizontal: 8,
            }}
          >
            <Text style={{ 
              color: "white", 
              fontSize: 18 * fontScale, 
              fontWeight: "700" 
            }}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}