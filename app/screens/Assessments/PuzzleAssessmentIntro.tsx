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
import { useSettings } from "@/app/contexts/SettingsContext"; // Import the settings context

type Nav = NativeStackNavigationProp<RootStackParamList, "PuzzleAssessmentRun">;

export default function PuzzleAssessmentIntro() {
  const nav = useNavigation<Nav>();
  const [consent, setConsent] = useState(false);

  // Use settings context
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const start = () => {
    if (!consent) {
      Alert.alert("Consent Required", "Please confirm you have read the instructions.");
      return;
    }
    nav.navigate("PuzzleAssessmentRun");
  };

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : 'white';
  const textColor = isDark ? '#fff' : PALETTE.teal;
  const mutedTextColor = isDark ? '#aaa' : '#6B7280';
  const cardBg = isDark ? '#2a2a2a' : '#F9FAFB';
  const cardBorderColor = isDark ? PALETTE.teal : '#E5E7EB';
  const selectedCardBg = isDark ? '#2a4a4a' : PALETTE.lightTeal;
  const selectedCardBorderColor = isDark ? PALETTE.teal : PALETTE.teal;

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: bgColor }} 
      contentContainerStyle={{ padding: 20 }}
    >
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <Text style={{ fontSize: 64 * fontScale }}>🧩</Text>
        <Text style={{ 
          fontSize: 28 * fontScale, 
          fontWeight: "800", 
          color: textColor, 
          marginTop: 10 
        }}>
          Puzzle Assessment
        </Text>
        <Text style={{ 
          fontSize: 16 * fontScale, 
          color: mutedTextColor, 
          marginTop: 8, 
          textAlign: "center" 
        }}>
          Solve multiple logic puzzles to test your reasoning, memory, and focus.
        </Text>
      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={{ 
          fontSize: 20 * fontScale, 
          fontWeight: "700", 
          marginBottom: 14,
          color: textColor 
        }}>
          Tasks Included
        </Text>
        <Text style={{ 
          marginBottom: 6, 
          fontSize: 16 * fontScale,
          color: mutedTextColor 
        }}>
          • Odd-One-Out: find the different item
        </Text>
        <Text style={{ 
          marginBottom: 6, 
          fontSize: 16 * fontScale,
          color: mutedTextColor 
        }}>
          • Sequence: complete the number pattern
        </Text>
        <Text style={{ 
          marginBottom: 6, 
          fontSize: 16 * fontScale,
          color: mutedTextColor 
        }}>
          • Sudoku Mini: solve a small 4×4 Sudoku
        </Text>
        <Text style={{ 
          marginBottom: 6, 
          fontSize: 16 * fontScale,
          color: mutedTextColor 
        }}>
          • Target Number: tap all target numbers quickly
        </Text>
      </View>

      <TouchableOpacity
        style={{
          marginTop: 28,
          padding: 16,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: consent ? selectedCardBorderColor : cardBorderColor,
          backgroundColor: consent ? selectedCardBg : cardBg,
        }}
        onPress={() => setConsent(!consent)}
      >
        <Text style={{ 
          fontSize: 16 * fontScale, 
          fontWeight: "600", 
          color: consent ? textColor : mutedTextColor 
        }}>
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
          backgroundColor: consent ? PALETTE.teal : (isDark ? '#3a3a3a' : '#A7F3D0'),
        }}
        disabled={!consent}
      >
        <Text style={{ 
          fontSize: 18 * fontScale, 
          fontWeight: "700", 
          color: consent ? "white" : (isDark ? '#888' : '#666') 
        }}>
          Start Assessment
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}