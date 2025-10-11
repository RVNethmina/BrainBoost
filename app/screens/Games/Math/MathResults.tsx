// screens/MathResultsScreen.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { saveMathResult } from "@/app/services/mathResultsService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext";

type MathResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MathResults"
>;

type MathResultsRouteParams = {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  endedBy: string;
  gameType?: string;
  voiceAnswersCount?: number;
  avgVoiceResponseMs?: number;
};

type SaveMathResultResponse =
  | { success: true; id: string }
  | { success: false; error: unknown };

const MathResultsScreen: React.FC = () => {
  const navigation = useNavigation<MathResultsScreenNavigationProp>();
  const route = useRoute();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const {
    score = 0,
    totalQuestions = 0,
    timeTaken = 0,
    endedBy = "completed",
    gameType = "math",
    voiceAnswersCount = 0,
    avgVoiceResponseMs = 0,
  } = (route.params as MathResultsRouteParams) || {};

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const savedRef = useRef(false);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : PALETTE.lightPink;
  const textColor = isDark ? '#fff' : '#374151';
  const secondaryTextColor = isDark ? '#ccc' : '#6B7280';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const successBg = isDark ? '#1a3a2a' : 'rgba(16, 185, 129, 0.15)';
  const errorBg = isDark ? '#3a1a1a' : 'rgba(239, 68, 68, 0.15)';
  const borderColor = isDark ? '#444' : '#D1D5DB';

  const percentageScore = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getEndMessage = () => {
    if (endedBy === "timeUp") return "Time's Up!";
    if (endedBy === "completed") return "Quiz Completed!";
    if (endedBy === "quit") return "You Finished Early";
    return "Quiz Ended";
  };

  const getTrophyEmoji = () => {
    if (percentageScore >= 90) return "🏆";
    if (percentageScore >= 70) return "🥈";
    if (percentageScore >= 50) return "🥉";
    return "🎯";
  };

  const getThemeColor = () => {
    if (percentageScore >= 90) return PALETTE.teal;
    if (percentageScore >= 70) return PALETTE.orange;
    if (percentageScore >= 50) return PALETTE.blue;
    return PALETTE.red;
  };

  const getPerformanceMessage = () => {
    if (percentageScore >= 90) return "Outstanding Performance!";
    if (percentageScore >= 70) return "Excellent Work!";
    if (percentageScore >= 50) return "Good Job!";
    return "Keep Practicing!";
  };

  const getEncouragementMessage = () => {
    if (percentageScore >= 70) {
      return "Your math skills are excellent! Keep up the great work.";
    }
    return "Practice makes perfect! Try again to improve your score.";
  };

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      setSaveStatus("saving");
      try {
        // quick: cast payload to any to bypass strict typing while preserving runtime shape
        const payload: any = {
          score,
          totalQuestions,
          timeTaken,
          endedBy,
          gameType,
          voiceAnswersCount,
          avgVoiceResponseMs,
        };

        const res = (await saveMathResult(payload)) as SaveMathResultResponse;


        if (res && (res as any).success) {
          console.log("✅ Math result saved, id:", (res as any).id);
          setSaveStatus("saved");
        } else {
          console.error("❌ Failed to save math result", (res as any).error ?? res);
          setSaveStatus("error");
        }
      } catch (err) {
        console.error("❌ saveMathResult exception", err);
        setSaveStatus("error");
      }
    })();
  }, [score, totalQuestions, timeTaken, endedBy, gameType, voiceAnswersCount, avgVoiceResponseMs]);

  const speakSummary = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const advice =
      percentageScore >= 70
        ? "Great job! Keep practicing steadily."
        : "Keep practicing a little every day to improve your speed and accuracy.";
    
    const voicePart =
      voiceAnswersCount && voiceAnswersCount > 0
        ? ` You answered ${voiceAnswersCount} question${voiceAnswersCount > 1 ? "s" : ""} using voice, with an average response time of ${Math.round(
            (avgVoiceResponseMs || 0) / 1000
          )} seconds.`
        : "";
    
    const text = `You scored ${score} out of ${totalQuestions}, which is ${percentageScore} percent. ${advice}.${voicePart}`;
    
    setIsSpeaking(true);
    Speech.speak(text, {
      rate: 0.85, // Slower for elderly users
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const themeColor = getThemeColor();

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
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
            fontSize: 32 * fontScale,
            color: themeColor 
          }]}>
            {getPerformanceMessage()}
          </Text>

          <Text style={[styles.endMessage, { 
            fontSize: 20 * fontScale,
            color: textColor 
          }]}>
            {getEndMessage()}
          </Text>

          <Text style={[styles.encouragementText, { 
            fontSize: 17 * fontScale,
            color: secondaryTextColor 
          }]}>
            {getEncouragementMessage()}
          </Text>

          {/* Listen Summary Button */}
          <TouchableOpacity
            onPress={speakSummary}
            style={[styles.listenButton, { 
              borderColor: themeColor,
              backgroundColor: cardBg 
            }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.listenButtonText, { 
              fontSize: 18 * fontScale,
              color: themeColor 
            }]}>
              {isSpeaking ? "⏸ Stop Reading" : "🔊 Listen to Summary"}
            </Text>
          </TouchableOpacity>

          {/* Save Status */}
          <View style={styles.saveStatusContainer}>
            {saveStatus === "saving" && (
              <View style={[styles.statusBadge, { backgroundColor: isDark ? '#3a3a3a' : 'rgba(255,255,255,0.9)' }]}>
                <Text style={[styles.statusText, { 
                  fontSize: 15 * fontScale,
                  color: secondaryTextColor 
                }]}>
                  💾 Saving results...
                </Text>
              </View>
            )}
            {saveStatus === "saved" && (
              <View style={[styles.statusBadge, { backgroundColor: successBg }]}>
                <Text style={[styles.statusTextSuccess, { 
                  fontSize: 15 * fontScale,
                  color: PALETTE.teal 
                }]}>
                  ✅ Results Saved!
                </Text>
              </View>
            )}
            {saveStatus === "error" && (
              <View style={[styles.statusBadge, { backgroundColor: errorBg }]}>
                <Text style={[styles.statusTextError, { 
                  fontSize: 15 * fontScale,
                  color: PALETTE.red 
                }]}>
                  ⚠️ Could Not Save
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCardContainer}>
          <View style={[styles.statsCard, { 
            borderColor: themeColor,
            backgroundColor: cardBg 
          }]}>
            <Text style={[styles.statsTitle, { 
              fontSize: 24 * fontScale,
              color: themeColor 
            }]}>
              Your Performance
            </Text>

            {/* Main Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: isDark ? `${themeColor}30` : `${themeColor}20` }]}>
                  <Text style={[styles.statValue, { 
                    fontSize: 22 * fontScale,
                    color: themeColor 
                  }]}>
                    {formatTime(timeTaken)}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { 
                  fontSize: 14 * fontScale,
                  color: secondaryTextColor 
                }]}>
                  Time Used
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: isDark ? `${themeColor}30` : `${themeColor}20` }]}>
                  <Text style={[styles.statValue, { 
                    fontSize: 22 * fontScale,
                    color: themeColor 
                  }]}>
                    {score}/{totalQuestions}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { 
                  fontSize: 14 * fontScale,
                  color: secondaryTextColor 
                }]}>
                  Correct
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statCircle, { backgroundColor: isDark ? `${themeColor}30` : `${themeColor}20` }]}>
                  <Text style={[styles.statValue, { 
                    fontSize: 22 * fontScale,
                    color: themeColor 
                  }]}>
                    {percentageScore}%
                  </Text>
                </View>
                <Text style={[styles.statLabel, { 
                  fontSize: 14 * fontScale,
                  color: secondaryTextColor 
                }]}>
                  Accuracy
                </Text>
              </View>
            </View>

            {/* Voice Metrics (if used) */}
            {voiceAnswersCount > 0 && (
              <View style={[styles.voiceMetricsContainer, { borderTopColor: isDark ? '#444' : '#E5E7EB' }]}>
                <Text style={[styles.voiceMetricsTitle, { 
                  fontSize: 18 * fontScale,
                  color: textColor 
                }]}>
                  Voice Recognition Stats
                </Text>
                <View style={styles.voiceMetricsGrid}>
                  <View style={styles.voiceMetricItem}>
                    <Text style={[styles.voiceMetricValue, { 
                      fontSize: 24 * fontScale,
                      color: textColor 
                    }]}>
                      {voiceAnswersCount}
                    </Text>
                    <Text style={[styles.voiceMetricLabel, { 
                      fontSize: 14 * fontScale,
                      color: secondaryTextColor 
                    }]}>
                      Voice Answers
                    </Text>
                  </View>
                  <View style={styles.voiceMetricItem}>
                    <Text style={[styles.voiceMetricValue, { 
                      fontSize: 24 * fontScale,
                      color: textColor 
                    }]}>
                      {avgVoiceResponseMs ? `${Math.round(avgVoiceResponseMs / 1000)}s` : "--"}
                    </Text>
                    <Text style={[styles.voiceMetricLabel, { 
                      fontSize: 14 * fontScale,
                      color: secondaryTextColor 
                    }]}>
                      Avg Response Time
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Achievement Badge */}
        {percentageScore >= 80 && (
          <View style={styles.achievementContainer}>
            <View style={[styles.achievementBadge, { 
              borderLeftColor: themeColor,
              backgroundColor: isDark ? '#3a3a3a' : 'rgba(255,255,255,0.95)' 
            }]}>
              <Text style={styles.achievementIcon}>⭐</Text>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementTitle, { 
                  fontSize: 20 * fontScale,
                  color: themeColor 
                }]}>
                  Achievement Unlocked!
                </Text>
                <Text style={[styles.achievementSubtitle, { 
                  fontSize: 16 * fontScale,
                  color: secondaryTextColor 
                }]}>
                  {percentageScore >= 90 ? "Math Master!" : "Great Problem Solver!"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: themeColor }]}
            onPress={() => navigation.navigate("MathQuiz")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonIcon}>🔄</Text>
            <Text style={[styles.primaryButtonText, { fontSize: 20 * fontScale }]}>
              Play Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { 
              borderColor: themeColor,
              backgroundColor: cardBg 
            }]}
            onPress={() => navigation.navigate("BrainGames")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonIcon}>🎮</Text>
            <Text style={[styles.secondaryButtonText, { 
              fontSize: 20 * fontScale,
              color: themeColor 
            }]}>
              More Games
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tertiaryButton, { 
              backgroundColor: cardBg,
              borderColor: borderColor 
            }]}
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.8}
          >
            <Text style={styles.tertiaryButtonIcon}>🏠</Text>
            <Text style={[styles.tertiaryButtonText, { 
              fontSize: 20 * fontScale,
              color: secondaryTextColor 
            }]}>
              Home
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default MathResultsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
  endMessage: {
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
  statusText: {
    fontWeight: "600",
  },
  statusTextSuccess: {
    fontWeight: "600",
  },
  statusTextError: {
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
    fontSize: 36,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  achievementSubtitle: {
    color: "#6B7280",
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
    fontSize: 24,
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
    fontSize: 24,
    marginRight: 12,
  },
  tertiaryButtonText: {
    fontWeight: "600",
  },
});