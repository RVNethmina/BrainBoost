// // screens/Games/Puzzle/SudokuPlay.tsx
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useEffect, useRef, useState } from "react";
// import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
// type Diff = "easy" | "medium" | "hard";

// function config(diff: Diff) {
//   if (diff === "easy") return { N: 4, boxR: 2, boxC: 2, holes: 6, time: 180 };
//   if (diff === "medium") return { N: 6, boxR: 2, boxC: 3, holes: 14, time: 240 };
//   return { N: 9, boxR: 3, boxC: 3, holes: 40, time: 420 };
// }

// function clone<T>(m: T[][]) { return m.map(r => [...r]); }
// function rng(n: number) { return Math.floor(Math.random() * n); }
// function makeEmpty(N: number) { return Array.from({ length: N }, () => Array(N).fill(0)); }

// function isSafe(board: number[][], r: number, c: number, v: number, boxR: number, boxC: number) {
//   const N = board.length;
//   for (let i = 0; i < N; i++) if (board[r][i] === v || board[i][c] === v) return false;
//   const sr = Math.floor(r / boxR) * boxR, sc = Math.floor(c / boxC) * boxC;
//   for (let i = 0; i < boxR; i++) for (let j = 0; j < boxC; j++) if (board[sr + i][sc + j] === v) return false;
//   return true;
// }
// function fillBoard(board: number[][], boxR: number, boxC: number): boolean {
//   const N = board.length;
//   for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (board[r][c] === 0) {
//     const nums = Array.from({ length: N }, (_, k) => k + 1).sort(() => Math.random() - 0.5);
//     for (const v of nums) {
//       if (isSafe(board, r, c, v, boxR, boxC)) {
//         board[r][c] = v;
//         if (fillBoard(board, boxR, boxC)) return true;
//         board[r][c] = 0;
//       }
//     }
//     return false;
//   }
//   return true;
// }
// function generateSudoku(N: number, boxR: number, boxC: number, holes: number) {
//   const full = makeEmpty(N);
//   fillBoard(full, boxR, boxC);
//   const solved = clone(full);
//   const puzzle = clone(full);
//   let removed = 0;
//   while (removed < holes) {
//     const r = rng(N), c = rng(N);
//     if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; removed++; }
//   }
//   return { puzzle, solved };
// }

// export default function SudokuPlay() {
//   const nav = useNavigation<Nav>();
//   const route = useRoute<any>();
//   const diff: Diff = (route.params?.difficulty || "easy");
//   const { N, boxR, boxC, holes, time } = config(diff);

//   const [initial, setInitial] = useState<number[][]>([]);
//   const [grid, setGrid] = useState<number[][]>([]);
//   const [sel, setSel] = useState<{ r: number, c: number } | null>(null);
//   const [timeLeft, setTimeLeft] = useState(time);
//   const [running, setRunning] = useState(false);
//   const [solved, setSolved] = useState<number[][]>([]);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   useEffect(() => {
//     const { puzzle, solved } = generateSudoku(N, boxR, boxC, holes);
//     setInitial(puzzle);
//     setGrid(clone(puzzle));
//     setSolved(solved);
//   }, [N, boxR, boxC, holes]);

//   useEffect(() => {
//     if (running && timeLeft > 0) {
//       if (timerRef.current) clearInterval(timerRef.current);
//       timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
//     }
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [running, timeLeft]);

//   useEffect(() => { if (timeLeft <= 0) finish("timeUp"); }, [timeLeft]);

//   function finish(endedBy: "completed" | "timeUp") {
//     setRunning(false);
//     if (timerRef.current) clearInterval(timerRef.current);
//     const timeTaken = time - Math.max(0, timeLeft);
//     let score = 0;
//     for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c] && grid[r][c] === solved[r][c]) score++;
//     nav.navigate("MathResults", { score, totalQuestions: N * N, timeTaken, endedBy, gameType: "sudoku" });
//   }

//   const setValue = (v: number) => {
//     if (!running || !sel) return;
//     const { r, c } = sel;
//     if (initial[r][c] !== 0) return;
//     const g = clone(grid); g[r][c] = v; setGrid(g);
//     const allFilled = g.every(row => row.every(x => x !== 0));
//     if (allFilled) {
//       const ok = g.every((row, r) => row.every((x, c) => x === solved[r][c]));
//       if (ok) { Alert.alert("Well done!", "Sudoku solved 🎉"); finish("completed"); }
//       else Alert.alert("Almost!", "Some numbers are incorrect. You can continue.");
//     }
//   };
//   const erase = () => { if (!sel) return; if (initial[sel.r][sel.c] !== 0) return; const g = clone(grid); g[sel.r][sel.c] = 0; setGrid(g); };

//   const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
//   const nums = Array.from({ length: N }, (_, i) => i + 1);

//   return (
//     <View style={{ flex: 1, backgroundColor: "white" }}>
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: PALETTE.lightPink }]}>
//         <TouchableOpacity onPress={() => { setRunning(false); nav.goBack(); }} style={[styles.iconBtn, { backgroundColor: PALETTE.lightTeal }]}>
//           <Text style={styles.iconText}>←</Text>
//         </TouchableOpacity>
//         <View style={{ alignItems: "center" }}>
//           <Text style={{ fontSize: 14, color: "#6B7280" }}>Sudoku {N}×{N}</Text>
//           <Text style={{ fontSize: 20, fontWeight: "700" }}>{formatTime(timeLeft)}</Text>
//         </View>
//         <View style={{ width: 44, alignItems: "center" }}>
//           {running ? (
//             <TouchableOpacity onPress={() => setRunning(false)}><Text style={styles.iconText}>⏸️</Text></TouchableOpacity>
//           ) : (
//             <TouchableOpacity onPress={() => setRunning(true)}><Text style={styles.iconText}>▶️</Text></TouchableOpacity>
//           )}
//         </View>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         <View style={{ alignItems: "center", marginBottom: 12 }}>
//           <Text style={{ fontSize: 22, fontWeight: "600", color: PALETTE.teal }}>Tap a cell, then choose a number</Text>
//         </View>

//         {/* Grid */}
//         <View style={{ alignSelf: "center" }}>
//           {grid.map((row, r) => (
//             <View key={r} style={{ flexDirection: "row" }}>
//               {row.map((val, c) => {
//                 const fixed = initial[r][c] !== 0;
//                 const selected = sel?.r === r && sel?.c === c;
//                 return (
//                   <TouchableOpacity
//                     key={c}
//                     onPress={() => setSel({ r, c })}
//                     style={[
//                       styles.cell,
//                       { backgroundColor: selected ? PALETTE.teal : "#FFF", opacity: fixed ? 0.9 : 1 }
//                     ]}
//                   >
//                     <Text style={{ fontSize: 20, fontWeight: "700", color: selected ? "white" : (fixed ? PALETTE.orange : PALETTE.neutralDark) }}>
//                       {val === 0 ? "" : val}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           ))}
//         </View>

//         {/* Number pad */}
//         <View style={{ marginTop: 16, alignItems: "center" }}>
//           <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
//             {nums.map(n => (
//               <TouchableOpacity key={n} onPress={() => setValue(n)} style={styles.numBtn}>
//                 <Text style={{ fontSize: 22, fontWeight: "700", color: PALETTE.teal }}>{n}</Text>
//               </TouchableOpacity>
//             ))}
//             <TouchableOpacity onPress={erase} style={[styles.numBtn, { backgroundColor: PALETTE.lightPink, borderColor: PALETTE.red }]}>
//               <Text style={{ fontSize: 18, fontWeight: "700", color: PALETTE.red }}>Erase</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => finish("completed")} style={[styles.numBtn, { backgroundColor: PALETTE.teal }]}>
//               <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Check</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12 },
//   iconBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
//   iconText: { fontSize: 24 },
//   cell: { width: 40, height: 40, margin: 2, borderWidth: 2, borderRadius: 8, alignItems: "center", justifyContent: "center", borderColor: PALETTE.teal },
//   numBtn: { width: 56, height: 56, borderRadius: 14, backgroundColor: PALETTE.lightTeal, margin: 6, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: PALETTE.teal }
// });
// screens/Games/Puzzle/SudokuPlay.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "MathResults">;
type Diff = "easy" | "medium" | "hard";

function config(diff: Diff) {
  if (diff === "easy")  return { N: 4, boxR: 2, boxC: 2, holes: 6,  time: 180 };
  if (diff === "medium")return { N: 6, boxR: 2, boxC: 3, holes: 14, time: 240 };
  return { N: 9, boxR: 3, boxC: 3, holes: 40, time: 420 };
}

const rng = (n: number) => Math.floor(Math.random() * n);
const clone = <T,>(m: T[][]) => m.map(r => [...r]);
const empty = (N: number) => Array.from({ length: N }, () => Array(N).fill(0));

function isSafe(board: number[][], r: number, c: number, v: number, boxR: number, boxC: number) {
  const N = board.length;
  for (let i = 0; i < N; i++) if (board[r][i] === v || board[i][c] === v) return false;
  const sr = Math.floor(r / boxR) * boxR, sc = Math.floor(c / boxC) * boxC;
  for (let i = 0; i < boxR; i++) for (let j = 0; j < boxC; j++) if (board[sr+i][sc+j] === v) return false;
  return true;
}
function fillBoard(board: number[][], boxR: number, boxC: number): boolean {
  const N = board.length;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (board[r][c] === 0) {
    const nums = Array.from({ length: N }, (_, k) => k + 1).sort(() => Math.random() - 0.5);
    for (const v of nums) {
      if (isSafe(board, r, c, v, boxR, boxC)) {
        board[r][c] = v;
        if (fillBoard(board, boxR, boxC)) return true;
        board[r][c] = 0;
      }
    }
    return false;
  }
  return true;
}
function generateSudoku(N: number, boxR: number, boxC: number, holes: number) {
  const full = empty(N);
  fillBoard(full, boxR, boxC);
  const solved = clone(full);
  const puzzle = clone(full);
  let removed = 0;
  while (removed < holes) {
    const r = rng(N), c = rng(N);
    if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; removed++; }
  }
  return { puzzle, solved };
}

export default function SudokuPlay() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const diff: Diff = (route.params?.difficulty || "easy");
  const { N, boxR, boxC, holes, time } = config(diff);

  const [initial, setInitial] = useState<number[][]>([]);
  const [grid, setGrid] = useState<number[][]>([]);
  const [solved, setSolved] = useState<number[][]>([]);
  const [sel, setSel] = useState<{ r: number, c: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(time);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // generate once per difficulty
  useEffect(() => {
    const { puzzle, solved } = generateSudoku(N, boxR, boxC, holes);
    setInitial(puzzle);
    setGrid(clone(puzzle));
    setSolved(solved);
    setTimeLeft(time);
    setRunning(false);
  }, [N, boxR, boxC, holes, time]);

  // timer
  useEffect(() => {
    if (running && timeLeft > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, timeLeft]);

  useEffect(() => { if (timeLeft <= 0) finish("timeUp"); }, [timeLeft]);

  function finish(endedBy: "completed" | "timeUp") {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = time - Math.max(0, timeLeft);
    const score = grid.flat().reduce((s, v, i) => s + (v === solved.flat()[i] ? 1 : 0), 0);
    nav.navigate("MathResults", { score, totalQuestions: N * N, timeTaken, endedBy, gameType: "sudoku" });
  }

  const setValue = (v: number) => {
    if (!running || !sel) return;
    const { r, c } = sel;
    if (initial[r][c] !== 0) return; // fixed
    const g = clone(grid);
    g[r][c] = v;
    setGrid(g);
    if (isSolved(g, solved)) {
      Alert.alert("Well done!", "Sudoku solved 🎉");
      finish("completed");
    }
  };

  const erase = () => {
    if (!sel) return;
    if (initial[sel.r][sel.c] !== 0) return;
    const g = clone(grid); g[sel.r][sel.c] = 0; setGrid(g);
  };

  const hint = () => {
    if (!running) return;
    // fill one empty cell with the correct answer
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (grid[r][c] === 0) {
        const g = clone(grid);
        g[r][c] = solved[r][c];
        setGrid(g);
        setSel({ r, c });
        if (isSolved(g, solved)) finish("completed");
        return;
      }
    }
  };

  const nums = Array.from({ length: N }, (_, i) => i + 1);
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // helpers
  function isSolved(g: number[][], s: number[][]) {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c] !== s[r][c]) return false;
    return true;
  }
  function inConflict(r: number, c: number, v: number) {
    if (v === 0) return false;
    // any duplicate in row / col / box (ignoring same cell)
    for (let i = 0; i < N; i++) if (i !== c && grid[r][i] === v) return true;
    for (let i = 0; i < N; i++) if (i !== r && grid[i][c] === v) return true;
    const sr = Math.floor(r / boxR) * boxR, sc = Math.floor(c / boxC) * boxC;
    for (let i = 0; i < boxR; i++) for (let j = 0; j < boxC; j++) {
      const rr = sr+i, cc = sc+j;
      if ((rr !== r || cc !== c) && grid[rr][cc] === v) return true;
    }
    return false;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PALETTE.lightPink }]}>
        <TouchableOpacity onPress={() => { setRunning(false); nav.goBack(); }} style={[styles.iconBtn, { backgroundColor: PALETTE.lightTeal }]}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>Sudoku {N}×{N}</Text>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>{formatTime(timeLeft)}</Text>
        </View>
        <View style={{ width: 44, alignItems: "center" }}>
          {running ? (
            <TouchableOpacity onPress={() => setRunning(false)}><Text style={styles.iconText}>⏸️</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setRunning(true)}><Text style={styles.iconText}>▶️</Text></TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: "600", color: PALETTE.teal }}>
            Tap a cell, then choose a number
          </Text>
        </View>

        {/* Grid */}
        <View style={{ alignSelf: "center" }}>
          {grid.map((row, r) => (
            <View key={r} style={{ flexDirection: "row" }}>
              {row.map((val, c) => {
                const fixed = initial[r][c] !== 0;
                const selected = sel?.r === r && sel?.c === c;
                const conflict = inConflict(r, c, val);
                const borderL = c % boxC === 0 ? 3 : 2;
                const borderT = r % boxR === 0 ? 3 : 2;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSel({ r, c })}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: selected ? PALETTE.teal : "#FFF",
                        borderLeftWidth: borderL,
                        borderTopWidth: borderT,
                        borderColor: conflict ? PALETTE.red : PALETTE.teal,
                        opacity: fixed ? 0.9 : 1
                      }
                    ]}
                  >
                    <Text style={{ fontSize: 20, fontWeight: "700", color: selected ? "white" : (fixed ? PALETTE.orange : PALETTE.neutralDark) }}>
                      {val === 0 ? "" : val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Number pad */}
        <View style={{ marginTop: 16, alignItems: "center" }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            {nums.map(n => (
              <TouchableOpacity key={n} onPress={() => setValue(n)} style={styles.numBtn}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: PALETTE.teal }}>{n}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={erase} style={[styles.numBtn, { backgroundColor: PALETTE.lightPink, borderColor: PALETTE.red }]}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: PALETTE.red }}>Erase</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              if (isSolved(grid, solved)) finish("completed");
              else Alert.alert("Keep going", "There are still mistakes or empty cells.");
            }} style={[styles.numBtn, { backgroundColor: PALETTE.teal }]}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Check</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={hint} style={[styles.numBtn, { backgroundColor: "#FFEDCC", borderColor: PALETTE.orange }]}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: PALETTE.orange }}>Hint</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Start/Pause */}
        <View style={{ alignItems: "center", marginTop: 14 }}>
          {!running ? (
            <TouchableOpacity style={styles.ctaStart} onPress={() => setRunning(true)}>
              <Text style={styles.ctaText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.ctaPause} onPress={() => setRunning(false)}>
              <Text style={styles.ctaText}>Pause</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12 },
  iconBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 24 },
  cell: { width: 40, height: 40, margin: 2, borderWidth: 2, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  numBtn: { width: 56, height: 56, borderRadius: 14, backgroundColor: PALETTE.lightTeal, margin: 6, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: PALETTE.teal },
  ctaStart: { backgroundColor: PALETTE.teal, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  ctaPause: { backgroundColor: PALETTE.lightPink, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  ctaText: { color: "white", fontSize: 18, fontWeight: "700" },
});
