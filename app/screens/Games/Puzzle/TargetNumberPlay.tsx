// screens/Games/Puzzle/TargetNumberPlay.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

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

// --- HELPER FUNCTIONS FOR VOICE GUIDANCE ---

const speak = (text: string) => {
  Speech.stop();
  Speech.speak(text, { language: 'en-US' });
};

const getPositionCue = (i: number, N: number) => {
  const row = Math.floor(i / N) + 1;
  const col = (i % N) + 1;
  
  const getOrdinal = (n: number) => {
    if (n === 1) return "first";
    if (n === 2) return "second";
    if (n === 3) return "third";
    if (n === 4) return "fourth";
    return `${n}th`;
  };
  
  return `the ${getOrdinal(row)} row, ${getOrdinal(col)} column`;
};

// --- MAIN COMPONENT ---

export default function TargetNumberPlay({
  assessmentMode = false,
  onComplete,
}: Props) {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const diff: Diff = route.params?.difficulty || "easy";
  const { N, range, time } = cfg(diff);

  const [grid, setGrid] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(rand(range[0], range[1]));
  const [timeLeft, setTimeLeft] = useState(time);
  const [running, setRunning] = useState(false);

  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const remainingRef = useRef(0);

  const [level, setLevel] = useState(1);
  const [guidedSequence, setGuidedSequence] = useState<number[]>([]); 
  const [isGuiding, setIsGuiding] = useState(false); 

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  // Helper to announce the next target (used on start and after each correct tap)
  const announceNextTarget = (currentGrid: number[], currentTarget: number, currentN: number) => {
    // Find the first tile that still matches the target (i.e., not tapped yet)
    const nextTargetIndex = currentGrid.findIndex((v) => v === currentTarget);

    if (nextTargetIndex !== -1) {
        const cue = getPositionCue(nextTargetIndex, currentN);
        speak(`Target is ${currentTarget}. Your next tap should be at ${cue}`);
    } else if (remainingRef.current === 0) {
        speak(`Level completed!`);
    }
  }

  // Build a round where ONLY the chosen positions equal target
  const makeRound = () => {
    const t = rand(range[0], range[1]);
    const cells = N * N;
    
    // --- FIXED TARGETS TO 4 PER LEVEL ---
    const numTargets = 4;
    // ------------------------------------

    const positions = Array.from({ length: cells }, (_, i) => i).sort(
      () => Math.random() - 0.5
    );
    const targetPositions = new Set(positions.slice(0, numTargets));

    const g = Array.from({ length: cells }, (_, i) =>
      targetPositions.has(i) ? t : randExcept(range[0], range[1], t)
    );
    
    const targetIndices = Array.from(targetPositions);
    setGuidedSequence(targetIndices); 

    setGrid(g);
    setTarget(t);
    setRemaining(numTargets);
    remainingRef.current = numTargets;
    
    // If guidance is already active, announce the first tile of the NEW level/round
    if (isGuiding) {
        // Announce new target after a slight delay for state to settle
        setTimeout(() => announceNextTarget(g, t, N), 100);
    }
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
    setIsGuiding(false); 
    startTimeRef.current = Date.now();
    makeRound();
    Speech.stop();
  };

  const startOrResumeGame = () => {
      setRunning(true);
      
      // If guidance was requested BEFORE pressing start, announce the first cue now.
      if (isGuiding) {
          announceNextTarget(grid, target, N);
      }
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
  
  
  const startGuidance = () => {
    
    if (isGuiding) {
        // Option to turn OFF guidance if user clicks again while active
        setIsGuiding(false);
        speak("Guidance mode turned off.");
        return;
    }
    
    // Enable guidance flag
    setIsGuiding(true);
    
    if (!running) {
        // If not running, inform user how to proceed
        speak(`Guidance mode is now ON. Please press the Start button to begin the game, and I will guide you.`);
    } else {
        // If running, immediately give the next cue
        announceNextTarget(grid, target, N);
    }
  };

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
    Speech.stop();
  };

  const tap = (i: number) => {
    if (!running) return;
    if (grid[i] === -1) return; // already tapped

    if (grid[i] !== target) {
      setMistakes((m) => m + 1);
      return;
    }

    // Mark hit (Must happen before checking next target)
    let newGrid: number[] = [];
    setGrid((g) => {
      newGrid = [...g];
      newGrid[i] = -1;
      return newGrid;
    });
    setScore((s) => s + 1);
    
    // Guidance Logic for Continuous Feedback
    if (isGuiding) {
        // Give time for state to update internally, then announce next target
        setTimeout(() => { 
            const nextRem = remainingRef.current - 1;
            
            if (nextRem > 0) {
                 // Find the next available target using the newGrid array
                 const nextTargetIndex = newGrid.findIndex((v) => v === target);
                 
                 if (nextTargetIndex !== -1) {
                     const nextCue = getPositionCue(nextTargetIndex, N);
                     speak(`Correct! Now find the next target at ${nextCue}`);
                 }
            } else {
                speak(`Level completed!`);
            }
        }, 50); // Small delay for smooth state transition
    }

    // decrement remaining using REF to avoid stale closures
    const nextRem = remainingRef.current - 1;
    remainingRef.current = nextRem;
    setRemaining(nextRem);

    if (nextRem === 0) {
      // Level completion logic (4 correct taps completed)
      if (level >= 4) {
        end("completed");
      } else {
        setLevel((l) => l + 1);
        // Guidance mode remains ON
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 12,
          backgroundColor: PALETTE.lightPink,
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
            backgroundColor: PALETTE.lightTeal,
          }}
        >
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>Target Number</Text>
          <Text style={{ fontSize: 16, color: "#374151" }}>
            ⏱ {formatTime(timeLeft)} · ⭐ {score} · ❌ {mistakes}/5 · Lvl {level}/4
          </Text>
          <Text style={{ fontSize: 12, color: "#6B7280" }}>
            Remaining this level: {remaining}
          </Text>
        </View>
        <View style={{ width: 44, alignItems: "center" }}>
          {running ? (
            <TouchableOpacity onPress={() => setRunning(false)}>
              <Text style={{ fontSize: 24 }}>⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startOrResumeGame}>
              <Text style={{ fontSize: 24 }}>▶️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: PALETTE.teal }}>
            Target: {target}
          </Text>
          <Text style={{ fontSize: 16, color: PALETTE.neutralMuted }}>
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
            
            // Highlight logic: Only highlight if guidance mode is ON AND this is the next correct tile
            const nextTargetIndex = grid.findIndex((val) => val === target);
            const isGuided = isGuiding && running && nextTargetIndex === i;
            
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
                  backgroundColor: hit 
                    ? "#E5E7EB" 
                    : isGuided 
                      ? PALETTE.yellow 
                      : PALETTE.lightTeal,
                  borderColor: isGuided ? PALETTE.red : PALETTE.teal, 
                  opacity: hit ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: PALETTE.teal,
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
          {/* 1. START/PAUSE Button */}
          {!running ? (
            <TouchableOpacity
              onPress={startOrResumeGame}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: PALETTE.teal,
                marginHorizontal: 8,
              }}
            >
              <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
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
                backgroundColor: PALETTE.lightPink,
                marginHorizontal: 8,
              }}
            >
              <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
                Pause
              </Text>
            </TouchableOpacity>
          )}

          {/* 2. GUIDE ME Button */}
          <TouchableOpacity
            onPress={startGuidance}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: isGuiding ? PALETTE.green : PALETTE.purple,
              marginHorizontal: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
              📢 {isGuiding ? 'Guiding (Tap to Stop)' : 'Guide Me'}
            </Text>
          </TouchableOpacity>
          
          {/* 3. RESET Button */}
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
            <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}