// // screens/Games/Puzzle/JigsawPlay.tsx
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
// type Diff = "easy" | "medium" | "hard";

// function gridSizeFor(diff: Diff) {
//   return diff === "easy" ? 3 : diff === "medium" ? 4 : 5;
// }
// function shuffled<T>(arr: T[]) {
//   const a = [...arr];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// }

// export default function JigsawPlay() {
//   const nav = useNavigation<Nav>();
//   const route = useRoute<any>();
//   const diff: Diff = (route.params?.difficulty || "easy");
//   const N = gridSizeFor(diff);
//   const initialTime = diff === "easy" ? 150 : diff === "medium" ? 120 : 120;

//   const solved = useMemo(() => Array.from({ length: N * N }, (_, i) => i + 1), [N]);
//   const [tiles, setTiles] = useState<number[]>(() => shuffled(solved));
//   const [sel, setSel] = useState<number | null>(null);
//   const [moves, setMoves] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(initialTime);
//   const [running, setRunning] = useState(false);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   // timer
//   useEffect(() => {
//     if (running && timeLeft > 0) {
//       if (timerRef.current) clearInterval(timerRef.current);
//       timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
//     } else {
//       if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
//     }
//     return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
//   }, [running, timeLeft]);

//   // time up
//   useEffect(() => { if (timeLeft <= 0) end("timeUp"); }, [timeLeft]);

//   // solved check
//   useEffect(() => {
//     if (tiles.every((v, idx) => v === solved[idx])) {
//       Alert.alert("Great job!", "Puzzle solved 🎉");
//       end("completed");
//     }
//   }, [tiles, solved]);

//   const end = (endedBy: "timeUp" | "completed") => {
//     setRunning(false);
//     if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
//     const timeTaken = initialTime - Math.max(0, timeLeft);
//     nav.navigate("MathResults", {
//       score: Math.max(1, (N * N) - moves),
//       totalQuestions: 1,
//       timeTaken,
//       endedBy,
//       gameType: "jigsaw",
//     });
//   };

//   const tapTile = (i: number) => {
//     if (!running) return;
//     if (sel == null) { setSel(i); return; }
//     if (sel === i) { setSel(null); return; }
//     const a = [...tiles];
//     [a[sel], a[i]] = [a[i], a[sel]];
//     setTiles(a);
//     setSel(null);
//     setMoves(m => m + 1);
//   };

//   const formatTime = (s: number) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   return (
//     <View style={styles.container}>
//       {/* Header (same pattern as PuzzlePlayTemplate) */}
//       <View style={[styles.header, { backgroundColor: PALETTE.lightPink }]}>
//         <TouchableOpacity
//           onPress={() => { setRunning(false); nav.goBack(); }}
//           style={[styles.iconBtn, { backgroundColor: PALETTE.lightTeal }]}
//           accessibilityRole="button"
//         >
//           <Text style={styles.iconText}>←</Text>
//         </TouchableOpacity>

//         <View style={styles.centerHeader}>
//           <Text style={styles.headerSub}>Jigsaw</Text>
//           <Text style={styles.headerMain}>{formatTime(timeLeft)} · {moves} moves</Text>
//         </View>

//         <View style={{ width: 44, alignItems: "center" }}>
//           {running ? (
//             <TouchableOpacity onPress={() => setRunning(false)} accessibilityRole="button">
//               <Text style={styles.iconText}>⏸️</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity onPress={() => setRunning(true)} accessibilityRole="button">
//               <Text style={styles.iconText}>▶️</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Body */}
//       <View style={styles.body}>
//         <View style={{ alignItems: "center", marginBottom: 12 }}>
//           <Text style={{ fontSize: 22, fontWeight: "600", color: PALETTE.teal }}>
//             Tap two tiles to swap
//           </Text>
//         </View>

//         {/* Grid (flex-wrap; each tile gets percentage width) */}
//         <View style={styles.gridWrap}>
//           {tiles.map((num, i) => {
//             const isSel = i === sel;
//             return (
//               <TouchableOpacity
//                 key={i}
//                 onPress={() => tapTile(i)}
//                 accessibilityRole="button"
//                 style={[
//                   styles.tile,
//                   {
//                     width: `${100 / N}%`,
//                     backgroundColor: isSel ? PALETTE.teal : "#F3F4F6",
//                     borderColor: PALETTE.teal,
//                   },
//                 ]}
//               >
//                 <Text style={[styles.tileText, { color: isSel ? "white" : PALETTE.teal }]}>{num}</Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         <View style={{ alignItems: "center", marginTop: 16 }}>
//           {!running ? (
//             <TouchableOpacity
//               style={[styles.cta, { backgroundColor: PALETTE.teal }]}
//               onPress={() => setRunning(true)}
//               accessibilityRole="button"
//             >
//               <Text style={styles.ctaText}>Start</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity
//               style={[styles.cta, { backgroundColor: PALETTE.lightPink }]}
//               onPress={() => setRunning(false)}
//               accessibilityRole="button"
//             >
//               <Text style={styles.ctaText}>Pause</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// }

// const TILE_HEIGHT = 70;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "white" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingTop: 40,
//     paddingBottom: 12,
//   },
//   iconBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
//   iconText: { fontSize: 24 },
//   centerHeader: { alignItems: "center" },
//   headerSub: { fontSize: 14, color: "#6B7280" },
//   headerMain: { fontSize: 20, fontWeight: "700" },

//   body: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
//   gridWrap: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//   },
//   tile: {
//     height: TILE_HEIGHT,
//     margin: 4,
//     borderWidth: 2,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   tileText: { fontSize: 24, fontWeight: "700" },
//   cta: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
//   ctaText: { color: "white", fontSize: 18, fontWeight: "700" },
// });
// screens/Games/Puzzle/JigsawPlay.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
type Diff = "easy" | "medium" | "hard";

function gridSizeFor(diff: Diff) {
  return diff === "easy" ? 3 : diff === "medium" ? 4 : 5;
}
function shuffled<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function JigsawPlay() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const diff: Diff = route.params?.difficulty || "easy";
  const N = gridSizeFor(diff);
  const initialTime = diff === "easy" ? 150 : diff === "medium" ? 120 : 120;
  const WRONG_LIMIT = 5;

  // solved reference [1..N*N]
  const solved = useMemo(
    () => Array.from({ length: N * N }, (_, i) => i + 1),
    [N]
  );

  const makeStartTiles = () => {
    let t = shuffled(solved);
    // avoid starting already solved
    if (t.every((v, i) => v === solved[i])) t = shuffled(t);
    return t;
  };

  const [tiles, setTiles] = useState<number[]>(makeStartTiles);
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [running, setRunning] = useState(false);
  const [flashWrong, setFlashWrong] = useState<number | null>(null); // index for quick red flash
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // helpers
  const countCorrect = (arr: number[]) =>
    arr.reduce((acc, v, i) => acc + (v === solved[i] ? 1 : 0), 0);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      s % 60
    ).padStart(2, "0")}`;

  // timer
  useEffect(() => {
    if (running && timeLeft > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [running, timeLeft]);

  // time up
  useEffect(() => {
    if (timeLeft <= 0) end("timeUp");
  }, [timeLeft]);

  // solved check
  useEffect(() => {
    if (tiles.every((v, idx) => v === solved[idx])) {
      Alert.alert("Great job!", "Puzzle solved 🎉");
      end("completed");
    }
  }, [tiles, solved]);

  // mistakes limit
  useEffect(() => {
    if (mistakes >= WRONG_LIMIT) {
      Alert.alert("Game Over", `You made ${WRONG_LIMIT} wrong moves.`);
      end("mistakes");
    }
  }, [mistakes]);

  const end = (endedBy: "timeUp" | "completed" | "mistakes") => {
    setRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const timeTaken = initialTime - Math.max(0, timeLeft);
    nav.navigate("MathResults", {
      score: Math.max(1, N * N - moves),
      totalQuestions: 1,
      timeTaken,
      endedBy,
      gameType: "jigsaw",
    });
  };

  const tapTile = (i: number) => {
    if (!running) return;
    if (sel == null) {
      setSel(i);
      return;
    }
    if (sel === i) {
      setSel(null);
      return;
    }

    // evaluate improvement
    const before = countCorrect(tiles);
    const a = [...tiles];
    [a[sel], a[i]] = [a[i], a[sel]];
    const after = countCorrect(a);

    setTiles(a);
    setSel(null);
    setMoves((m) => m + 1);

    if (after <= before) {
      // wrong move feedback + count
      setMistakes((m) => m + 1);
      setFlashWrong(i);
      setTimeout(() => setFlashWrong(null), 150);
    }
  };

  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTiles(makeStartTiles());
    setSel(null);
    setMoves(0);
    setMistakes(0);
    setTimeLeft(initialTime);
    setRunning(false);
  };

  const showRules = () => {
    Alert.alert(
      "How to Play",
      `• Tap two tiles to swap positions.\n• Try to arrange numbers in order.\n• A "wrong move" is a swap that doesn't increase correctly placed tiles.\n• ${WRONG_LIMIT} wrong moves ends the game.\n• Use Reset anytime to reshuffle and start over.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PALETTE.lightPink }]}>
        <TouchableOpacity
          onPress={() => {
            setRunning(false);
            nav.goBack();
          }}
          style={[styles.iconBtn, { backgroundColor: PALETTE.lightTeal }]}
          accessibilityRole="button"
        >
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>

        <View style={styles.centerHeader}>
          <Text style={styles.headerSub}>Jigsaw</Text>
          <Text style={styles.headerMain}>
            {formatTime(timeLeft)} · {moves} moves · {mistakes}/{WRONG_LIMIT} ❌
          </Text>
        </View>

        <View style={{ width: 44, alignItems: "center" }}>
          {running ? (
            <TouchableOpacity
              onPress={() => setRunning(false)}
              accessibilityRole="button"
            >
              <Text style={styles.iconText}>⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setRunning(true)}
              accessibilityRole="button"
            >
              <Text style={styles.iconText}>▶️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Top actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={showRules}
            style={[styles.smallBtn, { backgroundColor: "#FFF" }]}
          >
            <Text style={[styles.smallBtnText, { color: PALETTE.teal }]}>
              Rules
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resetGame}
            style={[styles.smallBtn, { backgroundColor: PALETTE.teal }]}
          >
            <Text style={[styles.smallBtnText, { color: "white" }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 18, color: PALETTE.neutralMuted }}>
            Tap two tiles to swap · Place all in order
          </Text>
        </View>

        {/* Grid */}
        <View style={styles.gridWrap}>
          {tiles.map((num, i) => {
            const isSel = i === sel;
            const isCorrect = num === solved[i];
            const isFlashWrong = i === flashWrong;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => tapTile(i)}
                accessibilityRole="button"
                style={[
                  styles.tile,
                  {
                    width: `${100 / N}%`,
                    backgroundColor: isSel
                      ? PALETTE.teal
                      : isFlashWrong
                      ? "#FEE2E2"
                      : "#FFFFFF",
                    borderColor: isCorrect ? PALETTE.lightTeal : PALETTE.teal,
                    shadowOpacity: isSel ? 0.25 : 0.12,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tileText,
                    { color: isSel ? "white" : PALETTE.teal },
                  ]}
                >
                  {num}
                </Text>
                {isCorrect && <Text style={styles.tinyCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Start/Pause big CTA */}
        <View style={{ alignItems: "center", marginTop: 16 }}>
          {!running ? (
            <TouchableOpacity
              style={[styles.cta, { backgroundColor: PALETTE.teal }]}
              onPress={() => setRunning(true)}
              accessibilityRole="button"
            >
              <Text style={styles.ctaText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.cta, { backgroundColor: PALETTE.lightPink }]}
              onPress={() => setRunning(false)}
              accessibilityRole="button"
            >
              <Text style={styles.ctaText}>Pause</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 24 },
  centerHeader: { alignItems: "center" },
  headerSub: { fontSize: 14, color: "#6B7280" },
  headerMain: { fontSize: 18, fontWeight: "700" },

  body: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  smallBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PALETTE.teal,
  },
  smallBtnText: { fontSize: 14, fontWeight: "700" },

  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 6,
  },
  tile: {
    maxWidth: 120,
    aspectRatio: 1,
    margin: 6,
    borderWidth: 2,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tileText: { fontSize: 26, fontWeight: "800" },
  tinyCheck: {
    position: "absolute",
    bottom: 8,
    right: 10,
    fontSize: 14,
    color: PALETTE.teal,
    opacity: 0.75,
    fontWeight: "700",
  },
  cta: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  ctaText: { color: "white", fontSize: 18, fontWeight: "700" },
});
