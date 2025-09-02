// app/src/screens/BrainGames.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type BrainGamesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BrainGames"
>;

const BrainGames = () => {
  const navigation = useNavigation<BrainGamesScreenNavigationProp>();

  const games = [
    {
      id: 1,
      title: "Memory Match",
      icon: "🧩",
      description: "Find matching pairs",
      difficulty: "Easy",
      screen: "MemoryQuiz",
    },
    {
      id: 2,
      title: "Math Quiz",
      icon: "🧮",
      description: "Number challenges",
      difficulty: "Medium",
      screen: "MathQuiz",
    },
    {
      id: 3,
      title: "Attention",
      icon: "🎯",
      description: "Focus training",
      difficulty: "Easy",
      screen: "AttentionGame",
    },
    {
      id: 4,
      title: "Puzzle",
      icon: "🧩",
      description: "Logic problems",
      difficulty: "Hard",
      screen: "PuzzleGame",
    },
  ];

  // Map difficulty to consistent colors
  const difficultyColorMap: Record<
    string,
    { bg: string; text: string }
  > = {
    Easy: { bg: "#96B5B5", text: "#2C3E3E" }, // home page teal theme
    Medium: { bg: "#FEC84D", text: "#fff" }, // home page orange
    Hard: { bg: "#D9534F", text: "#fff" }, // home page red
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Brain Games</Text>

        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose a game to train your brain</Text>

        <View style={styles.grid}>
          {games.map((game) => {
            const difficulty = difficultyColorMap[game.difficulty];
            return (
              <TouchableOpacity
                key={game.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate(game.screen as keyof RootStackParamList)
                }
                accessibilityRole="button"
              >
                <Text style={styles.icon}>{game.icon}</Text>
                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardDesc}>{game.description}</Text>

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: difficulty.bg },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: difficulty.text }]}>
                    {game.difficulty}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default BrainGames;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#96B5B5" // Changed to match home page background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60, // Increased from 40
    paddingBottom: 20, // Increased from 12
    backgroundColor: "#96B5B5", // Match home page background
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    backgroundColor: "#E6F1F1", // Light teal to match home page cards
    borderRadius: 12,
  },
  backIcon: { 
    fontSize: 20, 
    color: "#2C3E3E" // Dark teal to match home page text
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#2C3E3E" // Changed to match home page text color
  },
  scroll: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 20 // Added top padding
  },
  subtitle: {
    marginVertical: 16,
    textAlign: "center",
    color: "#2C3E3E", // Changed to match home page text
    fontSize: 16,
    opacity: 0.8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20, // Added top margin
  },
  card: {
    width: "48%",
    marginBottom: 16,
    padding: 18,
    backgroundColor: "#E6F1F1", // Match home page card background
    borderRadius: 12, // Match home page card radius
    alignItems: "center",
  },
  icon: { 
    fontSize: 36, 
    marginBottom: 10 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "600", // Changed from 700 to match home page
    textAlign: "center", 
    color: "#2C3E3E" // Match home page text
  },
  cardDesc: { 
    marginTop: 4, // Reduced from 6
    textAlign: "center", 
    color: "#2C3E3E", // Match home page text
    opacity: 0.7,
    fontSize: 13 // Match home page card text size
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 12,
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: "600" 
  },
});