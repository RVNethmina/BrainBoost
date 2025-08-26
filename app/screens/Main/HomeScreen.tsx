// app/src/screens/HomeScreen.tsx
import { PALETTE } from "@/app/design/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header with Profile */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning!</Text>
          <Text style={styles.subtitle}>Ready to exercise your brain?</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name={'person-outline' as any} size={24} color={PALETTE.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Feature Cards */}
        <View style={styles.grid}>
          <TouchableOpacity
            onPress={() => navigation.navigate("BrainGames")}
            style={[styles.card, { borderColor: PALETTE.lightTeal }]}
          >
            <Ionicons name={'extension-puzzle-outline' as any} size={32} color={PALETTE.teal} style={styles.icon} />
            <Text style={styles.cardTitle}>Brain Games</Text>
            <Text style={styles.cardText}>Fun puzzles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Assessment")}
            style={[styles.card, { borderColor: PALETTE.lightTeal }]}
          >
            <Ionicons name={'stats-chart-outline' as any} size={32} color={PALETTE.teal} style={styles.icon} />
            <Text style={styles.cardTitle}>Assessment</Text>
            <Text style={styles.cardText}>Test progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Progress")}
            style={[styles.card, { borderColor: PALETTE.lightTeal }]}
          >
            <Ionicons name={'bar-chart-outline' as any} size={32} color={PALETTE.teal} style={styles.icon} />
            <Text style={styles.cardTitle}>Progress</Text>
            <Text style={styles.cardText}>View stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Insights")}
            style={[styles.card, { borderColor: PALETTE.lightTeal }]}
          >
            <Ionicons name={'bulb-outline' as any} size={32} color={PALETTE.teal} style={styles.icon} />
            <Text style={styles.cardTitle}>Insights</Text>
            <Text style={styles.cardText}>Learn more</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.footerBtn, { backgroundColor: PALETTE.lightPink }]} 
            onPress={() => navigation.navigate("Reminder")}
          >
            <Ionicons name={'alarm-outline' as any} size={20} color={PALETTE.red} style={styles.footerIcon} />
            <Text style={[styles.footerText, { color: PALETTE.red }]}>Reminders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.footerBtn, { backgroundColor: PALETTE.lightTeal }]} 
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name={'settings-outline' as any} size={20} color={PALETTE.teal} style={styles.footerIcon} />
            <Text style={[styles.footerText, { color: PALETTE.teal }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: PALETTE.lightPink,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: PALETTE.teal,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: PALETTE.teal,
    opacity: 0.8,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALETTE.lightTeal,
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  card: {
    width: "48%",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: PALETTE.teal,
    marginBottom: 4,
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    color: PALETTE.teal,
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
    flexDirection: "row",
    padding: 16,
    marginHorizontal: 5,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  footerIcon: {
    marginRight: 8,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
  },
});