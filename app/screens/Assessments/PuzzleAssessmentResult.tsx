// // screens/Assessment/PuzzleAssessmentResult.tsx
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { getPersonalizedPuzzleRecommendations, savePuzzleAssessment } from "@/app/services/puzzleAssessmentService";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useEffect } from "react";
// import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// type Nav = NativeStackNavigationProp<RootStackParamList, "BrainGames">;

// export default function PuzzleAssessmentResult() {
//   const nav = useNavigation<Nav>();
//   const route = useRoute<any>();
//   const { totalTime, results, overallAccuracy, averageReactionTime, tasksCompleted } = route.params;

//   const score = Math.round(overallAccuracy - averageReactionTime / 1000 + tasksCompleted * 5);
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

//   const recs = getPersonalizedPuzzleRecommendations({ overallAccuracy, averageReactionTime, puzzleScore: score });

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 20 }}>
//       <View style={{ alignItems: "center", marginTop: 20 }}>
//         <Text style={{ fontSize: 52 }}>🧩</Text>
//         <Text style={{ fontSize: 28, fontWeight: "700", color: PALETTE.teal, marginTop: 8 }}>
//           Puzzle Results
//         </Text>
//         <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 12 }}>{score}/100 · {perf}</Text>
//       </View>

//       <View style={{ marginTop: 20 }}>
//         <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 6 }}>Summary</Text>
//         <Text>Time Taken: {totalTime}s</Text>
//         <Text>Accuracy: {overallAccuracy.toFixed(1)}%</Text>
//         <Text>Avg Reaction Time: {averageReactionTime} ms</Text>
//         <Text>Tasks Completed: {tasksCompleted}</Text>
//       </View>

//       <View style={{ marginTop: 20 }}>
//         <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 6 }}>Recommendations</Text>
//         {recs.map((r, i) => (
//           <Text key={i} style={{ marginBottom: 4 }}>• {r}</Text>
//         ))}
//       </View>

//       <TouchableOpacity
//         onPress={() => nav.navigate("BrainGames")}
//         style={{ marginTop: 30, padding: 16, borderRadius: 12, backgroundColor: PALETTE.teal, alignItems: "center" }}
//       >
//         <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Back to Games</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { getPuzzleRecommendations, savePuzzleAssessment } from "@/app/services/puzzleAssessmentService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "BrainGames">;

export default function PuzzleAssessmentResult() {
  const nav = useNavigation<Nav>();
  const route = useRoute<any>();
  const { totalTime, results, overallAccuracy, averageReactionTime, tasksCompleted } = route.params;

  const score = Math.round(overallAccuracy - averageReactionTime / 1000 + tasksCompleted * 10);
  const perf =
    score > 80 ? "Superior" :
    score > 65 ? "Above Average" :
    score > 50 ? "Average" :
    score > 35 ? "Below Average" : "Needs Practice";

  useEffect(() => {
    savePuzzleAssessment({
      totalTime,
      tasksCompleted,
      overallAccuracy,
      averageReactionTime,
      puzzleScore: score,
      performanceLevel: perf,
      rawResults: results,
    });
  }, []);

  const recs = getPuzzleRecommendations({ overallAccuracy, averageReactionTime, puzzleScore: score });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Header */}
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Text style={{ fontSize: 64 }}>🧩</Text>
        <Text style={{ fontSize: 28, fontWeight: "800", color: PALETTE.teal, marginTop: 10 }}>
          Puzzle Results
        </Text>
        <View style={{ marginTop: 20, backgroundColor: PALETTE.teal, padding: 24, borderRadius: 120, elevation: 4 }}>
          <Text style={{ fontSize: 36, fontWeight: "900", color: "white" }}>{score}</Text>
          <Text style={{ fontSize: 14, color: "white", marginTop: 4 }}>Score / 100</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 12, color: "#374151" }}>{perf}</Text>
      </View>

      {/* Summary Cards */}
      <View style={{ marginTop: 32, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        <View style={{ backgroundColor: PALETTE.lightTeal, borderRadius: 16, padding: 16, flexBasis: "48%", marginBottom: 14 }}>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>🕒 Time Taken</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: PALETTE.teal }}>{totalTime}s</Text>
        </View>
        <View style={{ backgroundColor: PALETTE.lightPink, borderRadius: 16, padding: 16, flexBasis: "48%", marginBottom: 14 }}>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>🎯 Accuracy</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: PALETTE.red }}>{overallAccuracy.toFixed(1)}%</Text>
        </View>
        <View style={{ backgroundColor: "#E0E7FF", borderRadius: 16, padding: 16, flexBasis: "48%", marginBottom: 14 }}>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>⚡ Avg Reaction</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#4338CA" }}>{averageReactionTime} ms</Text>
        </View>
        <View style={{ backgroundColor: "#FDE68A", borderRadius: 16, padding: 16, flexBasis: "48%", marginBottom: 14 }}>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>📝 Tasks Completed</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#92400E" }}>{tasksCompleted}</Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={{ marginTop: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12, color: "#111827" }}>💡 Recommendations</Text>
        {recs.map((r: string, i: number) => (
          <View
            key={i}
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 14,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text style={{ fontSize: 16, color: "#374151" }}>• {r}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        onPress={() => nav.navigate("BrainGames")}
        style={{
          marginTop: 40,
          padding: 18,
          borderRadius: 16,
          backgroundColor: PALETTE.teal,
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Back to Games</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
