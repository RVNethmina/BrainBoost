
// import { useSettings } from "@/app/contexts/SettingsContext"; // Add this import
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useEffect, useRef, useState } from "react";
// import { Text, TouchableOpacity, View } from "react-native";

// type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
// type Diff = "easy" | "medium" | "hard";

// function gridSize(diff: Diff) { return diff === "easy" ? 3 : diff === "medium" ? 4 : 5; }
// function shuffled<T>(arr: T[]) { const a = [...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

// export default function OrderTapPlay() {
//   const nav = useNavigation<Nav>();
//   const route = useRoute<any>();
//   // Add settings hook
//   const { theme, getFontScale } = useSettings();
//   const fontScale = getFontScale();
//   const isDark = theme === 'dark';
  
//   const diff: Diff = (route.params?.difficulty || "easy");
//   const N = gridSize(diff);
//   const total = N * N;
//   const initialTime = diff === "easy" ? 120 : diff === "medium" ? 110 : 100;

//   // Dynamic colors based on theme
//   const bgColor = isDark ? '#1a1a1a' : '#fff';
//   const textColor = isDark ? '#fff' : PALETTE.neutralDark;
//   const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
//   const cardBg = isDark ? '#2a2a2a' : PALETTE.lightTeal;
//   const secondaryTextColor = isDark ? '#ccc' : PALETTE.neutralMuted;
//   const disabledBg = isDark ? '#3a3a3a' : '#E5E7EB';
//   const hintBg = isDark ? '#4a3a00' : '#FFEDCC';

//   const [arr, setArr] = useState<number[]>([]);
//   const [need, setNeed] = useState(1);
//   const [phase, setPhase] = useState<"asc" | "desc">("asc"); // NEW
//   const [score, setScore] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(initialTime);
//   const [running, setRunning] = useState(false);
//   const [showHint, setShowHint] = useState<number | null>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const newRound = () => {
//     setArr(shuffled(Array.from({ length: total }, (_, i) => i + 1)));
//     setNeed(1);
//     setPhase("asc");
//     setShowHint(null);
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
//     const target = phase === "asc" ? need : (total - need + 1);
//     if (val !== target) return;
//     if (phase === "asc" && need === total) {
//       // phase complete → switch to Descend
//       setPhase("desc");
//       setNeed(1);
//       setScore(s => s + 1);
//       return;
//     }
//     if (phase === "desc" && need === total) {
//       // completed both phases
//       setScore(s => s + 2); // bonus for finishing
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

//   const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
//   const requestHint = () => {
//     const target = phase === "asc" ? need : (total - need + 1);
//     setShowHint(target);
//     setTimeout(() => setShowHint(null), 900);
//   };

//   const nextLabel = phase === "asc" ? need : (total - need + 1);
//   const subtitle = phase === "asc" ? "Tap 1 → " + total : "Now tap " + total + " → 1";

//   return (
//     <View style={{ flex: 1, backgroundColor: bgColor }}>
//       {/* Header */}
//       <View style={{ 
//         flexDirection: "row", 
//         alignItems: "center", 
//         justifyContent: "space-between", 
//         paddingHorizontal: 20, 
//         paddingTop: 40, 
//         paddingBottom: 12, 
//         backgroundColor: headerBg 
//       }}>
//         <TouchableOpacity 
//           onPress={() => { setRunning(false); nav.goBack(); }} 
//           style={{ 
//             width: 48, 
//             height: 48, 
//             borderRadius: 12, 
//             alignItems: "center", 
//             justifyContent: "center", 
//             backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal 
//           }}
//         >
//           <Text style={{ fontSize: 24, color: textColor }}>←</Text>
//         </TouchableOpacity>
//         <View style={{ alignItems: "center" }}>
//           <Text style={{ 
//             fontSize: 14 * fontScale, 
//             color: secondaryTextColor 
//           }}>
//             Order Tap
//           </Text>
//           <Text style={{ 
//             fontSize: 20 * fontScale, 
//             fontWeight: "700",
//             color: textColor 
//           }}>
//             {formatTime(timeLeft)} · {score}
//           </Text>
//         </View>
//         <View style={{ width: 44, alignItems: "center" }}>
//           {running ? (
//             <TouchableOpacity onPress={() => setRunning(false)}>
//               <Text style={{ fontSize: 24 }}>⏸️</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity onPress={() => setRunning(true)}>
//               <Text style={{ fontSize: 24 }}>▶️</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Body */}
//       <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
//         <View style={{ alignItems: "center", marginBottom: 12 }}>
//           <Text style={{ 
//             fontSize: 28 * fontScale, 
//             fontWeight: "800", 
//             color: PALETTE.teal 
//           }}>
//             Next: {nextLabel}
//           </Text>
//           <Text style={{ 
//             fontSize: 16 * fontScale, 
//             color: secondaryTextColor 
//           }}>
//             {subtitle}
//           </Text>
//         </View>

//         {/* Grid */}
//         <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
//           {arr.map((v) => {
//             const tapped = (phase === "asc" && v < need) || (phase === "desc" && v > (total - need + 1));
//             const isHint = showHint === v;
//             return (
//               <TouchableOpacity
//                 key={v}
//                 onPress={() => tap(v)}
//                 style={{
//                   width: `${100 / N}%`,
//                   maxWidth: 120,
//                   aspectRatio: 1,
//                   margin: 6,
//                   borderWidth: 2,
//                   borderRadius: 16,
//                   alignItems: "center",
//                   justifyContent: "center",
//                   backgroundColor: tapped ? disabledBg : (isHint ? hintBg : cardBg),
//                   borderColor: isHint ? PALETTE.orange : PALETTE.teal,
//                   opacity: tapped ? 0.45 : 1,
//                 }}
//               >
//                 <Text style={{ 
//                   fontSize: 24 * fontScale, 
//                   fontWeight: "800", 
//                   color: isDark ? '#fff' : PALETTE.teal 
//                 }}>
//                   {v}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         {/* Controls */}
//         <View style={{ alignItems: "center", marginTop: 16 }}>
//           {!running ? (
//             <TouchableOpacity 
//               onPress={() => setRunning(true)} 
//               style={{ 
//                 paddingHorizontal: 24, 
//                 paddingVertical: 14, 
//                 borderRadius: 16, 
//                 backgroundColor: PALETTE.teal 
//               }}
//             >
//               <Text style={{ 
//                 color: "white", 
//                 fontSize: 18 * fontScale, 
//                 fontWeight: "700" 
//               }}>
//                 Start
//               </Text>
//             </TouchableOpacity>
//           ) : (
//             <View style={{ flexDirection: "row" }}>
//               <TouchableOpacity 
//                 onPress={() => setRunning(false)} 
//                 style={{ 
//                   paddingHorizontal: 24, 
//                   paddingVertical: 14, 
//                   borderRadius: 16, 
//                   backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightPink, 
//                   marginRight: 10 
//                 }}
//               >
//                 <Text style={{ 
//                   color: "white", 
//                   fontSize: 18 * fontScale, 
//                   fontWeight: "700" 
//                 }}>
//                   Pause
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 onPress={requestHint} 
//                 style={{ 
//                   paddingHorizontal: 24, 
//                   paddingVertical: 14, 
//                   borderRadius: 16, 
//                   backgroundColor: hintBg 
//                 }}
//               >
//                 <Text style={{ 
//                   color: PALETTE.orange, 
//                   fontSize: 18 * fontScale, 
//                   fontWeight: "700" 
//                 }}>
//                   Hint
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// }

import { useSettings } from "@/app/contexts/SettingsContext"; // Add this import
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
type Diff = "easy" | "medium" | "hard";

// Configuration for 4 progressive levels
function cfg(diff: Diff): { N: number; time: number; totalLevels: number } {
  if (diff === "easy") return { N: 3, time: 120, totalLevels: 4 }; // 3x3 grid (9 tiles)
  if (diff === "medium") return { N: 4, time: 110, totalLevels: 4 }; // 4x4 grid (16 tiles)
  return { N: 5, time: 100, totalLevels: 4 }; // 5x5 grid (25 tiles)
}

function gridSize(diff: Diff) { 
    if (diff === "easy") return 3;
    if (diff === "medium") return 4;
    return 5;
}
function shuffled<T>(arr: T[]) { const a = [...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }


export default function OrderTapPlay() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  // Add settings hook
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';
  
  const diff: Diff = (route.params?.difficulty || "easy");
  const config = cfg(diff);
  const N = config.N;
  const initialTime = config.time;
  const maxLevels = config.totalLevels;

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : PALETTE.neutralDark;
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
  const cardBg = isDark ? '#2a2a2a' : PALETTE.lightTeal;
  const secondaryTextColor = isDark ? '#ccc' : PALETTE.neutralMuted;
  const disabledBg = isDark ? '#3a3a3a' : '#E5E7EB';
  const hintBg = isDark ? '#4a3a00' : '#FFEDCC';

  // --- Game State ---
  const [arr, setArr] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [need, setNeed] = useState(1); // The number the user needs to tap next
  const [phase, setPhase] = useState<"asc" | "desc">("asc"); // asc (1->N) or desc (N->1)
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());
  const maxNumber = N * N;

  const newRound = (level: number) => {
    // Generate tiles from 1 up to the max number for this grid size
    setArr(shuffled(Array.from({ length: maxNumber }, (_, i) => i + 1)));
    setNeed(1);
    setPhase("asc");
    setShowHint(null);
  };

  useEffect(() => {
      newRound(1);
  }, [N]); // Re-generate grid when difficulty changes

  // Cycle levels and reset round when successful
  useEffect(() => {
    if (currentLevel > maxLevels) {
      end("completed");
    } else {
        newRound(currentLevel);
    }
  }, [currentLevel, maxLevels]);


  // Timer logic
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
    
    // Calculate the target number based on the current phase
    const target = phase === "asc" ? need : (maxNumber - need + 1);
    
    if (val !== target) {
        Alert.alert("Wrong Number!", `You tapped ${val}. Please tap ${target}.`, [{ text: 'OK' }]);
        return;
    }
    
    // Correct tap logic
    if (phase === "asc" && need === maxNumber) {
      // Phase 1 (1->N) complete → switch to Descend phase
      setPhase("desc");
      setNeed(1); // Reset counter for the descent phase (N down to 1)
      setScore(s => s + maxNumber); // Score bonus for completing a phase
      return;
    }
    
    if (phase === "desc" && need === maxNumber) {
      // Phase 2 (N->1) complete → next level
      setScore(s => s + maxNumber * 2); // Larger bonus for completing the level
      setCurrentLevel(l => l + 1);
      return;
    }
    
    // Continue in current phase
    setNeed(n => n + 1);
    setScore(s => s + 1);
  };

  const end = (endedBy: "completed" | "timeUp") => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = initialTime - Math.max(0, timeLeft);

    // Score is complex, use the raw score and level as metrics
    nav.navigate("MathResults", { 
        score, 
        totalQuestions: maxLevels * maxNumber * 2, // Max possible score units 
        timeTaken, 
        endedBy, 
        gameType: "order-tap" 
    });
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  
  const requestHint = () => {
    const target = phase === "asc" ? need : (maxNumber - need + 1);
    setShowHint(target);
    setTimeout(() => setShowHint(null), 900);
  };

  const nextLabel = phase === "asc" ? need : (maxNumber - need + 1);
  const subtitle = phase === "asc" ? `Tap 1 → ${maxNumber}` : `Tap ${maxNumber} → 1`;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        paddingHorizontal: 20, 
        paddingTop: 40, 
        paddingBottom: 12, 
        backgroundColor: headerBg 
      }}>
        <TouchableOpacity 
          onPress={() => { setRunning(false); nav.goBack(); }} 
          style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 12, 
            alignItems: "center", 
            justifyContent: "center", 
            backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal 
          }}
        >
          <Text style={{ fontSize: 24 * fontScale, color: textColor }}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={{ 
            fontSize: 14 * fontScale, 
            color: secondaryTextColor 
          }}>
            Order Tap | Level {currentLevel}/{maxLevels}
          </Text>
          <Text style={{ 
            fontSize: 20 * fontScale, 
            fontWeight: "700",
            color: textColor 
          }}>
            {formatTime(timeLeft)} · {score} ⭐
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
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          <Text style={{ 
            fontSize: 28 * fontScale, 
            fontWeight: "800", 
            color: PALETTE.teal 
          }}>
            {phase === "asc" ? "Ascending" : "Descending"}: {nextLabel}
          </Text>
          <Text style={{ 
            fontSize: 16 * fontScale, 
            color: secondaryTextColor 
          }}>
            {subtitle}
          </Text>
        </View>

        {/* Grid */}
        <View style={styles.gridContainer}>
          {arr.map((v) => {
            // Check if the tile has already been tapped in the sequence
            const tappedAsc = (phase === "asc" && v < need);
            const tappedDesc = (phase === "desc" && v > nextLabel);
            const tapped = tappedAsc || tappedDesc;
            
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
                  backgroundColor: tapped ? disabledBg : (isHint ? hintBg : cardBg),
                  borderColor: isHint ? PALETTE.orange : PALETTE.teal,
                  opacity: tapped ? 0.45 : 1,
                }}
                disabled={tapped || !running}
              >
                <Text style={{ 
                  fontSize: 24 * fontScale, 
                  fontWeight: "800", 
                  color: isDark ? '#fff' : PALETTE.teal 
                }}>
                  {v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Controls */}
        <View style={{ alignItems: "center", marginTop: 16 }}>
          {!running ? (
            <TouchableOpacity 
              onPress={() => setRunning(true)} 
              style={{ 
                paddingHorizontal: 24, 
                paddingVertical: 14, 
                borderRadius: 16, 
                backgroundColor: PALETTE.teal 
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
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity 
                onPress={() => setRunning(false)} 
                style={{ 
                  paddingHorizontal: 24, 
                  paddingVertical: 14, 
                  borderRadius: 16, 
                  backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightPink, 
                  marginRight: 10 
                }}
              >
                <Text style={{ 
                  color: textColor, 
                  fontSize: 18 * fontScale, 
                  fontWeight: "700" 
                }}>
                  Pause
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={requestHint} 
                style={{ 
                  paddingHorizontal: 24, 
                  paddingVertical: 14, 
                  borderRadius: 16, 
                  backgroundColor: hintBg 
                }}
              >
                <Text style={{ 
                  color: PALETTE.orange, 
                  fontSize: 18 * fontScale, 
                  fontWeight: "700" 
                }}>
                  Hint
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 14 * fontScale, color: secondaryTextColor, marginTop: 16, textAlign: 'center' }}>
            Grid Size: {N}x{N} ({N*N} tiles)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    body: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
    gridContainer: { 
        flexDirection: "row", 
        flexWrap: "wrap", 
        justifyContent: "center" 
    }
});
