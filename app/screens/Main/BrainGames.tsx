// app/src/screens/Main/BrainGames.tsx
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
import { useSettings } from "@/app/contexts/SettingsContext";

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
    screen: "AttentionGame", 
  },
  {
    id: 4,
    title: "Logic Puzzle",
    icon: "🧩",
    description: "Solve simple puzzles",
    difficulty: "Hard",
    screen: "PuzzleQuiz",
  },
];

const difficultyColorMap: Record<string, { bg: string; text: string }> = {
  Easy: { bg: "#96B5B5", text: "#2C3E3E" },
  Medium: { bg: "#FEC84D", text: "#fff" },
  Hard: { bg: "#D9534F", text: "#fff" },
};

export default function BrainGames() {
  const navigation = useNavigation<BrainGamesScreenNavigationProp>();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#96B5B5';
  const textColor = isDark ? '#fff' : '#2C3E3E';
  const cardBg = isDark ? '#2a2a2a' : '#E6F1F1';
  const backButtonBg = isDark ? '#3a3a3a' : '#E6F1F1';

  const handleNavigate = (screenName: string) => {
    navigation.navigate(screenName as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: backButtonBg }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.backIcon, { fontSize: 20 * fontScale, color: textColor }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: 22 * fontScale, color: textColor }]}>
          Brain Games
        </Text>

        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { fontSize: 20 * fontScale, color: textColor }]}>
          Choose a game to train your brain
        </Text>

        <View style={styles.list}>
          {games.map((game) => {
            const difficulty = difficultyColorMap[game.difficulty] || difficultyColorMap.Easy;
            return (
              <TouchableOpacity
                key={game.id}
                style={[styles.card, { backgroundColor: cardBg }]}
                onPress={() => handleNavigate(game.screen)}
                accessibilityRole="button"
                accessibilityLabel={`${game.title}. ${game.description}. Difficulty: ${game.difficulty}`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.cardLeft}>
                  <View style={[
                    styles.iconCircle, 
                    { 
                      borderColor: difficulty.bg + "33",
                      backgroundColor: isDark ? '#3a3a3a' : '#fff'
                    }
                  ]}>
                    <Text style={styles.icon}>{game.icon}</Text>
                  </View>

                  <View style={styles.textWrap}>
                    <Text style={[styles.cardTitle, { fontSize: 18 * fontScale, color: textColor }]}>
                      {game.title}
                    </Text>
                    <Text style={[styles.cardDesc, { fontSize: 14 * fontScale, color: textColor }]}>
                      {game.description}
                    </Text>
                  </View>
                </View>

                <View style={[styles.badge, { backgroundColor: difficulty.bg }]}>
                  <Text style={[styles.badgeText, { fontSize: 14 * fontScale, color: difficulty.text }]}>
                    {game.difficulty}
                  </Text>
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
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontWeight: "600" },
  headerTitle: { fontWeight: "800" },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 8,
  },
  subtitle: {
    textAlign: "center",
    marginVertical: 8,
    opacity: 0.9,
  },

  list: {
    marginTop: 8,
  },

  card: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  icon: { fontSize: 32 },

  textWrap: { flex: 1 },
  cardTitle: { fontWeight: "800", marginBottom: 6 },
  cardDesc: { opacity: 0.85 },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "center",
    marginLeft: 6,
  },
  badgeText: { fontWeight: "700" },
});