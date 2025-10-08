// // screens/Assessment/PuzzleAssessmentIntro.tsx
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useState } from "react";
// import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

// type Nav = NativeStackNavigationProp<RootStackParamList, "PuzzleAssessmentRun">;

// export default function PuzzleAssessmentIntro() {
//   const nav = useNavigation<Nav>();
//   const [consent, setConsent] = useState(false);

//   const start = () => {
//     if (!consent) {
//       Alert.alert("Consent Required", "Please confirm you have read the instructions.");
//       return;
//     }
//     nav.navigate("PuzzleAssessmentRun");
//   };

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: "white" }} contentContainerStyle={{ padding: 20 }}>
//       <View style={{ alignItems: "center", marginTop: 30 }}>
//         <Text style={{ fontSize: 56 }}>🧩</Text>
//         <Text style={{ fontSize: 28, fontWeight: "700", color: PALETTE.teal, marginTop: 8 }}>
//           Puzzle Assessment
//         </Text>
//         <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 6 }}>
//           Test your reasoning, logic & problem-solving skills
//         </Text>
//       </View>

//       <View style={{ marginTop: 24 }}>
//         <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Tasks Included</Text>
//         <Text style={{ marginBottom: 6 }}>• Odd-One-Out: Find the different shape</Text>
//         <Text style={{ marginBottom: 6 }}>• Number Sequences: Identify the next number</Text>
//         <Text style={{ marginBottom: 6 }}>• Order Tap: Tap numbers in order quickly</Text>
//         <Text style={{ marginBottom: 6 }}>• Mini Sudoku: Solve a small logic grid</Text>
//       </View>

//       <View style={{ marginTop: 24 }}>
//         <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Duration</Text>
//         <Text>Approximately 8–12 minutes</Text>
//       </View>

//       <TouchableOpacity
//         style={{
//           marginTop: 30,
//           padding: 16,
//           borderRadius: 12,
//           borderWidth: 2,
//           borderColor: consent ? PALETTE.teal : "#E5E7EB",
//           backgroundColor: consent ? PALETTE.lightTeal : "#F3F4F6",
//         }}
//         onPress={() => setConsent(!consent)}
//       >
//         <Text style={{ fontSize: 16, fontWeight: "600", color: consent ? PALETTE.teal : "#6B7280" }}>
//           {consent ? "☑ I have read the instructions" : "☐ I have read the instructions"}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         onPress={start}
//         style={{
//           marginTop: 36,
//           padding: 18,
//           borderRadius: 16,
//           alignItems: "center",
//           backgroundColor: consent ? PALETTE.teal : "#A7F3D0",
//         }}
//       >
//         <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Begin Assessment</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "PuzzleAssessmentRun">;

export default function PuzzleAssessmentIntro() {
  const nav = useNavigation<Nav>();
  const [consent, setConsent] = useState(false);

  const start = () => {
    if (!consent) {
      Alert.alert("Consent Required", "Please confirm you have read the instructions.");
      return;
    }
    nav.navigate("PuzzleAssessmentRun");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }} contentContainerStyle={{ padding: 20 }}>
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <Text style={{ fontSize: 64 }}>🧩</Text>
        <Text style={{ fontSize: 28, fontWeight: "800", color: PALETTE.teal, marginTop: 10 }}>
          Puzzle Assessment
        </Text>
        <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 8, textAlign: "center" }}>
          Solve multiple logic puzzles to test your reasoning, memory, and focus.
        </Text>
      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 14 }}>Tasks Included</Text>
        <Text style={{ marginBottom: 6 }}>• Odd-One-Out: find the different item</Text>
        <Text style={{ marginBottom: 6 }}>• Sequence: complete the number pattern</Text>
        <Text style={{ marginBottom: 6 }}>• Sudoku Mini: solve a small 4×4 Sudoku</Text>
        <Text style={{ marginBottom: 6 }}>• Target Number: tap all target numbers quickly</Text>
      </View>

      <TouchableOpacity
        style={{
          marginTop: 28,
          padding: 16,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: consent ? PALETTE.teal : "#E5E7EB",
          backgroundColor: consent ? PALETTE.lightTeal : "#F9FAFB",
        }}
        onPress={() => setConsent(!consent)}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: consent ? PALETTE.teal : "#6B7280" }}>
          {consent ? "☑ I have read the instructions" : "☐ I have read the instructions"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={start}
        style={{
          marginTop: 36,
          padding: 18,
          borderRadius: 16,
          alignItems: "center",
          backgroundColor: consent ? PALETTE.teal : "#A7F3D0",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Start Assessment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
