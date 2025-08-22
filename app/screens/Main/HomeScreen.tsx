// HomeScreen.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PALETTE = {
  red: "#F04F4E",
  teal: "#639D9D",
  lightTeal: "#92BABA",
  orange: "#F3A421",
  lightPink: "#FBD4D3",
  bg: "#a2c2c2ff", // c2e0e0ffsoft elderly-friendly background
};

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning!</Text>
        <Text style={styles.subtitle}>Ready to exercise your brain?</Text>
      </View>

      {/* Feature Cards */}
      <View style={styles.grid}>
        <TouchableOpacity style={[styles.card, { borderColor: PALETTE.lightPink }]}>
          <Ionicons name="extension-puzzle-outline" size={32} color={PALETTE.red} style={styles.icon} />
          <Text style={styles.cardTitle}>Brain Games</Text>
          <Text style={styles.cardText}>Fun puzzles</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderColor: PALETTE.lightPink }]}>
          <Ionicons name="stats-chart-outline" size={32} color={PALETTE.orange} style={styles.icon} />
          <Text style={styles.cardTitle}>Assessment</Text>
          <Text style={styles.cardText}>Test progress</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderColor: PALETTE.lightPink }]}>
          <Ionicons name="brain-outline" size={32} color={PALETTE.teal} style={styles.icon} />
          <Text style={styles.cardTitle}>Progress</Text>
          <Text style={styles.cardText}>View stats</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderColor: PALETTE.lightPink }]}>
          <Ionicons name="bulb-outline" size={32} color={PALETTE.red} style={styles.icon} />
          <Text style={styles.cardTitle}>Insights</Text>
          <Text style={styles.cardText}>Learn more</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerBtn, { backgroundColor: PALETTE.lightPink }]}>
          <Text style={[styles.footerText, { color: PALETTE.red }]}>Reminders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, { backgroundColor: PALETTE.orange }]}>
          <Text style={[styles.footerText, { color: "white" }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: PALETTE.bg,
    alignItems: "center",
    justifyContent: "center", // <-- centers vertically
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#497a7aff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: PALETTE.red,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  card: {
    width: "48%",
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
    alignItems: "center",
    backgroundColor: "#e7eceeff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  icon: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: PALETTE.teal,
  },
  cardText: {
    fontSize: 13,
    color: PALETTE.lightTeal,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  footerBtn: {
    flex: 1,
    padding: 16,
    marginHorizontal: 5,
    borderRadius: 15,
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
