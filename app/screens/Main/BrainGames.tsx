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
      screen: "MemoryMatch",
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

  // Map difficulty to palette colors (bg + text)
  const difficultyColorMap: Record<
    string,
    { bg: string; text: string; border?: string }
  > = {
    Easy: { bg: PALETTE.lightTeal, text: PALETTE.teal },
    Medium: { bg: PALETTE.orange, text: PALETTE.neutralLight },
    Hard: { bg: PALETTE.red, text: PALETTE.neutralLight },
    Default: { bg: PALETTE.lightPink, text: PALETTE.neutralDark },
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PALETTE.lightTeal }]}>
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
            const difficulty =
              difficultyColorMap[game.difficulty] || difficultyColorMap.Default;
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
                    { backgroundColor: difficulty.bg, borderColor: difficulty.border || "transparent" },
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
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  backIcon: { fontSize: 20 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  scroll: { flex: 1, paddingHorizontal: 20 },
  subtitle: {
    marginVertical: 16,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 16,
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    // subtle shadow (iOS/Android differences)
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    alignItems: "center",
  },
  icon: { fontSize: 36, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", color: "#111827" },
  cardDesc: { marginTop: 6, textAlign: "center", color: "#6B7280" },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
});
