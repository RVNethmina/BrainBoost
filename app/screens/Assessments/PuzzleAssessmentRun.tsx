import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { makeOdd, makeSeq } from "@/app/screens/Games/Puzzle/puzzleGenerators";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import JigsawPlay from "../Games/Puzzle/JigsawPlay";
import TargetNumberPlay from "../Games/Puzzle/TargetNumberPlay";

type Nav = NativeStackNavigationProp<RootStackParamList, "PuzzleAssessmentResult">;

export default function PuzzleAssessmentRun() {
  const nav = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [startTime] = useState(Date.now());

  const totalTasks = 4;
  const next = (res: any) => {
    setResults((r) => [...r, res]);
    setStep((s) => s + 1);
  };

  const finish = () => {
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const overallAccuracy =
      results.reduce((s, r) => s + (r.accuracy || 0), 0) / results.length;
    const averageReactionTime = Math.round(
      results.reduce((s, r) => s + (r.avgRT || 0), 0) / results.length
    );

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
      <Text style={{ fontSize: 16, color: "#6B7280" }}>
        Task {step + 1} / {totalTasks}
      </Text>
    </View>
  );

  // Odd-One-Out
  if (step === 0) {
    const q = makeOdd("medium")();
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <Progress />
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 20 }}>
          {q.prompt}
        </Text>
        {q.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() =>
              next({ task: "odd", accuracy: i === q.correctIndex ? 100 : 0, avgRT: 1000 })
            }
            style={{
              padding: 16,
              backgroundColor: PALETTE.lightTeal,
              marginBottom: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "600", color: PALETTE.teal }}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Sequence
  if (step === 1) {
    const q = makeSeq("medium")();
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <Progress />
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 20 }}>
          {q.prompt}
        </Text>
        {q.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() =>
              next({ task: "seq", accuracy: i === q.correctIndex ? 100 : 0, avgRT: 1200 })
            }
            style={{
              padding: 16,
              backgroundColor: PALETTE.lightPink,
              marginBottom: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "600", color: PALETTE.red }}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Jigsaw (replacing Sudoku)
  if (step === 2) {
    return (
      <JigsawPlay
        assessmentMode
        onComplete={(res: any) => next({ task: "jigsaw", ...res })}
      />
    );
  }

  // Target Number
  if (step === 3) {
    return (
      <TargetNumberPlay
        assessmentMode
        onComplete={(res: any) => {
          next({ task: "target", ...res });
          finish();
        }}
      />
    );
  }

  return <Text>Loading...</Text>;
}
