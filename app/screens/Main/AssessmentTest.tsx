// app/src/screens/AssessmentTest.tsx
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

// navigation type for the whole stack
type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

type AssessmentRoute = "MemoryTest" | "AttentionTest" | "MathAssessment" | "FullAssessment";

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
    screen: "AttentionTest",
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
    title: "Full Assessment",
    icon: "🎯",
    duration: "30 minutes",
    type: "Complete",
    screen: "FullAssessment",
    bgColor: PALETTE.lightTeal,
    textColor: PALETTE.teal,
  },
];

const AssessmentTest: React.FC = () => {
  const navigation = useNavigation<RootNavProp>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Assessment Tests</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose an assessment to test your skills</Text>

        <View style={styles.grid}>
          {assessments.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.card}
              onPress={() => navigation.navigate(a.screen as any)}
              accessibilityRole="button"
              accessibilityLabel={`${a.title}. ${a.duration}. ${a.type} test.`}
            >
              <Text style={styles.icon}>{a.icon}</Text>
              <Text style={styles.cardTitle}>{a.title}</Text>
              <Text style={styles.cardDesc}>{a.duration}</Text>

              <View style={[styles.badge, { backgroundColor: a.bgColor }]}>
                <Text style={[styles.badgeText, { color: a.textColor }]}>
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
    backgroundColor: "#96B5B5", // match BrainGames background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#96B5B5",
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    backgroundColor: "#E6F1F1",
    borderRadius: 12,
  },
  backIcon: {
    fontSize: 20,
    color: "#2C3E3E",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E3E",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    marginVertical: 16,
    textAlign: "center",
    color: "#2C3E3E",
    fontSize: 16,
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
    backgroundColor: "#E6F1F1",
    borderRadius: 12,
    alignItems: "center",
  },
  icon: {
    fontSize: 36,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#2C3E3E",
    marginBottom: 4,
  },
  cardDesc: {
    marginTop: 2,
    textAlign: "center",
    color: "#2C3E3E",
    opacity: 0.7,
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
