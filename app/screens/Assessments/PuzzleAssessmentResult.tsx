
// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { getPuzzleRecommendations, savePuzzleAssessment } from "@/app/services/puzzleAssessmentService";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import * as Speech from "expo-speech";
// import React, { useEffect, useState } from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// type NavProp = NativeStackNavigationProp<RootStackParamList, "BrainGames">;

// export default function PuzzleAssessmentResult() {
//   const navigation = useNavigation<NavProp>();
//   const route = useRoute<any>();
//   const { totalTime, results, overallAccuracy, averageReactionTime, tasksCompleted } =
//     route.params || {};

//   const [isSpeaking, setIsSpeaking] = useState(false);

//   // compute puzzle score + performance
//   const score = Math.round(overallAccuracy - averageReactionTime / 1000 + tasksCompleted * 10);
//   const performance =
//     score >= 85
//       ? "Exceptional"
//       : score >= 70
//       ? "Superior"
//       : score >= 55
//       ? "Average"
//       : score >= 40
//       ? "Below Average"
//       : "Needs Practice";

//   // save on mount
//   useEffect(() => {
//     if (results) {
//       savePuzzleAssessment({
//         totalTime,
//         tasksCompleted,
//         overallAccuracy,
//         averageReactionTime,
//         puzzleScore: score,
//         performanceLevel: performance,
//         rawResults: results,
//       });
//     }
//   }, []);

//   // get dynamic feedback
//   const recommendations = getPuzzleRecommendations({
//     overallAccuracy,
//     averageReactionTime,
//     puzzleScore: score,
//   });

//   // voice feedback
//   const speakSummary = () => {
//     if (isSpeaking) {
//       Speech.stop();
//       setIsSpeaking(false);
//       return;
//     }
//     const advice =
//       score >= 70
//         ? "Fantastic work! Keep challenging yourself with harder puzzles."
//         : "You're improving! Practice daily to sharpen your problem-solving speed.";
//     const text = `You scored ${score} out of 100. Performance: ${performance}. ${advice}`;
//     setIsSpeaking(true);
//     Speech.speak(text, {
//       rate: 0.9,
//       onDone: () => setIsSpeaking(false),
//       onStopped: () => setIsSpeaking(false),
//       onError: () => setIsSpeaking(false),
//     });
//   };

//   const getTheme = () => {
//     if (score >= 85) return PALETTE.teal;
//     if (score >= 70) return PALETTE.orange;
//     if (score >= 50) return PALETTE.blue;
//     return PALETTE.red;
//   };

//   if (!results) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.center}>
//           <Text>No results to show.</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: "#FDFCFB" }]}>
//       <ScrollView contentContainerStyle={styles.content}>
//         {/* HEADER */}
//         <View style={[styles.hero, { borderColor: getTheme() }]}>
//           <Text style={[styles.title, { color: getTheme() }]}>Assessment Complete</Text>
//           <Text style={[styles.score, { color: getTheme() }]}>{score}</Text>
//           <Text style={styles.sub}>Performance: {performance}</Text>

//           <TouchableOpacity
//             style={[styles.listenBtn, { borderColor: getTheme() }]}
//             onPress={speakSummary}
//           >
//             <Text style={[styles.listenText, { color: getTheme() }]}>
//               {isSpeaking ? "⏸ Stop" : "🔊 Listen Summary"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* STATS */}
//         <View style={styles.stats}>
//           <Text style={styles.statTitle}>🕒 Time Taken</Text>
//           <Text style={styles.statValue}>{formatTime(totalTime)}</Text>

//           <Text style={[styles.statTitle, { marginTop: 12 }]}>🎯 Accuracy</Text>
//           <Text style={styles.statValue}>{overallAccuracy.toFixed(1)}%</Text>

//           <Text style={[styles.statTitle, { marginTop: 12 }]}>⚡ Avg Reaction Time</Text>
//           <Text style={styles.statValue}>{averageReactionTime} ms</Text>

//           <Text style={[styles.statTitle, { marginTop: 12 }]}>🧩 Tasks Completed</Text>
//           <Text style={styles.statValue}>{tasksCompleted}</Text>
//         </View>

//         {/* RECOMMENDATIONS */}
//         <View style={styles.recs}>
//           <Text style={styles.recsTitle}>💡 Personalized Recommendations</Text>
//           {recommendations.map((r, i) => (
//             <Text key={i} style={styles.recItem}>
//               • {r}
//             </Text>
//           ))}
//         </View>

//         {/* ACTIONS */}
//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={[styles.btnPrimary, { backgroundColor: getTheme() }]}
//             onPress={() => navigation.navigate("PuzzleAssessmentRun")}
//           >
//             <Text style={styles.btnText}>Try Again</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.btnSecondary]}
//             onPress={() => navigation.navigate("Home")}
//           >
//             <Text style={styles.btnTextSecondary}>Back to Games</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // helper
// function formatTime(seconds: number) {
//   const mins = Math.floor(seconds / 60);
//   const secs = seconds % 60;
//   return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   content: { padding: 20, alignItems: "center" },

//   hero: {
//     width: "100%",
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 14,
//     alignItems: "center",
//     borderWidth: 2,
//     marginBottom: 20,
//   },
//   title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
//   score: { fontSize: 56, fontWeight: "900" },
//   sub: { color: "#6B7280", fontSize: 16, marginBottom: 6 },
//   listenBtn: {
//     marginTop: 10,
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     borderRadius: 12,
//     borderWidth: 2,
//     backgroundColor: "rgba(255,255,255,0.9)",
//   },
//   listenText: { fontWeight: "700", fontSize: 16 },

//   stats: {
//     width: "100%",
//     backgroundColor: "white",
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   statTitle: { fontWeight: "700", color: "#374151" },
//   statValue: { fontSize: 20, fontWeight: "800", marginTop: 4, color: "#111827" },

//   recs: {
//     width: "100%",
//     backgroundColor: "white",
//     borderRadius: 12,
//     padding: 18,
//     marginBottom: 20,
//   },
//   recsTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     marginBottom: 8,
//     color: "#111827",
//   },
//   recItem: {
//     fontSize: 15,
//     marginBottom: 4,
//     color: "#374151",
//   },

//   actions: { width: "100%", marginTop: 10, alignItems: "center" },
//   btnPrimary: {
//     width: "100%",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   btnText: { color: "white", fontWeight: "800", fontSize: 16 },
//   btnSecondary: {
//     width: "100%",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   btnTextSecondary: { color: "#374151", fontWeight: "800", fontSize: 16 },

//   center: { flex: 1, alignItems: "center", justifyContent: "center" },
// });


// app/src/screens/Assessments/PuzzleAssessmentResult.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { getPuzzleRecommendations, savePuzzleAssessment } from "@/app/services/puzzleAssessmentService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext"; // Import the settings context

type NavProp = NativeStackNavigationProp<RootStackParamList, "BrainGames">;

export default function PuzzleAssessmentResult() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<any>();
  const { totalTime, results, overallAccuracy, averageReactionTime, tasksCompleted } =
    route.params || {};

  // Use settings context
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const [isSpeaking, setIsSpeaking] = useState(false);
  const savedRef = useRef(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#FDFCFB';
  const textColor = isDark ? '#fff' : PALETTE.teal;
  const mutedTextColor = isDark ? '#aaa' : '#6B7280';
  const darkTextColor = isDark ? '#fff' : '#111827';
  const cardBg = isDark ? '#2a2a2a' : 'white';
  const cardBorderColor = isDark ? '#3a3a3a' : '#E5E7EB';

  // compute puzzle score + performance (Using combined metrics as in Attention Assessment)
  // Logic: Accuracy - (Avg RT in seconds) + (Tasks Completed bonus)
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

  // ✅ Call service to save results on mount
  useEffect(() => {
    if (savedRef.current || !results) return;
    savedRef.current = true;

    (async () => {
      setSaveStatus('saving');
      const payload = {
        totalTime,
        tasksCompleted,
        overallAccuracy: Math.round(overallAccuracy), // Save as rounded number
        averageReactionTime,
        puzzleScore: score,
        performanceLevel: performance,
        rawResults: results,
      };
      
      const res = await savePuzzleAssessment(payload);
      if (res.success) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
        console.error('Failed to save assessment', res.error);
      }
    })();
  }, [results, totalTime, overallAccuracy, averageReactionTime, tasksCompleted, score, performance]);

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
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.center}>
          <Text style={{ color: textColor, fontSize: 16 * fontScale }}>
            No results to show.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const themeColor = getTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* HEADER */}
        <View style={[styles.hero, { 
          borderColor: themeColor,
          backgroundColor: cardBg 
        }]}>
          <Text style={[styles.title, { 
            color: themeColor,
            fontSize: 22 * fontScale 
          }]}>Assessment Complete</Text>
          
          <Text style={[styles.score, { 
            color: themeColor,
            fontSize: 56 * fontScale 
          }]}>{score}</Text>
          
          <Text style={[styles.sub, { 
            color: mutedTextColor,
            fontSize: 16 * fontScale 
          }]}>Performance: {performance}</Text>
          
          {saveStatus === 'saving' && (
            <Text style={{ 
              color: mutedTextColor, 
              marginTop: 10,
              fontSize: 14 * fontScale 
            }}>
              Saving results...
            </Text>
          )}
          {saveStatus === 'saved' && (
            <Text style={{ 
              color: PALETTE.green, 
              marginTop: 10,
              fontSize: 14 * fontScale 
            }}>
              ✅ Results Saved
            </Text>
          )}
          {saveStatus === 'error' && (
            <Text style={{ 
              color: PALETTE.red, 
              marginTop: 10,
              fontSize: 14 * fontScale 
            }}>
              ⚠️ Failed to save results
            </Text>
          )}

          <TouchableOpacity
            style={[styles.listenBtn, { 
              borderColor: themeColor,
              backgroundColor: isDark ? '#2a2a2a' : 'rgba(255,255,255,0.9)'
            }]}
            onPress={speakSummary}
          >
            <Text style={[styles.listenText, { 
              color: themeColor,
              fontSize: 16 * fontScale 
            }]}>
              {isSpeaking ? "⏸ Stop" : "🔊 Listen Summary"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={[styles.stats, { backgroundColor: cardBg }]}>
          <Text style={[styles.statTitle, { 
            color: mutedTextColor,
            fontSize: 16 * fontScale 
          }]}>🕒 Time Taken</Text>
          <Text style={[styles.statValue, { 
            color: darkTextColor,
            fontSize: 20 * fontScale 
          }]}>{formatTime(totalTime)}</Text>

          <Text style={[styles.statTitle, { 
            marginTop: 12,
            color: mutedTextColor,
            fontSize: 16 * fontScale 
          }]}>🎯 Accuracy</Text>
          <Text style={[styles.statValue, { 
            color: darkTextColor,
            fontSize: 20 * fontScale 
          }]}>{overallAccuracy.toFixed(1)}%</Text>

          <Text style={[styles.statTitle, { 
            marginTop: 12,
            color: mutedTextColor,
            fontSize: 16 * fontScale 
          }]}>⚡ Avg Reaction Time</Text>
          <Text style={[styles.statValue, { 
            color: darkTextColor,
            fontSize: 20 * fontScale 
          }]}>{averageReactionTime} ms</Text>

          <Text style={[styles.statTitle, { 
            marginTop: 12,
            color: mutedTextColor,
            fontSize: 16 * fontScale 
          }]}>🧩 Tasks Completed</Text>
          <Text style={[styles.statValue, { 
            color: darkTextColor,
            fontSize: 20 * fontScale 
          }]}>{tasksCompleted}</Text>
        </View>

        {/* RECOMMENDATIONS */}
        <View style={[styles.recs, { backgroundColor: cardBg }]}>
          <Text style={[styles.recsTitle, { 
            color: darkTextColor,
            fontSize: 18 * fontScale 
          }]}>💡 Personalized Recommendations</Text>
          {recommendations.map((r, i) => (
            <Text key={i} style={[styles.recItem, { 
              color: mutedTextColor,
              fontSize: 15 * fontScale 
            }]}>
              • {r}
            </Text>
          ))}
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: themeColor }]}
            onPress={() => navigation.navigate("PuzzleAssessmentRun")}
          >
            <Text style={[styles.btnText, { fontSize: 16 * fontScale }]}>
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, { 
              borderColor: isDark ? '#555' : '#E5E7EB',
              backgroundColor: isDark ? '#2a2a2a' : 'white'
            }]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={[styles.btnTextSecondary, { 
              color: isDark ? '#fff' : '#374151',
              fontSize: 16 * fontScale 
            }]}>
              Back to Home
            </Text>
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
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 20,
  },
  title: { fontWeight: "800", marginBottom: 6 },
  score: { fontWeight: "900" },
  sub: { marginBottom: 6 },
  listenBtn: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  listenText: { fontWeight: "700" },

  stats: {
    width: "100%",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  statTitle: { fontWeight: "700" },
  statValue: { fontWeight: "800", marginTop: 4 },

  recs: {
    width: "100%",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  recsTitle: {
    fontWeight: "800",
    marginBottom: 8,
  },
  recItem: {
    marginBottom: 4,
  },

  actions: { width: "100%", marginTop: 10, alignItems: "center" },
  btnPrimary: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: { color: "white", fontWeight: "800" },
  btnSecondary: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  btnTextSecondary: { fontWeight: "800" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});