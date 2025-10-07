// app/src/screens/Assessments/MathAssessmentResult.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NavProp = NativeStackNavigationProp<RootStackParamList, "MathAssessmentResult">;

type RouteParams = {
  results: any; // keep flexible; contains score, answers etc.
  savedId?: string | null;
};

const MathAssessmentResult: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { results, savedId } = (route.params as RouteParams) || { results: null, savedId: null };
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!results) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>No results to show.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const percentage = results.score ?? 0;
  const getTheme = () => {
    if (percentage >= 90) return PALETTE.teal;
    if (percentage >= 70) return PALETTE.orange;
    if (percentage >= 50) return PALETTE.blue;
    return PALETTE.red;
  };

  const speakSummary = () => {
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); return; }
    const advice = percentage >= 70 ? "Great job! Keep practicing steadily." : "Keep practicing a little every day to improve speed and accuracy.";
    const text = `You scored ${percentage} percent. ${advice}`;
    setIsSpeaking(true);
    Speech.speak(text, {
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: PALETTE.lightPink }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { borderColor: getTheme() }]}>
          <Text style={[styles.title, { color: getTheme() }]}>Assessment Complete</Text>
          <Text style={styles.score}>{percentage}%</Text>
          <Text style={styles.sub}>{results.correctAnswers}/{results.totalQuestions} correct</Text>

          <TouchableOpacity style={[styles.listenBtn, { borderColor: getTheme() }]} onPress={speakSummary}>
            <Text style={[styles.listenText, { color: getTheme() }]}>{isSpeaking ? "⏸ Stop" : "🔊 Listen Summary"}</Text>
          </TouchableOpacity>

          {savedId ? <Text style={styles.savedInfo}>Saved (id: {savedId})</Text> : <Text style={styles.savedInfo}>Saved locally</Text>}
        </View>

        <View style={styles.stats}>
          <Text style={styles.statTitle}>Time Used</Text>
          <Text style={styles.statValue}>{formatTime(results.timeSpent)}</Text>

          <Text style={[styles.statTitle, { marginTop: 12 }]}>Cognitive Level</Text>
          <Text style={styles.statValue}>{results.cognitiveLevel}</Text>

          {/* Optionally show voice metrics if present */}
          {results.voiceAnswersCount !== undefined && (
            <>
              <Text style={[styles.statTitle, { marginTop: 12 }]}>Voice Answers</Text>
              <Text style={styles.statValue}>{results.voiceAnswersCount}</Text>
            </>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: getTheme() }]} onPress={() => navigation.navigate("MathAssessment")}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnSecondary]} onPress={() => navigation.navigate("Home")}>
            <Text style={[styles.btnTextSecondary]}>Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MathAssessmentResult;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, alignItems: "center" },
  hero: { width: "100%", backgroundColor: "white", padding: 18, borderRadius: 12, alignItems: "center", borderWidth: 2, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  score: { fontSize: 44, fontWeight: "900" },
  sub: { color: "#6B7280", marginBottom: 8 },
  listenBtn: { marginTop: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, borderWidth: 2, backgroundColor: "rgba(255,255,255,0.9)" },
  listenText: { fontWeight: "700" },
  savedInfo: { marginTop: 8, color: "#6B7280", fontSize: 12 },
  stats: { width: "100%", backgroundColor: "white", padding: 16, borderRadius: 12 },
  statTitle: { fontWeight: "700", color: "#374151" },
  statValue: { fontSize: 20, fontWeight: "800", marginTop: 6 },
  actions: { width: "100%", marginTop: 20, alignItems: "center" },
  btnPrimary: { width: "100%", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  btnText: { color: "white", fontWeight: "800", fontSize: 16 },
  btnSecondary: { width: "100%", paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  btnTextSecondary: { color: "#374151", fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" }
});
