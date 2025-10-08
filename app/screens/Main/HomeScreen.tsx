// app/src/screens/Main/HomeScreen.tsx
import { PALETTE } from "@/app/design/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  AccessibilityRole,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext";

export default function HomeScreen({ navigation }: any) {
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#96B5B5';
  const textColor = isDark ? '#fff' : '#2C3E3E';
  const cardBg = isDark ? '#2a2a2a' : '#E6F1F1';
  const subtitleColor = isDark ? '#ff6b6b' : '#D9534F';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header with Profile button */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text 
            accessibilityRole={"header" as AccessibilityRole}
            style={[styles.greeting, { fontSize: 30 * fontScale, color: textColor }]}
          >
            Good Morning!
          </Text>
          <Text style={[styles.subtitle, { fontSize: 18 * fontScale, color: subtitleColor }]}>
            Ready to exercise your brain?
          </Text>
        </View>

        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => navigation.navigate("Profile")}
          style={styles.profileBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="person-circle-outline" size={48} color={PALETTE.teal} />
          <Text style={[styles.profileBtnText, { fontSize: 12 * fontScale, color: textColor }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Feature Cards */}
        <View style={styles.grid}>
          <TouchableOpacity
            onPress={() => navigation.navigate("BrainGames")}
            style={[styles.card, { backgroundColor: cardBg }]}
            accessibilityLabel="Open Brain Games"
            accessible
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={"extension-puzzle-outline" as any} size={40} color={PALETTE.red} style={styles.icon} />
            <Text style={[styles.cardTitle, { fontSize: 18 * fontScale, color: textColor }]}>
              Brain Games
            </Text>
            <Text style={[styles.cardText, { fontSize: 15 * fontScale, color: textColor }]}>
              Fun puzzles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Assessment")}
            style={[styles.card, { backgroundColor: cardBg }]}
            accessibilityLabel="Open Assessment"
            accessible
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={"stats-chart-outline" as any} size={40} color={PALETTE.orange} style={styles.icon} />
            <Text style={[styles.cardTitle, { fontSize: 18 * fontScale, color: textColor }]}>
              Assessment
            </Text>
            <Text style={[styles.cardText, { fontSize: 15 * fontScale, color: textColor }]}>
              Test progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Progress")}
            style={[styles.card, { backgroundColor: cardBg }]}
            accessibilityLabel="Open Progress"
            accessible
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={"bar-chart-outline" as any} size={40} color={PALETTE.teal} style={styles.icon} />
            <Text style={[styles.cardTitle, { fontSize: 18 * fontScale, color: textColor }]}>
              Progress
            </Text>
            <Text style={[styles.cardText, { fontSize: 15 * fontScale, color: textColor }]}>
              View stats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Insights")}
            style={[styles.card, { backgroundColor: cardBg }]}
            accessibilityLabel="Open Insights"
            accessible
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={"bulb-outline" as any} size={40} color={PALETTE.red} style={styles.icon} />
            <Text style={[styles.cardTitle, { fontSize: 18 * fontScale, color: textColor }]}>
              Insights
            </Text>
            <Text style={[styles.cardText, { fontSize: 15 * fontScale, color: textColor }]}>
              Learn more
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerBtn, { backgroundColor: "#FAD4D4" }]}
            onPress={() => navigation.navigate("Reminder")}
            accessibilityLabel="Open reminders"
            accessible
          >
            <Text style={[styles.footerText, { fontSize: 18 * fontScale, color: "#D9534F" }]}>
              Reminders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerBtn, { backgroundColor: "#FEC84D" }]}
            onPress={() => navigation.navigate("Settings")}
            accessibilityLabel="Open settings"
            accessible
          >
            <Text style={[styles.footerText, { fontSize: 18 * fontScale, color: "#fff" }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "flex-start",
    paddingRight: 10,
  },
  profileBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  profileBtnText: {
    marginTop: -4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {},
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 50,
    marginTop: 24,
  },
  card: {
    width: "48%",
    paddingVertical: 28,
    borderRadius: 14,
    marginBottom: 18,
    alignItems: "center",
    minHeight: 140,
  },
  icon: {
    marginBottom: 14,
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  cardText: {
    opacity: 0.8,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingHorizontal: 5,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 18,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontWeight: "700",
  },
});