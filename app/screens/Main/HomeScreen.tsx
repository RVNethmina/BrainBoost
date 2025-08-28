// app/src/screens/HomeScreen.tsx
import { PALETTE } from "@/app/design/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Morning!</Text>
        <Text style={styles.subtitle}>Ready to exercise your brain?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Feature Cards */}
        <View style={styles.grid}>
          <TouchableOpacity
            onPress={() => navigation.navigate("BrainGames")}
            style={styles.card}
          >
            <Ionicons name={'extension-puzzle-outline' as any} size={32} color={PALETTE.red} style={styles.icon} />
            <Text style={styles.cardTitle}>Brain Games</Text>
            <Text style={styles.cardText}>Fun puzzles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Assessment")}
            style={styles.card}
          >
            <Ionicons name={'stats-chart-outline' as any} size={32} color={PALETTE.orange} style={styles.icon} />
            <Text style={styles.cardTitle}>Assessment</Text>
            <Text style={styles.cardText}>Test progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Progress")}
            style={styles.card}
          >
            <Ionicons name={'bar-chart-outline' as any} size={32} color={PALETTE.teal} style={styles.icon} />
            <Text style={styles.cardTitle}>Progress</Text>
            <Text style={styles.cardText}>View stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Insights")}
            style={styles.card}
          >
            <Ionicons name={'bulb-outline' as any} size={32} color={PALETTE.red} style={styles.icon} />
            <Text style={styles.cardTitle}>Insights</Text>
            <Text style={styles.cardText}>Learn more</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.footerBtn, { backgroundColor: "#FAD4D4" }]} 
            onPress={() => navigation.navigate("Reminder")}
          >
            <Text style={[styles.footerText, { color: "#D9534F" }]}>Reminders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.footerBtn, { backgroundColor: "#FEC84D" }]} 
            onPress={() => navigation.navigate("Settings")}
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
    backgroundColor: "#96B5B5", // light teal background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E3E", // darker teal
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#D9534F", // red like in screenshot
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  card: {
    width: "48%",
    paddingVertical: 25,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#E6F1F1", // light grey/teal card background
  },
  icon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E3E",
    marginBottom: 4,
    textAlign: "center",
  },
  cardText: {
    fontSize: 13,
    color: "#2C3E3E",
    opacity: 0.7,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
