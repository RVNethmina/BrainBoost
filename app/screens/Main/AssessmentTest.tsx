// app/src/screens/Main/AssessmentTest.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext";

type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

type AssessmentRoute = "MemoryTest" | "AttentionAssessmentIntro" | "MathAssessment" | "PuzzleAssessmentIntro";

type AssessmentItem = {
  id: number;
  title: string;
  icon: string;
  duration: string;
  type: string;
  screen: AssessmentRoute;
  bgColor: string;
  textColor: string;
};

const assessments: AssessmentItem[] = [
  {
    id: 1,
    title: "Memory Test",
    icon: "🧠",
    duration: "15 minutes",
    type: "Comprehensive",
    screen: "MemoryTest",
    bgColor: PALETTE.lightTeal,
    textColor: PALETTE.teal,
  },
  {
    id: 2,
    title: "Attention Test",
    icon: "⚡",
    duration: "10 minutes",
    type: "Focus",
    screen: "AttentionAssessmentIntro",
    bgColor: PALETTE.lightPink,
    textColor: PALETTE.orange,
  },
  {
    id: 3,
    title: "Math Assessment",
    icon: "🔢",
    duration: "12 minutes",
    type: "Numerical",
    screen: "MathAssessment",
    bgColor: PALETTE.lightPink,
    textColor: PALETTE.red,
  },
  {
    id: 4,
    title: "Puzzle Assessment",
    icon: "🎯",
    duration: "30 minutes",
    type: "Complete",
    screen: "PuzzleAssessmentIntro",
    bgColor: PALETTE.lightTeal,
    textColor: PALETTE.teal,
  },
];

const AssessmentTest: React.FC = () => {
  const navigation = useNavigation<RootNavProp>();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#96B5B5';
  const textColor = isDark ? '#fff' : '#2C3E3E';
  const cardBg = isDark ? '#2a2a2a' : '#E6F1F1';
  const backButtonBg = isDark ? '#3a3a3a' : '#E6F1F1';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: backButtonBg }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={[styles.backIcon, { fontSize: 20 * fontScale, color: textColor }]}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: 20 * fontScale, color: textColor }]}>
          Assessment Tests
        </Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { fontSize: 16 * fontScale, color: textColor }]}>
          Choose an assessment to test your skills
        </Text>

        <View style={styles.grid}>
          {assessments.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[styles.card, { backgroundColor: cardBg }]}
              onPress={() => navigation.navigate(a.screen as any)}
              accessibilityRole="button"
              accessibilityLabel={`${a.title}. ${a.duration}. ${a.type} test.`}
            >
              <Text style={styles.icon}>{a.icon}</Text>
              <Text style={[styles.cardTitle, { fontSize: 16 * fontScale, color: textColor }]}>
                {a.title}
              </Text>
              <Text style={[styles.cardDesc, { fontSize: 13 * fontScale, color: textColor }]}>
                {a.duration}
              </Text>

              <View style={[styles.badge, { backgroundColor: a.bgColor }]}>
                <Text style={[styles.badgeText, { fontSize: 12 * fontScale, color: a.textColor }]}>
                  {a.type}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssessmentTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  backIcon: {},
  headerTitle: {
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    marginVertical: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  card: {
    width: "48%",
    marginBottom: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  icon: {
    fontSize: 36,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  cardDesc: {
    marginTop: 2,
    textAlign: "center",
    opacity: 0.7,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 12,
  },
  badgeText: {
    fontWeight: "600",
  },
});