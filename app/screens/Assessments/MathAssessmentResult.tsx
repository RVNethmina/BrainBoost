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
  results: any;
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
          <Text style={styles.errorText}>No results to show.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const percentage = results.score ?? 0;
  
  const getThemeColor = () => {
    if (percentage >= 90) return PALETTE.teal;
    if (percentage >= 70) return PALETTE.orange;
    if (percentage >= 50) return PALETTE.blue;
    return PALETTE.red;
  };

  const getTrophyEmoji = () => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 70) return "🥈";
    if (percentage >= 50) return "🥉";
    return "🎯";
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Outstanding Performance!";
    if (percentage >= 70) return "Excellent Work!";
    if (percentage >= 50) return "Good Job!";
    return "Keep Practicing!";
  };

  const getEncouragementMessage = () => {
    if (percentage >= 70) {
      return "Your cognitive assessment shows excellent results. Keep maintaining your mental sharpness!";
    }
    return "Regular practice helps improve cognitive abilities. Try the assessment again to track your progress.";
  };

  const speakSummary = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const advice = percentage >= 70 
      ? "Excellent work! Your cognitive abilities are sharp. Continue with regular mental exercises."
      : "Keep practicing daily to enhance your cognitive skills and mental agility.";
    
    const voicePart = results.voiceAnswersCount 
      ? ` You used voice input for ${results.voiceAnswersCount} answer${results.voiceAnswersCount > 1 ? "s" : ""}.`
      : "";
    
    const text = `Assessment complete. You scored ${percentage} percent, answering ${results.correctAnswers} out of ${results.totalQuestions} questions correctly. ${advice}${voicePart}`;
    
    setIsSpeaking(true);
    Speech.speak(text, {
      rate: 0.85,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const themeColor = getThemeColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: PALETTE.lightPink }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.trophyContainer, { backgroundColor: themeColor }]}>
            <Text style={styles.trophyEmoji}>{getTrophyEmoji()}</Text>
          </View>

          <Text style={[styles.performanceTitle, { color: themeColor }]}>
            {getPerformanceMessage()}
          </Text>

          <Text style={styles.assessmentComplete}>Assessment Complete</Text>

          <Text style={styles.encouragementText}>
            {getEncouragementMessage()}
          </Text>

          {/* Listen Summary Button */}
          <TouchableOpacity
            onPress={speakSummary}
            style={[styles.listenButton, { borderColor: themeColor }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.listenButtonText, { color: themeColor }]}>
              {isSpeaking ? "⏸ Stop Reading" : "🔊 Listen to Summary"}
            </Text>
          </TouchableOpacity>

          {/* Save Status */}
          {savedId && (
            <View style={styles.saveStatusContainer}>
              <View style={[styles.statusBadge, styles.statusSuccess]}>
                <Text style={styles.statusTextSuccess}>✅ Results Saved!</Text>
              </View>
            </View>
          )}
        </View>

        {/* Stats Card */}
        <View style={styles.statsCardContainer}>
          <View style={[styles.statsCard, { borderColor: themeColor }]}>
            <Text style={[styles.statsTitle, { color: themeColor }]}>
              Your Performance
            </Text>

            {/* Main Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: `${themeColor}20` }]}>
                  <Text style={[styles.statValue, { color: themeColor }]}>
                    {formatTime(results.timeSpent || 0)}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Time Used</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: `${themeColor}20` }]}>
                  <Text style={[styles.statValue, { color: themeColor }]}>
                    {results.correctAnswers}/{results.totalQuestions}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Correct</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: `${themeColor}20` }]}>
                  <Text style={[styles.statValue, { color: themeColor }]}>
                    {percentage}%
                  </Text>
                </View>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>

            {/* Cognitive Level */}
            {results.cognitiveLevel && (
              <View style={styles.cognitiveContainer}>
                <Text style={styles.cognitiveTitle}>Cognitive Level</Text>
                <View style={[styles.cognitiveBadge, { backgroundColor: `${themeColor}15` }]}>
                  <Text style={[styles.cognitiveValue, { color: themeColor }]}>
                    {results.cognitiveLevel}
                  </Text>
                </View>
              </View>
            )}

            {/* Voice Metrics (if used) */}
            {results.voiceAnswersCount !== undefined && results.voiceAnswersCount > 0 && (
              <View style={styles.voiceMetricsContainer}>
                <Text style={styles.voiceMetricsTitle}>Voice Recognition Stats</Text>
                <View style={styles.voiceMetricsGrid}>
                  <View style={styles.voiceMetricItem}>
                    <Text style={styles.voiceMetricValue}>{results.voiceAnswersCount}</Text>
                    <Text style={styles.voiceMetricLabel}>Voice Answers</Text>
                  </View>
                  {results.avgVoiceResponseMs && (
                    <View style={styles.voiceMetricItem}>
                      <Text style={styles.voiceMetricValue}>
                        {Math.round(results.avgVoiceResponseMs / 1000)}s
                      </Text>
                      <Text style={styles.voiceMetricLabel}>Avg Response</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Achievement Badge */}
        {percentage >= 80 && (
          <View style={styles.achievementContainer}>
            <View style={[styles.achievementBadge, { borderLeftColor: themeColor }]}>
              <Text style={styles.achievementIcon}>⭐</Text>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementTitle, { color: themeColor }]}>
                  Achievement Unlocked!
                </Text>
                <Text style={styles.achievementSubtitle}>
                  {percentage >= 90 ? "Cognitive Champion!" : "Excellent Mental Agility!"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: themeColor }]}
            onPress={() => navigation.navigate("MathAssessment")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonIcon}>🔄</Text>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: themeColor }]}
            onPress={() => navigation.navigate("Assessment")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonIcon}>📊</Text>
            <Text style={[styles.secondaryButtonText, { color: themeColor }]}>
              View All Assessments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.8}
          >
            <Text style={styles.tertiaryButtonIcon}>🏠</Text>
            <Text style={styles.tertiaryButtonText}>Home</Text>
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
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 18,
    color: PALETTE.neutralMuted,
    fontWeight: "600",
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
  },
  trophyContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  trophyEmoji: {
    fontSize: 64,
  },
  performanceTitle: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  assessmentComplete: {
    fontSize: 20,
    fontWeight: "600",
    color: PALETTE.neutralDark,
    marginBottom: 12,
  },
  encouragementText: {
    fontSize: 17,
    color: PALETTE.neutralMuted,
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  listenButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listenButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  saveStatusContainer: {
    marginTop: 16,
    minHeight: 40,
  },
  statusBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  statusSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  statusTextSuccess: {
    fontSize: 15,
    color: PALETTE.green,
    fontWeight: "600",
  },
  statsCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsCard: {
    padding: 28,
    borderRadius: 24,
    backgroundColor: "white",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: PALETTE.neutralMuted,
    textAlign: "center",
  },
  cognitiveContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },
  cognitiveTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PALETTE.neutralDark,
    marginBottom: 12,
  },
  cognitiveBadge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  cognitiveValue: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  voiceMetricsContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: "#E5E7EB",
  },
  voiceMetricsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PALETTE.neutralDark,
    marginBottom: 16,
    textAlign: "center",
  },
  voiceMetricsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  voiceMetricItem: {
    alignItems: "center",
  },
  voiceMetricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: PALETTE.neutralDark,
    marginBottom: 8,
  },
  voiceMetricLabel: {
    fontSize: 14,
    color: PALETTE.neutralMuted,
    textAlign: "center",
  },
  achievementContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  achievementSubtitle: {
    fontSize: 16,
    color: PALETTE.neutralMuted,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: "700",
  },
  tertiaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tertiaryButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tertiaryButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: PALETTE.neutralMuted,
  },
});