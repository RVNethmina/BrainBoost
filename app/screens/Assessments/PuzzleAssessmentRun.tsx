
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { makeOdd, makeSeq } from "@/app/screens/Games/Puzzle/puzzleGenerators";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useState } from "react";
// import { Text, TouchableOpacity, View } from "react-native";
// import JigsawPlay from "../Games/Puzzle/JigsawPlay";
// import SudokuPlay from "../Games/Puzzle/SudokuPlay";
// import TargetNumberPlay from "../Games/Puzzle/TargetNumberPlay";

// type Nav = NativeStackNavigationProp<RootStackParamList, "PuzzleAssessmentResult">;

// export default function PuzzleAssessmentRun() {
//   const nav = useNavigation<Nav>();
//   const [step, setStep] = useState(0);
//   const [results, setResults] = useState<any[]>([]);
//   const [startTime] = useState(Date.now());

//   // ✅ total of 5 tasks now (Odd, Seq, Jigsaw, Sudoku, Target)
//   const totalTasks = 5;

//   const next = (res: any) => {
//     setResults((r) => [...r, res]);
//     setStep((s) => s + 1);
//   };

//   const finish = () => {
//     const totalTime = Math.floor((Date.now() - startTime) / 1000);
//     const overallAccuracy =
//       results.reduce((s, r) => s + (r.accuracy || 0), 0) / results.length;
//     const averageReactionTime = Math.round(
//       results.reduce((s, r) => s + (r.avgRT || 0), 0) / results.length
//     );

//     nav.navigate("PuzzleAssessmentResult", {
//       totalTime,
//       results,
//       overallAccuracy,
//       averageReactionTime,
//       tasksCompleted: results.length,
//     });
//   };

//   const Progress = () => (
//     <View style={{ alignItems: "center", marginBottom: 20 }}>
//       <Text style={{ fontSize: 16, color: "#6B7280" }}>
//         Task {step + 1} / {totalTasks}
//       </Text>
//     </View>
//   );

//   // 1️⃣ Odd-One-Out
//   if (step === 0) {
//     const q = makeOdd("medium")();
//     return (
//       <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
//         <Progress />
//         <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 20 }}>
//           {q.prompt}
//         </Text>
//         {q.options.map((opt, i) => (
//           <TouchableOpacity
//             key={i}
//             onPress={() =>
//               next({
//                 task: "odd",
//                 accuracy: i === q.correctIndex ? 100 : 0,
//                 avgRT: 1000,
//               })
//             }
//             style={{
//               padding: 16,
//               backgroundColor: PALETTE.lightTeal,
//               marginBottom: 12,
//               borderRadius: 12,
//             }}
//           >
//             <Text
//               style={{ fontSize: 20, fontWeight: "600", color: PALETTE.teal }}
//             >
//               {opt}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     );
//   }

//   // 2️⃣ Number Sequence
//   if (step === 1) {
//     const q = makeSeq("medium")();
//     return (
//       <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
//         <Progress />
//         <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 20 }}>
//           {q.prompt}
//         </Text>
//         {q.options.map((opt, i) => (
//           <TouchableOpacity
//             key={i}
//             onPress={() =>
//               next({
//                 task: "seq",
//                 accuracy: i === q.correctIndex ? 100 : 0,
//                 avgRT: 1200,
//               })
//             }
//             style={{
//               padding: 16,
//               backgroundColor: PALETTE.lightPink,
//               marginBottom: 12,
//               borderRadius: 12,
//             }}
//           >
//             <Text
//               style={{ fontSize: 20, fontWeight: "600", color: PALETTE.red }}
//             >
//               {opt}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     );
//   }

//   // 3️⃣ Jigsaw Puzzle
//   if (step === 2) {
//     return (
//       <JigsawPlay
//         assessmentMode
//         onComplete={(res: any) => next({ task: "jigsaw", ...res })}
//       />
//     );
//   }

//   // 4️⃣ Sudoku Mini
//   if (step === 3) {
//     return (
//       <SudokuPlay
//         assessmentMode
//         onComplete={(res: any) => next({ task: "sudoku", ...res })}
//       />
//     );
//   }

//   // 5️⃣ Target Number
//   if (step === 4) {
//     return (
//       <TargetNumberPlay
//         assessmentMode
//         onComplete={(res: any) => {
//           next({ task: "target", ...res });
//           finish();
//         }}
//       />
//     );
//   }

//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "white",
//       }}
//     >
//       <Text style={{ fontSize: 18, color: "#6B7280" }}>Loading...</Text>
//     </View>
//   );
// }
// app/src/screens/Games/Puzzle/PuzzleAssessmentRun.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { makeOdd, makeSeq } from "@/app/screens/Games/Puzzle/puzzleGenerators";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext"; // Import the settings context
import JigsawPlay from "../Games/Puzzle/JigsawPlay";
import SudokuPlay from "../Games/Puzzle/SudokuPlay";
import TargetNumberPlay from "../Games/Puzzle/TargetNumberPlay";

type Nav = NativeStackNavigationProp<RootStackParamList, "PuzzleAssessmentResult">;

export default function PuzzleAssessmentRun() {
  const nav = useNavigation<Nav>();
  
  // Use settings context
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const [step, setStep] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const startTimeRef = useRef(Date.now());

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : 'white';
  const textColor = isDark ? '#fff' : PALETTE.teal;
  const mutedTextColor = isDark ? '#aaa' : '#6B7280';
  const cardBg1 = isDark ? '#2a4a4a' : PALETTE.lightTeal;
  const cardBg2 = isDark ? '#4a2a2a' : PALETTE.lightPink;
  const cardText1 = isDark ? '#fff' : PALETTE.teal;
  const cardText2 = isDark ? '#fff' : PALETTE.red;

  // Define all tasks here
  // Note: Only TargetNumberPlay and JigsawPlay need assessmentMode prop defined
  const assessmentTasks = [
    { type: "odd", component: "quiz", generator: makeOdd("medium") },
    { type: "seq", component: "quiz", generator: makeSeq("medium") },
    { type: "jigsaw", component: "JigsawPlay", difficulty: "medium" },
    { type: "sudoku", component: "SudokuPlay", difficulty: "easy" }, // Mini Sudoku
    { type: "target", component: "TargetNumberPlay", difficulty: "medium" },
  ];
  const totalTasks = assessmentTasks.length;

  // Use this function to record results and move to the next step
  const next = (res: { task: string; accuracy: number; avgRT: number; [key: string]: any }) => {
    // Ensure task is recorded and move to next step
    setResults((r) => [...r, res]);
    setStep((s) => s + 1);
  };

  const finish = () => {
    const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const totalRawResults = results.length;
    
    // Aggregate metrics from all tasks
    const totalAccuracySum = results.reduce((s, r) => s + (r.accuracy || 0), 0);
    // Filter out 0 RT if a task doesn't track it, to avoid skewing the average low
    const trackedRTs = results.filter(r => r.avgRT > 0);
    const totalRT = trackedRTs.reduce((s, r) => s + (r.avgRT || 0), 0);

    const overallAccuracy = totalRawResults > 0 ? totalAccuracySum / totalRawResults : 0;
    // Calculate RT based only on tasks that tracked RT (e.g., TargetNumberPlay, Odd/Seq response)
    const averageReactionTime = trackedRTs.length > 0 ? Math.round(totalRT / trackedRTs.length) : 0;

    nav.navigate("PuzzleAssessmentResult", {
      totalTime,
      results,
      overallAccuracy,
      averageReactionTime,
      tasksCompleted: results.length,
    });
  };

  const Progress = () => (
    <View style={{ alignItems: "center", marginBottom: 20 }}>
      <Text style={{ 
        fontSize: 16 * fontScale, 
        color: mutedTextColor 
      }}>
        Task {Math.min(step + 1, totalTasks)} / {totalTasks}
      </Text>
    </View>
  );
  
  // Quiz-Style Task Renderer (Odd, Seq)
  const renderQuizTask = (index: number) => {
    const task = assessmentTasks[index];
    if (task.component !== "quiz") return null;

    const q = (task.generator as () => { prompt: string; options: string[]; correctIndex: number })();
    const roundStartTime = Date.now();
    
    return (
      <View style={{ 
        flex: 1, 
        padding: 20, 
        justifyContent: "center",
        backgroundColor: bgColor 
      }}>
        <Progress />
        <Text style={{ 
          fontSize: 20 * fontScale, 
          fontWeight: "700", 
          marginBottom: 20,
          color: textColor 
        }}>
          {q.prompt}
        </Text>
        {q.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              const reactionTime = Date.now() - roundStartTime;
              next({
                task: task.type,
                accuracy: i === q.correctIndex ? 100 : 0,
                avgRT: reactionTime,
                attemptTime: reactionTime,
                correctIndex: q.correctIndex,
                selected: i
              });
            }}
            style={{
              padding: 16,
              backgroundColor: i % 2 === 0 ? cardBg1 : cardBg2,
              marginBottom: 12,
              borderRadius: 12,
            }}
          >
            <Text
              style={{ 
                fontSize: 20 * fontScale, 
                fontWeight: "600", 
                color: i % 2 === 0 ? cardText1 : cardText2 
              }}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 1️⃣ Odd-One-Out (Step 0)
  if (step === 0) {
    return renderQuizTask(0);
  }

  // 2️⃣ Number Sequence (Step 1)
  if (step === 1) {
    return renderQuizTask(1);
  }

  // 3️⃣ Jigsaw Puzzle (Step 2)
  if (step === 2) {
    return (
      <JigsawPlay
        assessmentMode
        // JigsawPlay returns { accuracy, moves, mistakes, timeTaken, avgRT }
        onComplete={(res: any) => next({ task: "jigsaw", ...res })}
      />
    );
  }

  // 4️⃣ Sudoku Mini (Step 3)
  if (step === 3) {
    return (
      <SudokuPlay
        assessmentMode
        // SudokuPlay returns { accuracy, timeTaken, avgRT }
        onComplete={(res: any) => next({ task: "sudoku", ...res })}
      />
    );
  }

  // 5️⃣ Target Number (Step 4) - Final Task
  if (step === 4) {
    return (
      <TargetNumberPlay
        assessmentMode
        // TargetNumberPlay returns { avgRT, accuracy, timeTaken }
        onComplete={(res: any) => {
          // Record final task result and immediately run finish aggregation
          setResults((r) => [...r, { task: "target", ...res }]);
          finish();
        }}
      />
    );
  }
  
  // Completed / Loading
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: bgColor,
      }}
    >
      <Text style={{ 
        fontSize: 18 * fontScale, 
        color: mutedTextColor 
      }}>
        {step >= totalTasks ? "Assessment Complete" : "Loading Next Task..."}
      </Text>
    </View>
  );
}