// // screens/Games/Puzzle/TargetNumberPlay.tsx
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useEffect, useRef, useState } from "react";
// import { Text, TouchableOpacity, View } from "react-native";

// type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
// type Diff = "easy" | "medium" | "hard";
// type Range = readonly [number, number];

// function cfg(diff: Diff): { N: number; range: Range; time: number } {
//   if (diff === "easy")   return { N: 3, range: [1, 9]  as const, time: 120 };
//   if (diff === "medium") return { N: 4, range: [1, 12] as const, time: 110 };
//   return { N: 5, range: [1, 20] as const, time: 100 };
// }
// const rand = (min: number, max: number) =>
//   Math.floor(Math.random() * (max - min + 1)) + min;

// export default function TargetNumberPlay() {
//   const nav = useNavigation<Nav>();
//   const route = useRoute<any>();
//   const diff: Diff = (route.params?.difficulty || "easy");
//   const { N, range, time } = cfg(diff);

//   const [grid, setGrid] = useState<number[]>([]);
//   const [target, setTarget] = useState<number>(rand(range[0], range[1]));
//   const [timeLeft, setTimeLeft] = useState(time);
//   const [running, setRunning] = useState(false);
//   const [score, setScore] = useState(0);
//   const [remaining, setRemaining] = useState(0);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const makeRound = () => {
//     const t = rand(range[0], range[1]);
//     const cells = N * N;
//     const numTargets = Math.max(3, Math.min(7, Math.floor(cells / 2)));
//     const idxs = Array.from({ length: cells }, (_, i) => i).sort(() => Math.random() - 0.5);
//     const targetPositions = new Set(idxs.slice(0, numTargets));
//     const g = Array.from({ length: cells }, (_, i) =>
//       targetPositions.has(i) ? t : rand(range[0], range[1])
//     );
//     setGrid(g);
//     setTarget(t);
//     setRemaining(numTargets);
//   };

//   useEffect(makeRound, [N, diff]);

//   useEffect(() => {
//     if (running && timeLeft > 0) {
//       if (timerRef.current) clearInterval(timerRef.current);
//       timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
//     }
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [running, timeLeft]);

//   useEffect(() => { if (timeLeft <= 0) end("timeUp"); }, [timeLeft]);

//   const end = (endedBy: "completed" | "timeUp") => {
//     setRunning(false);
//     if (timerRef.current) clearInterval(timerRef.current);
//     const timeTaken = time - Math.max(0, timeLeft);
//     nav.navigate("MathResults", { score, totalQuestions: 1, timeTaken, endedBy, gameType: "target-number" });
//   };

//   const tap = (i: number) => {
//     if (!running) return;
//     if (grid[i] !== target) return;
//     const g = [...grid];
//     g[i] = -1; // mark found
//     setGrid(g);
//     setRemaining(r => r - 1);
//     setScore(s => s + 1);
//     if (remaining - 1 <= 0) makeRound();
//   };

//   const formatTime = (s: number) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   return (
//     <View style={{ flex: 1, backgroundColor: "white" }}>
//       {/* Header */}
//       <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12, backgroundColor: PALETTE.lightPink }}>
//         <TouchableOpacity onPress={() => { setRunning(false); nav.goBack(); }} style={{ width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.lightTeal }}>
//           <Text style={{ fontSize: 24 }}>←</Text>
//         </TouchableOpacity>
//         <View style={{ alignItems: "center" }}>
//           <Text style={{ fontSize: 14, color: "#6B7280" }}>Target Number</Text>
//           <Text style={{ fontSize: 20, fontWeight: "700" }}>{formatTime(timeLeft)} · {score}</Text>
//         </View>
//         <View style={{ width: 44, alignItems: "center" }}>
//           {running ? (
//             <TouchableOpacity onPress={() => setRunning(false)}><Text style={{ fontSize: 24 }}>⏸️</Text></TouchableOpacity>
//           ) : (
//             <TouchableOpacity onPress={() => setRunning(true)}><Text style={{ fontSize: 24 }}>▶️</Text></TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Body */}
//       <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
//         <View style={{ alignItems: "center", marginBottom: 8 }}>
//           <Text style={{ fontSize: 28, fontWeight: "800", color: PALETTE.teal }}>Target: {target}</Text>
//           <Text style={{ fontSize: 16, color: PALETTE.neutralMuted }}>Tap all {target}s · Remaining: {remaining}</Text>
//         </View>

//         {/* Grid (flex-wrap) */}
//         <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
//           {grid.map((v, i) => {
//             const hit = v === -1;
//             return (
//               <TouchableOpacity
//                 key={i}
//                 onPress={() => tap(i)}
//                 style={{
//                   width: `${100 / N}%`,
//                   maxWidth: 120,
//                   aspectRatio: 1,
//                   margin: 6,
//                   borderWidth: 2,
//                   borderRadius: 16,
//                   alignItems: "center",
//                   justifyContent: "center",
//                   backgroundColor: hit ? "#E5E7EB" : PALETTE.lightTeal,
//                   borderColor: PALETTE.teal,
//                   opacity: hit ? 0.5 : 1,
//                 }}
//               >
//                 <Text style={{ fontSize: 24, fontWeight: "800", color: PALETTE.teal }}>{hit ? "✓" : v}</Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         <View style={{ alignItems: "center", marginTop: 16 }}>
//           {!running ? (
//             <TouchableOpacity onPress={() => setRunning(true)} style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, backgroundColor: PALETTE.teal }}>
//               <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>Start</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity onPress={() => setRunning(false)} style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, backgroundColor: PALETTE.lightPink }}>
//               <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>Pause</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// }


//asaasd



// screens/Games/Puzzle/TargetNumberPlay.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
type Diff = "easy" | "medium" | "hard";
type Range = readonly [number, number];

function cfg(diff: Diff): { N: number; range: Range; time: number } {
  if (diff === "easy")   return { N: 3, range: [1, 9]  as const, time: 120 };
  if (diff === "medium") return { N: 4, range: [1, 12] as const, time: 110 };
  return { N: 5, range: [1, 20] as const, time: 100 };
}
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function TargetNumberPlay() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const diff: Diff = (route.params?.difficulty || "easy");
  const { N, range, time } = cfg(diff);

  const [grid, setGrid] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(rand(range[0], range[1]));
  const [timeLeft, setTimeLeft] = useState(time);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const makeRound = () => {
    const t = rand(range[0], range[1]);
    const cells = N * N;
    const numTargets = Math.max(3, Math.min(7, Math.floor(cells / 2)));
    const idxs = Array.from({ length: cells }, (_, i) => i);
    // Fisher-Yates shuffle limited slice for performance on larger sizes
    for (let i = numTargets; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      [idxs[i - 1], idxs[j]] = [idxs[j], idxs[i - 1]];
    }
    const targetPositions = new Set(idxs.slice(0, numTargets));
    const g = Array.from({ length: cells }, (_, i) => targetPositions.has(i) ? t : rand(range[0], range[1]));
    setGrid(g);
    setTarget(t);
    setRemaining(numTargets);
  };

  useEffect(() => { makeRound(); setMistakes(0); setTimeLeft(time); setRunning(false); }, [N, diff, time]);

  // timer
  useEffect(() => {
    if (running && timeLeft > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, timeLeft]);

  useEffect(() => { if (timeLeft <= 0) end("timeUp"); }, [timeLeft]);
  useEffect(() => { if (mistakes >= 5) { Alert.alert("Game Over", "Too many wrong taps."); end("timeUp"); } }, [mistakes]);

  const end = (endedBy: "completed" | "timeUp") => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = time - Math.max(0, timeLeft);
    nav.navigate("MathResults", { score, totalQuestions: 1, timeTaken, endedBy, gameType: "target-number" });
  };

  const tap = (i: number) => {
    if (!running) return;
    if (grid[i] === -1) return; // already tapped
    if (grid[i] !== target) { setMistakes(m => m + 1); return; }
    const g = [...grid]; g[i] = -1; setGrid(g);
    setRemaining(r => r - 1);
    setScore(s => s + 1);
    if (remaining - 1 <= 0) makeRound();
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12, backgroundColor: PALETTE.lightPink }}>
        <TouchableOpacity onPress={() => { setRunning(false); nav.goBack(); }} style={{ width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.lightTeal }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>Target Number</Text>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>{formatTime(timeLeft)} · {score} · ❌{mistakes}/5</Text>
        </View>
        <View style={{ width: 44, alignItems: "center" }}>
          {running ? (
            <TouchableOpacity onPress={() => setRunning(false)}><Text style={{ fontSize: 24 }}>⏸️</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setRunning(true)}><Text style={{ fontSize: 24 }}>▶️</Text></TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: PALETTE.teal }}>Target: {target}</Text>
          <Text style={{ fontSize: 16, color: PALETTE.neutralMuted }}>Tap all {target}s · Remaining: {remaining}</Text>
        </View>

        {/* Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
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
                  backgroundColor: hit ? "#E5E7EB" : PALETTE.lightTeal,
                  borderColor: PALETTE.teal,
                  opacity: hit ? 0.5 : 1,
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: "800", color: PALETTE.teal }}>{hit ? "✓" : v}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ alignItems: "center", marginTop: 16 }}>
          {!running ? (
            <TouchableOpacity onPress={() => setRunning(true)} style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, backgroundColor: PALETTE.teal }}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setRunning(false)} style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, backgroundColor: PALETTE.lightPink }}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>Pause</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
