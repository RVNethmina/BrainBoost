// // screens/Games/Puzzle/OrderTapPlay.tsx
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useEffect, useRef, useState } from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
// type Diff = "easy" | "medium" | "hard";

// function gridSize(diff: Diff) { return diff === "easy" ? 3 : diff === "medium" ? 4 : 5; }
// function shuffled<T>(arr: T[]) {
//   const a = [...arr];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// }

// export default function OrderTapPlay() {
//   const nav = useNavigation<Nav>();
//   const route = useRoute<any>();
//   const diff: Diff = (route.params?.difficulty || "easy");
//   const N = gridSize(diff);
//   const total = N * N;
//   const initialTime = diff === "easy" ? 120 : diff === "medium" ? 110 : 100;

//   const [arr, setArr] = useState<number[]>([]);
//   const [need, setNeed] = useState(1);
//   const [score, setScore] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(initialTime);
//   const [running, setRunning] = useState(false);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const newRound = () => {
//     setArr(shuffled(Array.from({ length: total }, (_, i) => i + 1)));
//     setNeed(1);
//   };

//   useEffect(newRound, [total]);

//   useEffect(() => {
//     if (running && timeLeft > 0) {
//       if (timerRef.current) clearInterval(timerRef.current);
//       timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
//     }
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [running, timeLeft]);

//   useEffect(() => { if (timeLeft <= 0) end("timeUp"); }, [timeLeft]);

//   const tap = (val: number) => {
//     if (!running) return;
//     if (val !== need) return;
//     if (need === total) {
//       setScore(s => s + 1);
//       newRound();
//       return;
//     }
//     setNeed(n => n + 1);
//   };

//   const end = (endedBy: "timeUp" | "completed") => {
//     setRunning(false);
//     if (timerRef.current) clearInterval(timerRef.current);
//     const timeTaken = initialTime - Math.max(0, timeLeft);
//     nav.navigate("MathResults", { score, totalQuestions: 1, timeTaken, endedBy, gameType: "order-tap" });
//   };

//   const formatTime = (s: number) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   return (
//     <View style={{ flex: 1, backgroundColor: "white" }}>
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: PALETTE.lightPink }]}>
//         <TouchableOpacity onPress={() => { setRunning(false); nav.goBack(); }} style={[styles.iconBtn, { backgroundColor: PALETTE.lightTeal }]}>
//           <Text style={styles.iconText}>←</Text>
//         </TouchableOpacity>
//         <View style={{ alignItems: "center" }}>
//           <Text style={{ fontSize: 14, color: "#6B7280" }}>Order Tap</Text>
//           <Text style={{ fontSize: 20, fontWeight: "700" }}>{formatTime(timeLeft)} · {score}</Text>
//         </View>
//         <View style={{ width: 44, alignItems: "center" }}>
//           {running ? (
//             <TouchableOpacity onPress={() => setRunning(false)}><Text style={styles.iconText}>⏸️</Text></TouchableOpacity>
//           ) : (
//             <TouchableOpacity onPress={() => setRunning(true)}><Text style={styles.iconText}>▶️</Text></TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Body */}
//       <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
//         <View style={{ alignItems: "center", marginBottom: 12 }}>
//           <Text style={{ fontSize: 28, fontWeight: "800", color: PALETTE.teal }}>Next: {need}</Text>
//           <Text style={{ fontSize: 16, color: PALETTE.neutralMuted }}>Tap numbers in order</Text>
//         </View>

//         {/* Grid */}
//         <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
//           {arr.map((v) => (
//             <TouchableOpacity
//               key={v}
//               onPress={() => tap(v)}
//               style={{
//                 width: `${100 / N}%`,
//                 maxWidth: 120,
//                 aspectRatio: 1,
//                 margin: 6,
//                 borderWidth: 2,
//                 borderRadius: 16,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 backgroundColor: v < need ? "#E5E7EB" : PALETTE.lightTeal,
//                 borderColor: PALETTE.teal,
//                 opacity: v < need ? 0.4 : 1,
//               }}
//             >
//               <Text style={{ fontSize: 24, fontWeight: "800", color: PALETTE.teal }}>{v}</Text>
//             </TouchableOpacity>
//           ))}
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

// const styles = StyleSheet.create({
//   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12 },
//   iconBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
//   iconText: { fontSize: 24 },
// });
// screens/Games/Puzzle/OrderTapPlay.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
type Diff = "easy" | "medium" | "hard";

function gridSize(diff: Diff) { return diff === "easy" ? 3 : diff === "medium" ? 4 : 5; }
function shuffled<T>(arr: T[]) { const a = [...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

export default function OrderTapPlay() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const diff: Diff = (route.params?.difficulty || "easy");
  const N = gridSize(diff);
  const total = N * N;
  const initialTime = diff === "easy" ? 120 : diff === "medium" ? 110 : 100;

  const [arr, setArr] = useState<number[]>([]);
  const [need, setNeed] = useState(1);
  const [phase, setPhase] = useState<"asc" | "desc">("asc"); // NEW
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const newRound = () => {
    setArr(shuffled(Array.from({ length: total }, (_, i) => i + 1)));
    setNeed(1);
    setPhase("asc");
    setShowHint(null);
  };

  useEffect(newRound, [total]);

  useEffect(() => {
    if (running && timeLeft > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, timeLeft]);

  useEffect(() => { if (timeLeft <= 0) end("timeUp"); }, [timeLeft]);

  const tap = (val: number) => {
    if (!running) return;
    const target = phase === "asc" ? need : (total - need + 1);
    if (val !== target) return;
    if (phase === "asc" && need === total) {
      // phase complete → switch to Descend
      setPhase("desc");
      setNeed(1);
      setScore(s => s + 1);
      return;
    }
    if (phase === "desc" && need === total) {
      // completed both phases
      setScore(s => s + 2); // bonus for finishing
      newRound();
      return;
    }
    setNeed(n => n + 1);
  };

  const end = (endedBy: "timeUp" | "completed") => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = initialTime - Math.max(0, timeLeft);
    nav.navigate("MathResults", { score, totalQuestions: 1, timeTaken, endedBy, gameType: "order-tap" });
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const requestHint = () => {
    const target = phase === "asc" ? need : (total - need + 1);
    setShowHint(target);
    setTimeout(() => setShowHint(null), 900);
  };

  const nextLabel = phase === "asc" ? need : (total - need + 1);
  const subtitle = phase === "asc" ? "Tap 1 → " + total : "Now tap " + total + " → 1";

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12, backgroundColor: PALETTE.lightPink }}>
        <TouchableOpacity onPress={() => { setRunning(false); nav.goBack(); }} style={{ width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.lightTeal }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>Order Tap</Text>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>{formatTime(timeLeft)} · {score}</Text>
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
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: PALETTE.teal }}>
            Next: {nextLabel}
          </Text>
          <Text style={{ fontSize: 16, color: PALETTE.neutralMuted }}>{subtitle}</Text>
        </View>

        {/* Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
          {arr.map((v) => {
            const tapped = (phase === "asc" && v < need) || (phase === "desc" && v > (total - need + 1));
            const isHint = showHint === v;
            return (
              <TouchableOpacity
                key={v}
                onPress={() => tap(v)}
                style={{
                  width: `${100 / N}%`,
                  maxWidth: 120,
                  aspectRatio: 1,
                  margin: 6,
                  borderWidth: 2,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: tapped ? "#E5E7EB" : (isHint ? "#FFEDCC" : PALETTE.lightTeal),
                  borderColor: isHint ? PALETTE.orange : PALETTE.teal,
                  opacity: tapped ? 0.45 : 1,
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: "800", color: PALETTE.teal }}>{v}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Controls */}
        <View style={{ alignItems: "center", marginTop: 16 }}>
          {!running ? (
            <TouchableOpacity onPress={() => setRunning(true)} style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, backgroundColor: PALETTE.teal }}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>Start</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={() => setRunning(false)} style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, backgroundColor: PALETTE.lightPink, marginRight: 10 }}>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={requestHint} style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, backgroundColor: "#FFEDCC" }}>
                <Text style={{ color: PALETTE.orange, fontSize: 18, fontWeight: "700" }}>Hint</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
