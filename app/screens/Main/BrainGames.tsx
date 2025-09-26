// app/src/screens/BrainGames.tsx
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type BrainGamesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BrainGames"
>;

type Game = {
  id: number;
  title: string;
  icon: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  // we cast strings to route keys at runtime; see navigate(...) below
  screen: string;
};

const games: Game[] = [
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
    title: "Attention Trainer",
    icon: "🎯",
    description: "Focus exercises",
    difficulty: "Easy",
    screen: "AttentionResults", // use a route that exists in your stack — adjust if needed
  },
  {
    id: 4,
    title: "Logic Puzzle",
    icon: "🧩",
    description: "Solve simple puzzles",
    difficulty: "Hard",
    screen: "PuzzleQuiz", // Changed from "MemoryQuiz" to "PuzzleQuiz"
  },
];

const difficultyColorMap: Record<string, { bg: string; text: string }> = {
  Easy: { bg: "#96B5B5", text: "#2C3E3E" },
  Medium: { bg: "#FEC84D", text: "#fff" },
  Hard: { bg: "#D9534F", text: "#fff" },
};

export default function BrainGames() {
  const navigation = useNavigation<BrainGamesScreenNavigationProp>();

  const handleNavigate = (screenName: string) => {
    // TypeScript nav overloads are strict about literal route names.
    // We cast to `any` here to satisfy the navigator while keeping runtime safety:
    navigation.navigate(screenName as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Brain Games</Text>

        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose a game to train your brain</Text>

        {/* Use single-column full-width cards for easier tapping */}
        <View style={styles.list}>
          {games.map((game) => {
            const difficulty = difficultyColorMap[game.difficulty] || difficultyColorMap.Easy;
            return (
              <TouchableOpacity
                key={game.id}
                style={styles.card}
                onPress={() => handleNavigate(game.screen)}
                accessibilityRole="button"
                accessibilityLabel={`${game.title}. ${game.description}. Difficulty: ${game.difficulty}`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.iconCircle, { borderColor: difficulty.bg + "33" }]}>
                    <Text style={styles.icon}>{game.icon}</Text>
                  </View>

                  <View style={styles.textWrap}>
                    <Text style={styles.cardTitle}>{game.title}</Text>
                    <Text style={styles.cardDesc}>{game.description}</Text>
                  </View>
                </View>

                <View style={[styles.badge, { backgroundColor: difficulty.bg }]}>
                  <Text style={[styles.badgeText, { color: difficulty.text }]}>{game.difficulty}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#96B5B5", // keep your color
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 18 : 12,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E6F1F1",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 20, color: "#2C3E3E" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#2C3E3E" },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#2C3E3E",
    marginVertical: 8,
    opacity: 0.9,
  },

  list: {
    marginTop: 8,
  },

  card: {
    width: "100%",
    backgroundColor: "#E6F1F1",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // subtle elevation/shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 92,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  icon: { fontSize: 32 },

  textWrap: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#2C3E3E", marginBottom: 6 },
  cardDesc: { fontSize: 14, color: "#2C3E3E", opacity: 0.85 },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "center",
    marginLeft: 6,
  },
  badgeText: { fontSize: 14, fontWeight: "700" },
});