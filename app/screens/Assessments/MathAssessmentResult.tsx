// app/src/screens/Assessments/MathAssessmentResult.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext"; // Import the settings context

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

  // Use settings context
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  if (!results) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : PALETTE.lightPink }]}>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: isDark ? '#fff' : PALETTE.neutralMuted }]}>
            No results to show.
          </Text>
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

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : PALETTE.lightPink;
  const textColor = isDark ? '#fff' : PALETTE.teal;
  const cardBg = isDark ? '#2a2a2a' : '#FFFFFF';
  const mutedTextColor = isDark ? '#aaa' : PALETTE.neutralMuted;
  const darkTextColor = isDark ? '#fff' : PALETTE.neutralDark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.trophyContainer, { backgroundColor: themeColor }]}>
            <Text style={styles.trophyEmoji}>{getTrophyEmoji()}</Text>
          </View>

          <Text style={[styles.performanceTitle, { 
            color: themeColor,
            fontSize: 32 * fontScale 
          }]}>
            {getPerformanceMessage()}
          </Text>

          <Text style={[styles.assessmentComplete, { 
            color: darkTextColor,
            fontSize: 20 * fontScale 
          }]}>
            Assessment Complete
          </Text>

          <Text style={[styles.encouragementText, { 
            color: mutedTextColor,
            fontSize: 17 * fontScale 
          }]}>
            {getEncouragementMessage()}
          </Text>

          {/* Listen Summary Button */}
          <TouchableOpacity
            onPress={speakSummary}
            style={[styles.listenButton, { 
              borderColor: themeColor,
              backgroundColor: isDark ? '#2a2a2a' : 'white'
            }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.listenButtonText, { 
              color: themeColor,
              fontSize: 18 * fontScale 
            }]}>
              {isSpeaking ? "⏸ Stop Reading" : "🔊 Listen to Summary"}
            </Text>
          </TouchableOpacity>

          {/* Save Status */}
          {savedId && (
            <View style={styles.saveStatusContainer}>
              <View style={[styles.statusBadge, styles.statusSuccess, { 
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)' 
              }]}>
                <Text style={[styles.statusTextSuccess, { fontSize: 15 * fontScale }]}>
                  ✅ Results Saved!
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Stats Card */}
        <View style={styles.statsCardContainer}>
          <View style={[styles.statsCard, { 
            borderColor: themeColor,
            backgroundColor: cardBg
          }]}>
            <Text style={[styles.statsTitle, { 
              color: themeColor,
              fontSize: 24 * fontScale 
            }]}>
              Your Performance
            </Text>

            {/* Main Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: `${themeColor}20` }]}>
                  <Text style={[styles.statValue, { 
                    color: themeColor,
                    fontSize: 22 * fontScale 
                  }]}>
                    {formatTime(results.timeSpent || 0)}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { 
                  color: mutedTextColor,
                  fontSize: 14 * fontScale 
                }]}>
                  Time Used
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: `${themeColor}20` }]}>
                  <Text style={[styles.statValue, { 
                    color: themeColor,
                    fontSize: 22 * fontScale 
                  }]}>
                    {results.correctAnswers}/{results.totalQuestions}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { 
                  color: mutedTextColor,
                  fontSize: 14 * fontScale 
                }]}>
                  Correct
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: `${themeColor}20` }]}>
                  <Text style={[styles.statValue, { 
                    color: themeColor,
                    fontSize: 22 * fontScale 
                  }]}>
                    {percentage}%
                  </Text>
                </View>
                <Text style={[styles.statLabel, { 
                  color: mutedTextColor,
                  fontSize: 14 * fontScale 
                }]}>
                  Accuracy
                </Text>
              </View>
            </View>

            {/* Cognitive Level */}
            {results.cognitiveLevel && (
              <View style={[styles.cognitiveContainer, { borderTopColor: isDark ? '#3a3a3a' : '#E5E7EB' }]}>
                <Text style={[styles.cognitiveTitle, { 
                  color: darkTextColor,
                  fontSize: 18 * fontScale 
                }]}>
                  Cognitive Level
                </Text>
                <View style={[styles.cognitiveBadge, { backgroundColor: `${themeColor}15` }]}>
                  <Text style={[styles.cognitiveValue, { 
                    color: themeColor,
                    fontSize: 20 * fontScale 
                  }]}>
                    {results.cognitiveLevel}
                  </Text>
                </View>
              </View>
            )}

            {/* Voice Metrics (if used) */}
            {results.voiceAnswersCount !== undefined && results.voiceAnswersCount > 0 && (
              <View style={[styles.voiceMetricsContainer, { borderTopColor: isDark ? '#3a3a3a' : '#E5E7EB' }]}>
                <Text style={[styles.voiceMetricsTitle, { 
                  color: darkTextColor,
                  fontSize: 18 * fontScale 
                }]}>
                  Voice Recognition Stats
                </Text>
                <View style={styles.voiceMetricsGrid}>
                  <View style={styles.voiceMetricItem}>
                    <Text style={[styles.voiceMetricValue, { 
                      color: darkTextColor,
                      fontSize: 24 * fontScale 
                    }]}>
                      {results.voiceAnswersCount}
                    </Text>
                    <Text style={[styles.voiceMetricLabel, { 
                      color: mutedTextColor,
                      fontSize: 14 * fontScale 
                    }]}>
                      Voice Answers
                    </Text>
                  </View>
                  {results.avgVoiceResponseMs && (
                    <View style={styles.voiceMetricItem}>
                      <Text style={[styles.voiceMetricValue, { 
                        color: darkTextColor,
                        fontSize: 24 * fontScale 
                      }]}>
                        {Math.round(results.avgVoiceResponseMs / 1000)}s
                      </Text>
                      <Text style={[styles.voiceMetricLabel, { 
                        color: mutedTextColor,
                        fontSize: 14 * fontScale 
                      }]}>
                        Avg Response
                      </Text>
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
            <View style={[styles.achievementBadge, { 
              borderLeftColor: themeColor,
              backgroundColor: isDark ? '#2a2a2a' : 'rgba(255,255,255,0.95)'
            }]}>
              <Text style={[styles.achievementIcon, { fontSize: 36 * fontScale }]}>⭐</Text>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementTitle, { 
                  color: themeColor,
                  fontSize: 20 * fontScale 
                }]}>
                  Achievement Unlocked!
                </Text>
                <Text style={[styles.achievementSubtitle, { 
                  color: mutedTextColor,
                  fontSize: 16 * fontScale 
                }]}>
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
            <Text style={[styles.primaryButtonIcon, { fontSize: 24 * fontScale }]}>🔄</Text>
            <Text style={[styles.primaryButtonText, { fontSize: 20 * fontScale }]}>
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { 
              borderColor: themeColor,
              backgroundColor: isDark ? '#2a2a2a' : 'white'
            }]}
            onPress={() => navigation.navigate("Assessment")}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonIcon, { fontSize: 24 * fontScale }]}>📊</Text>
            <Text style={[styles.secondaryButtonText, { 
              color: themeColor,
              fontSize: 20 * fontScale 
            }]}>
              View All Assessments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tertiaryButton, { 
              backgroundColor: isDark ? '#2a2a2a' : 'white',
              borderColor: isDark ? '#3a3a3a' : '#D1D5DB'
            }]}
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.8}
          >
            <Text style={[styles.tertiaryButtonIcon, { fontSize: 24 * fontScale }]}>🏠</Text>
            <Text style={[styles.tertiaryButtonText, { 
              color: mutedTextColor,
              fontSize: 20 * fontScale 
            }]}>
              Home
            </Text>
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
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  assessmentComplete: {
    fontWeight: "600",
    marginBottom: 12,
  },
  encouragementText: {
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  listenButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listenButtonText: {
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
  },
  statusSuccess: {},
  statusTextSuccess: {
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
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  statsTitle: {
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
    fontWeight: "700",
  },
  statLabel: {
    fontWeight: "600",
    textAlign: "center",
  },
  cognitiveContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 2,
    alignItems: "center",
  },
  cognitiveTitle: {
    fontWeight: "700",
    marginBottom: 12,
  },
  cognitiveBadge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  cognitiveValue: {
    fontWeight: "700",
    textAlign: "center",
  },
  voiceMetricsContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 2,
  },
  voiceMetricsTitle: {
    fontWeight: "700",
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
    fontWeight: "700",
    marginBottom: 8,
  },
  voiceMetricLabel: {
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
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementIcon: {
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  achievementSubtitle: {},
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
    marginRight: 12,
  },
  primaryButtonText: {
    fontWeight: "700",
    color: "white",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButtonIcon: {
    marginRight: 12,
  },
  secondaryButtonText: {
    fontWeight: "700",
  },
  tertiaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tertiaryButtonIcon: {
    marginRight: 12,
  },
  tertiaryButtonText: {
    fontWeight: "600",
  },
});