
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { getPuzzleRecommendations, savePuzzleAssessment } from "@/app/services/puzzleAssessmentService";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useEffect } from "react";
// import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// type Nav = NativeStackNavigationProp<RootStackParamList, "BrainGames">;

// export default function PuzzleAssessmentResult() {
//   const nav = useNavigation<Nav>();
//   const route = useRoute<any>();
//   const { totalTime, results, overallAccuracy, averageReactionTime, tasksCompleted } = route.params;

//   const score = Math.round(overallAccuracy - averageReactionTime / 1000 + tasksCompleted * 10);
//   const perf =
//     score > 80 ? "Superior" :
//     score > 65 ? "Above Average" :
//     score > 50 ? "Average" :
//     score > 35 ? "Below Average" : "Needs Practice";

//   useEffect(() => {
//     savePuzzleAssessment({
//       totalTime,
//       tasksCompleted,
//       overallAccuracy,
//       averageReactionTime,
//       puzzleScore: score,
//       performanceLevel: perf,
//       rawResults: results,
//     });
//   }, []);

//   const recs = getPuzzleRecommendations({ overallAccuracy, averageReactionTime, puzzleScore: score });

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: "white" }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
//       {/* Header */}
//       <View style={{ alignItems: "center", marginTop: 20 }}>
//         <Text style={{ fontSize: 64 }}>🧩</Text>
//         <Text style={{ fontSize: 28, fontWeight: "800", color: PALETTE.teal, marginTop: 10 }}>
//           Puzzle Results
//         </Text>
//         <View style={{ marginTop: 20, backgroundColor: PALETTE.teal, padding: 24, borderRadius: 120, elevation: 4 }}>
//           <Text style={{ fontSize: 36, fontWeight: "900", color: "white" }}>{score}</Text>
//           <Text style={{ fontSize: 14, color: "white", marginTop: 4 }}>Score / 100</Text>
//         </View>
//         <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 12, color: "#374151" }}>{perf}</Text>
//       </View>

//       {/* Summary Cards */}
//       <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
//         <View style={{ backgroundColor: PALETTE.lightTeal, borderRadius: 16, padding: 16, flexBasis: "48%", marginBottom: 14 }}>
//           <Text style={{ fontSize: 14, color: "#6B7280" }}>🕒 Time Taken</Text>
//           <Text style={{ fontSize: 20, fontWeight: "700", color: PALETTE.teal }}>{totalTime}s</Text>
//         </View>
//         <View style={{ backgroundColor: PALETTE.lightPink, borderRadius: 16, padding: 16, flexBasis: "48%", marginBottom: 14 }}>
//           <Text style={{ fontSize: 14, color: "#6B7280" }}>🎯 Accuracy</Text>
//           <Text style={{ fontSize: 20, fontWeight: "700", color: PALETTE.red }}>{overallAccuracy.toFixed(1)}%</Text>
//         </View>
//         <View style={{ backgroundColor: "#E0E7FF", borderRadius: 16, padding: 16, flexBasis: "48%", marginBottom: 14 }}>
//           <Text style={{ fontSize: 14, color: "#6B7280" }}>⚡ Avg Reaction</Text>
//           <Text style={{ fontSize: 20, fontWeight: "700", color: "#4338CA" }}>{averageReactionTime} ms</Text>
//         </View>
//         <View style={{ backgroundColor: "#FDE68A", borderRadius: 16, padding: 16, flexBasis: "48%", marginBottom: 14 }}>
//           <Text style={{ fontSize: 14, color: "#6B7280" }}>📝 Tasks Completed</Text>
//           <Text style={{ fontSize: 20, fontWeight: "700", color: "#92400E" }}>{tasksCompleted}</Text>
//         </View>
//       </View>

//       {/* Recommendations */}
//       <View style={{ marginTop: 32 }}>
//         <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12, color: "#111827" }}>💡 Recommendations</Text>
//         {recs.map((r: string, i: number) => (
//           <View
//             key={i}
//             style={{
//               backgroundColor: "#F9FAFB",
//               borderRadius: 12,
//               padding: 14,
//               marginBottom: 10,
//               borderWidth: 1,
//               borderColor: "#E5E7EB",
//             }}
//           >
//             <Text style={{ fontSize: 16, color: "#374151" }}>• {r}</Text>
//           </View>
//         ))}
//       </View>

//       {/* CTA */}
//       <TouchableOpacity
//         onPress={() => nav.navigate("BrainGames")}
//         style={{
//           marginTop: 40,
//           padding: 18,
//           borderRadius: 16,
//           backgroundColor: PALETTE.teal,
//           alignItems: "center",
//           shadowColor: "#000",
//           shadowOpacity: 0.2,
//           shadowOffset: { width: 0, height: 2 },
//           shadowRadius: 4,
//           elevation: 3,
//         }}
//       >
//         <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Back to Games</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }
// app/src/screens/Assessments/PuzzleAssessmentResult.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { getPuzzleRecommendations, savePuzzleAssessment } from "@/app/services/puzzleAssessmentService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type NavProp = NativeStackNavigationProp<RootStackParamList, "BrainGames">;

export default function PuzzleAssessmentResult() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { totalTime, results, overallAccuracy, averageReactionTime, tasksCompleted } =
    route.params || {};

  const [isSpeaking, setIsSpeaking] = useState(false);

  // compute puzzle score + performance
  const score = Math.round(overallAccuracy - averageReactionTime / 1000 + tasksCompleted * 10);
  const performance =
    score >= 85
      ? "Exceptional"
      : score >= 70
      ? "Superior"
      : score >= 55
      ? "Average"
      : score >= 40
      ? "Below Average"
      : "Needs Practice";

  // save on mount
  useEffect(() => {
    if (results) {
      savePuzzleAssessment({
        totalTime,
        tasksCompleted,
        overallAccuracy,
        averageReactionTime,
        puzzleScore: score,
        performanceLevel: performance,
        rawResults: results,
      });
    }
  }, []);

  // get dynamic feedback
  const recommendations = getPuzzleRecommendations({
    overallAccuracy,
    averageReactionTime,
    puzzleScore: score,
  });

  // voice feedback
  const speakSummary = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    const advice =
      score >= 70
        ? "Fantastic work! Keep challenging yourself with harder puzzles."
        : "You're improving! Practice daily to sharpen your problem-solving speed.";
    const text = `You scored ${score} out of 100. Performance: ${performance}. ${advice}`;
    setIsSpeaking(true);
    Speech.speak(text, {
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const getTheme = () => {
    if (score >= 85) return PALETTE.teal;
    if (score >= 70) return PALETTE.orange;
    if (score >= 50) return PALETTE.blue;
    return PALETTE.red;
  };

  if (!results) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>No results to show.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FDFCFB" }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* HEADER */}
        <View style={[styles.hero, { borderColor: getTheme() }]}>
          <Text style={[styles.title, { color: getTheme() }]}>Assessment Complete</Text>
          <Text style={[styles.score, { color: getTheme() }]}>{score}</Text>
          <Text style={styles.sub}>Performance: {performance}</Text>

          <TouchableOpacity
            style={[styles.listenBtn, { borderColor: getTheme() }]}
            onPress={speakSummary}
          >
            <Text style={[styles.listenText, { color: getTheme() }]}>
              {isSpeaking ? "⏸ Stop" : "🔊 Listen Summary"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.stats}>
          <Text style={styles.statTitle}>🕒 Time Taken</Text>
          <Text style={styles.statValue}>{formatTime(totalTime)}</Text>

          <Text style={[styles.statTitle, { marginTop: 12 }]}>🎯 Accuracy</Text>
          <Text style={styles.statValue}>{overallAccuracy.toFixed(1)}%</Text>

          <Text style={[styles.statTitle, { marginTop: 12 }]}>⚡ Avg Reaction Time</Text>
          <Text style={styles.statValue}>{averageReactionTime} ms</Text>

          <Text style={[styles.statTitle, { marginTop: 12 }]}>🧩 Tasks Completed</Text>
          <Text style={styles.statValue}>{tasksCompleted}</Text>
        </View>

        {/* RECOMMENDATIONS */}
        <View style={styles.recs}>
          <Text style={styles.recsTitle}>💡 Personalized Recommendations</Text>
          {recommendations.map((r, i) => (
            <Text key={i} style={styles.recItem}>
              • {r}
            </Text>
          ))}
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: getTheme() }]}
            onPress={() => navigation.navigate("PuzzleAssessmentRun")}
          >
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.btnTextSecondary}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// helper
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, alignItems: "center" },

  hero: {
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  score: { fontSize: 56, fontWeight: "900" },
  sub: { color: "#6B7280", fontSize: 16, marginBottom: 6 },
  listenBtn: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  listenText: { fontWeight: "700", fontSize: 16 },

  stats: {
    width: "100%",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  statTitle: { fontWeight: "700", color: "#374151" },
  statValue: { fontSize: 20, fontWeight: "800", marginTop: 4, color: "#111827" },

  recs: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  recsTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111827",
  },
  recItem: {
    fontSize: 15,
    marginBottom: 4,
    color: "#374151",
  },

  actions: { width: "100%", marginTop: 10, alignItems: "center" },
  btnPrimary: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: { color: "white", fontWeight: "800", fontSize: 16 },
  btnSecondary: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  btnTextSecondary: { color: "#374151", fontWeight: "800", fontSize: 16 },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
