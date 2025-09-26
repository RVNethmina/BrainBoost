// app/src/screens/InsightsScreen.tsx
import { PALETTE } from "@/app/design/colors";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const InsightsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PALETTE.lightPink }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Insights</Text>

        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Brain Age Card */}
        <View style={[styles.centerCard, { backgroundColor: PALETTE.yellow }]}>
          <Text style={styles.emoji}>🧠</Text>
          <Text style={styles.cardTitle}>Brain Age</Text>
          <Text style={[styles.bigStat, { color: PALETTE.purple }]}>65 years</Text>
          <Text style={styles.cardNote}>5 years younger than actual!</Text>
        </View>

        {/* Metric helper */}
        {renderMetric(
          "Memory Score",
          "🎯",
          "85%",
          PALETTE.purple,
          "85%",
          "Improved by 12% this month"
        )}

        {renderMetric(
          "Attention",
          "⚡",
          "78%",
          PALETTE.blue,
          "78%",
          "Focus exercises recommended"
        )}

        {renderMetric(
          "Math Skills",
          "🧮",
          "92%",
          PALETTE.orange,
          "92%",
          "Excellent! Above average for age group"
        )}

        {renderMetric(
          "Language",
          "🔤",
          "88%",
          PALETTE.purple,
          "88%",
          "Strong vocabulary skills"
        )}

        {renderMetric(
          "Visual Processing",
          "🎨",
          "74%",
          PALETTE.indigo,
          "74%",
          "Try pattern games to improve"
        )}

        {renderMetric(
          "Processing Speed",
          "⏱️",
          "81%",
          PALETTE.teal,
          "81%",
          "Good reaction time"
        )}

        {/* Personalized Recommendation */}
        <View style={[styles.infoCard, { backgroundColor: PALETTE.lightTeal }]}>
          <Text style={styles.infoEmoji}>💡</Text>
          <View style={styles.infoBody}>
            <Text style={styles.infoTitle}>Personalized Recommendation</Text>
            <Text style={styles.infoText}>
              Focus on attention and visual processing games this week. Your
              memory skills are excellent!
            </Text>
          </View>
        </View>

        {/* Weekly Trend */}
        <View style={[styles.infoCard, { backgroundColor: PALETTE.lightPink }]}>
          <Text style={styles.infoEmoji}>📈</Text>
          <View style={styles.infoBody}>
            <Text style={styles.infoTitle}>Weekly Trend</Text>
            <Text style={styles.infoText}>
              Overall cognitive performance up 8% from last week. Keep up the
              great work!
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default InsightsScreen;

/* ---------- helpers ---------- */

function renderMetric(
  label: string,
  emoji: string,
  displayValue: string,
  fillColor: string,
  percentText: string,
  note: string
) {
  const percent = Number(displayValue.replace("%", ""));
  return (
    <View style={styles.metricCard} key={label}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricEmoji}>{emoji}</Text>
        <Text style={styles.metricTitle}>{label}</Text>
        <Text style={[styles.metricValue, { color: fillColor }]}>
          {displayValue}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${percent}%`, backgroundColor: fillColor },
            ]}
          />
        </View>
      </View>

      <Text style={styles.metricNote}>{note}</Text>
    </View>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
  },
  headerButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  headerButtonText: { fontSize: 20 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  content: { flex: 1, paddingHorizontal: 20 },

  centerCard: {
    alignItems: "center",
    padding: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  emoji: { fontSize: 36, marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6, color: "#111827" },
  bigStat: { fontSize: 28, fontWeight: "800" },
  cardNote: { marginTop: 6, color: PALETTE.neutralMuted },

  metricCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricEmoji: { fontSize: 22, marginRight: 8 },
  metricTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#111827" },
  metricValue: { fontSize: 18, fontWeight: "700" },

  progressContainer: { marginBottom: 8 },
  progressTrack: {
    width: "100%",
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },

  metricNote: { color: PALETTE.neutralMuted, fontSize: 13 },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  infoEmoji: { fontSize: 22, marginRight: 10 },
  infoBody: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  infoText: { color: PALETTE.neutralMuted, marginTop: 4 },
});
