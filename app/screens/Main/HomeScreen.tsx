// app/src/screens/HomeScreen.tsx
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

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header with Profile button */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text accessibilityRole={"header" as AccessibilityRole} style={styles.greeting}>
            Good Morning!
          </Text>
          <Text style={styles.subtitle}>Ready to exercise your brain?</Text>
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
          <Text style={styles.profileBtnText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Feature Cards */}
        <View style={styles.grid}>
          <TouchableOpacity
            onPress={() => navigation.navigate("BrainGames")}
            style={styles.card}
            accessibilityLabel="Open Brain Games"
            accessible
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={"extension-puzzle-outline" as any} size={40} color={PALETTE.red} style={styles.icon} />
            <Text style={styles.cardTitle}>Brain Games</Text>
            <Text style={styles.cardText}>Fun puzzles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Assessment")}
            style={styles.card}
            accessibilityLabel="Open Assessment"
            accessible
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={"stats-chart-outline" as any} size={40} color={PALETTE.orange} style={styles.icon} />
            <Text style={styles.cardTitle}>Assessment</Text>
            <Text style={styles.cardText}>Test progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Progress")}
            style={styles.card}
            accessibilityLabel="Open Progress"
            accessible
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={"bar-chart-outline" as any} size={40} color={PALETTE.teal} style={styles.icon} />
            <Text style={styles.cardTitle}>Progress</Text>
            <Text style={styles.cardText}>View stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Insights")}
            style={styles.card}
            accessibilityLabel="Open Insights"
            accessible
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={"bulb-outline" as any} size={40} color={PALETTE.red} style={styles.icon} />
            <Text style={styles.cardTitle}>Insights</Text>
            <Text style={styles.cardText}>Learn more</Text>
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
            <Text style={[styles.footerText, { color: "#D9534F" }]}>Reminders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerBtn, { backgroundColor: "#FEC84D" }]}
            onPress={() => navigation.navigate("Settings")}
            accessibilityLabel="Open settings"
            accessible
          >
            <Text style={[styles.footerText, { color: "#fff" }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#96B5B5", // keep your background
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
    fontSize: 12,
    marginTop: -4,
    color: "#2C3E3E",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2C3E3E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: "#D9534F",
  },
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
    backgroundColor: "#E6F1F1",
    minHeight: 140,
  },
  icon: {
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E3E",
    marginBottom: 6,
    textAlign: "center",
  },
  cardText: {
    fontSize: 15,
    color: "#2C3E3E",
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
    fontSize: 18,
    fontWeight: "700",
  },
});
