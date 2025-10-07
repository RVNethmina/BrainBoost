// app/src/screens/Assessments/MathAssessment.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { saveAssessment } from "@/app/services/MathAssessmentService";
import { AssessmentResultPayload } from "@/app/types/assessment"; // <-- use the shared type
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

type NavProp = NativeStackNavigationProp<RootStackParamList, "MathAssessment">;

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  category: "arithmetic" | "memory" | "logic" | "time";
}

const STORAGE_KEY = "math_assessment_inprogress_v1";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MathAssessment: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [restored, setRestored] = useState(false);

  const jumpRef = useRef<ScrollView | null>(null);

  const questions: Question[] = [
    {
      id: 1,
      question: "What is 15 + 8?",
      options: ["21", "23", "25", "27"],
      correctAnswer: 1,
      difficulty: "easy",
      category: "arithmetic",
    },
    {
      id: 2,
      question: "What is 25 - 7?",
      options: ["16", "17", "18", "19"],
      correctAnswer: 2,
      difficulty: "easy",
      category: "arithmetic",
    },
    {
      id: 3,
      question: "What is 6 × 4?",
      options: ["22", "24", "26", "28"],
      correctAnswer: 1,
      difficulty: "easy",
      category: "arithmetic",
    },
    {
      id: 4,
      question:
        "If you buy items costing $3.50 and $2.25, how much change do you get from $10?",
      options: ["$4.25", "$4.50", "$4.75", "$5.00"],
      correctAnswer: 0,
      difficulty: "medium",
      category: "arithmetic",
    },
    {
      id: 5,
      question:
        "A medication costs $15.60 for a 30-day supply. How much does it cost per day?",
      options: ["$0.50", "$0.52", "$0.55", "$0.60"],
      correctAnswer: 1,
      difficulty: "medium",
      category: "arithmetic",
    },
    {
      id: 6,
      question: "If it's 2:30 PM now, what time will it be in 45 minutes?",
      options: ["3:15 PM", "3:30 PM", "3:45 PM", "4:00 PM"],
      correctAnswer: 0,
      difficulty: "medium",
      category: "time",
    },
    {
      id: 7,
      question: "How many days are there in 3 weeks?",
      options: ["19", "20", "21", "22"],
      correctAnswer: 2,
      difficulty: "easy",
      category: "time",
    },
    {
      id: 8,
      question: "Complete the pattern: 2, 4, 6, 8, ?",
      options: ["9", "10", "11", "12"],
      correctAnswer: 1,
      difficulty: "easy",
      category: "logic",
    },
    {
      id: 9,
      question: "If 3 apples cost $1.50, how much do 5 apples cost?",
      options: ["$2.00", "$2.25", "$2.50", "$2.75"],
      correctAnswer: 2,
      difficulty: "medium",
      category: "arithmetic",
    },
    {
      id: 10,
      question:
        "Remember this sequence: 5, 12, 8. Now, what comes next if the pattern is +7, -4, +7, -4...?",
      options: ["15", "12", "4", "11"],
      correctAnswer: 0,
      difficulty: "hard",
      category: "memory",
    },
  ];

  useEffect(() => {
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && saved.selectedAnswers) {
            Alert.alert(
              "Resume Assessment?",
              "We found an in-progress assessment. Do you want to continue?",
              [
                {
                  text: "No",
                  onPress: async () => {
                    await AsyncStorage.removeItem(STORAGE_KEY);
                    setRestored(true);
                  },
                  style: "destructive",
                },
                {
                  text: "Yes",
                  onPress: () => {
                    setSelectedAnswers(saved.selectedAnswers || {});
                    setCurrentQuestion(saved.currentQuestion || 0);
                    setStartTime(
                      saved.startTime ? new Date(saved.startTime) : new Date()
                    );
                    setAssessmentStarted(true);
                    setRestored(true);
                  },
                },
              ],
              { cancelable: false }
            );
            return;
          }
        }
      } catch (e) {
        console.warn("Restore failed", e);
      }
      setRestored(true);
    };
    restore();
  }, []);

  // persist progress
  useEffect(() => {
    if (!assessmentStarted) return;
    const save = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            selectedAnswers,
            currentQuestion,
            startTime: startTime
              ? startTime.toISOString()
              : new Date().toISOString(),
            savedAt: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.warn("Save failed", e);
      }
    };
    save();
  }, [selectedAnswers, currentQuestion, assessmentStarted, startTime]);

  useEffect(() => {
    // auto-scroll jump bar
    const buttonWidth = 64;
    const gap = 10;
    const totalWidth = questions.length * (buttonWidth + gap);
    const centerOffset = Math.max(0, SCREEN_WIDTH / 2 - buttonWidth / 2);
    const maxScroll = Math.max(0, totalWidth - SCREEN_WIDTH + 24);
    const targetX = Math.max(
      0,
      Math.min(maxScroll, currentQuestion * (buttonWidth + gap) - centerOffset)
    );
    try {
      jumpRef.current?.scrollTo({ x: targetX, animated: true });
    } catch (_) {
      try {
        jumpRef.current?.scrollToEnd({ animated: true });
      } catch {}
    }
  }, [currentQuestion]);

  const startAssessment = () => {
    setAssessmentStarted(true);
    setStartTime(new Date());
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: answerIndex,
    }));
  };

  const goPrev = () => {
    if (currentQuestion === 0) return;
    setCurrentQuestion((c) => c - 1);
  };
  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
    } else {
      Alert.alert(
        "Submit",
        "Submit your answers? You will not be able to change them after submission.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit", onPress: finishAssessment },
        ]
      );
    }
  };
  const jumpToQuestion = (idx: number) => setCurrentQuestion(idx);

  // NOTE: We use the shared type here (imported). completedAt is a string (ISO).
  const calculateResults = (): AssessmentResultPayload => {
    let correctAnswers = 0;
    const answers = questions.map((q) => {
      const sel = selectedAnswers[q.id];
      const isCorrect = sel === q.correctAnswer;
      if (isCorrect) correctAnswers++;
      return { questionId: q.id, selectedAnswer: sel ?? -1, isCorrect };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeSpent = startTime
      ? Math.round((Date.now() - startTime.getTime()) / 1000)
      : 0;
    let cognitiveLevel: AssessmentResultPayload["cognitiveLevel"] =
      "needs_attention";
    if (score >= 90) cognitiveLevel = "excellent";
    else if (score >= 75) cognitiveLevel = "good";
    else if (score >= 60) cognitiveLevel = "fair";

    return {
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers: questions.length - correctAnswers,
      score,
      timeSpent,
      difficulty: "mixed",
      answers,
      completedAt: new Date().toISOString(), // <-- ISO string (matches shared type)
      cognitiveLevel,
    };
  };

  const computeDomainStats = () => {
    const stats: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q) => {
      if (!stats[q.category]) stats[q.category] = { correct: 0, total: 0 };
      stats[q.category].total++;
      const sel = selectedAnswers[q.id];
      if (sel === q.correctAnswer) stats[q.category].correct++;
    });
    return Object.entries(stats).map(([category, val]) => ({
      category,
      correct: val.correct,
      total: val.total,
      percent: Math.round((val.correct / Math.max(1, val.total)) * 100),
    }));
  };

  // inside finishAssessment() in MathAssessment.tsx
  const finishAssessment = async () => {
    const results = calculateResults(); // results.completedAt is an ISO string

    setIsLoading(true);

    // Convert completedAt (ISO string) back to a Date for the service
    const servicePayload = {
      ...results,
      assessmentType: "cognitive_math_elderly",
      // if you have voice metrics, include them here
      // voiceAnswersCount: 0,
      // avgVoiceResponseMs: 0,
      // convert completedAt to Date to satisfy the service's type
      completedAt: new Date(results.completedAt),
    };

    try {
      const res = await saveAssessment(servicePayload); // now matches the expected type
      if (res.success) {
        try {
          await AsyncStorage.removeItem(STORAGE_KEY);
        } catch {}
        navigation.replace(
          "MathAssessmentResult" ,
          { results, savedId: res.id } 
        );
      } else {
        Alert.alert(
          "Save failed",
          "Could not save assessment. Showing results locally."
        );
        navigation.navigate(
          "MathAssessmentResult" as any,
          { results, savedId: null } as any
        );
      }
    } catch (err) {
      console.error("finishAssessment error", err);
      Alert.alert(
        "Error",
        "Failed to save assessment. Showing results locally."
      );
      navigation.navigate(
        "MathAssessmentResult" as any,
        { results, savedId: null } as any
      );
    } finally {
      setIsLoading(false);
      setShowResults(true);
    }
  };

  const resetAssessment = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAssessmentStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setStartTime(null);
  };

  const exitAssessment = async () => {
    Alert.alert("Exit", "Exit and save progress so you can resume later?", [
      { text: "Cancel", style: "cancel" },
      { text: "Exit", onPress: () => setAssessmentStarted(false) },
    ]);
  };

  const getCognitiveBadge = (level: string) => {
    switch (level) {
      case "excellent":
        return {
          label: "Excellent",
          color: PALETTE.green,
          text: "Outstanding — keep it up!",
        };
      case "good":
        return {
          label: "Good",
          color: PALETTE.blue,
          text: "Good performance — practice regularly.",
        };
      case "fair":
        return {
          label: "Fair",
          color: PALETTE.orange,
          text: "Fair — moderate practice recommended.",
        };
      case "needs_attention":
        return {
          label: "Needs Attention",
          color: PALETTE.red,
          text: "Consider follow-up or extra practice.",
        };
      default:
        return { label: "Unknown", color: PALETTE.neutralMuted, text: "" };
    }
  };

  // question screen
  const question = questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backSmall, { color: PALETTE.teal }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.progressText, { color: PALETTE.neutralDark }]}>
          Question {currentQuestion + 1} / {questions.length}
        </Text>
        <TouchableOpacity onPress={exitAssessment}>
          <Text style={[styles.exitText, { color: PALETTE.red }]}>Exit</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.progressBar, { backgroundColor: PALETTE.lightTeal }]}
      >
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: PALETTE.purple },
          ]}
        />
      </View>

      <ScrollView
        horizontal
        ref={jumpRef as any}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.jumpBar, { paddingRight: 28 }]}
      >
        {questions.map((q, idx) => {
          const answered = selectedAnswers[q.id] !== undefined;
          const active = idx === currentQuestion;
          return (
            <TouchableOpacity
              key={q.id}
              onPress={() => jumpToQuestion(idx)}
              accessibilityLabel={`Jump to question ${idx + 1}`}
              style={[
                styles.jumpBtn,
                active ? styles.jumpBtnActive : null,
                answered ? styles.jumpBtnAnswered : null,
              ]}
            >
              <Text
                style={[
                  styles.jumpBtnText,
                  active ? styles.jumpBtnTextActive : null,
                ]}
              >
                {idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.questionWrap}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={[styles.category, { color: PALETTE.purple }]}>
            {question.category.toUpperCase()}
          </Text>
          <Text style={[styles.questionText, { fontSize: 22 }]}>
            {question.question}
          </Text>

          <View style={{ marginTop: 12 }}>
            {question.options.map((opt, i) => {
              const selected = selectedAnswers[question.id] === i;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleAnswerSelect(i)}
                  style={[
                    styles.option,
                    selected ? styles.optionSelected : null,
                    { borderColor: selected ? PALETTE.purple : undefined },
                  ]}
                  accessibilityLabel={`Option ${i + 1}: ${opt}`}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected ? styles.optionTextSelected : null,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={goPrev}
            disabled={currentQuestion === 0}
            style={[
              styles.navBtn,
              currentQuestion === 0 ? styles.navDisabled : null,
            ]}
          >
            <Text
              style={[
                styles.navBtnText,
                currentQuestion === 0 ? styles.navDisabledText : null,
              ]}
            >
              ← Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goNext}
            disabled={selectedAnswers[question.id] === undefined}
            style={[
              styles.navBtn,
              selectedAnswers[question.id] === undefined
                ? styles.navDisabled
                : null,
            ]}
          >
            <Text
              style={[
                styles.navBtnText,
                selectedAnswers[question.id] === undefined
                  ? styles.navDisabledText
                  : null,
              ]}
            >
              {currentQuestion === questions.length - 1 ? "Finish" : "Next →"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MathAssessment;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FAFC" },
  topRow: { paddingHorizontal: 12, paddingTop: 12, alignItems: "flex-start" },
  backBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  backBtnText: { fontWeight: "700", fontSize: 16 },
  welcomeContent: { padding: 24, alignItems: "center" },
  bigTitle: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  largeSubtitle: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  welcomeCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
    elevation: 3,
  },
  welcomeCardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  welcomeLine: { fontSize: 16, color: "#475569", marginVertical: 2 },
  startButton: {
    marginTop: 8,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: "100%",
  },
  startButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
  },
  smallAction: { marginTop: 10 },
  smallActionText: { textDecorationLine: "underline" },
  headerRow: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: { fontSize: 16, fontWeight: "700" },
  backSmall: { fontWeight: "700" },
  exitText: { fontSize: 14, fontWeight: "700" },
  progressBar: {
    height: 8,
    marginHorizontal: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%" },
  jumpBar: { paddingVertical: 12, paddingHorizontal: 12, alignItems: "center" },
  jumpBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  jumpBtnActive: { backgroundColor: PALETTE.purple },
  jumpBtnAnswered: { borderWidth: 2, borderColor: PALETTE.green },
  jumpBtnText: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  jumpBtnTextActive: { color: "#fff" },
  questionWrap: { padding: 16, paddingBottom: 36 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  category: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "700",
    marginBottom: 12,
    backgroundColor: "#EEF2FF",
  },
  questionText: {
    fontSize: 20,
    color: "#0f172a",
    lineHeight: 28,
    marginBottom: 8,
  },
  option: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    marginVertical: 8,
  },
  optionSelected: { backgroundColor: "#F0F9FF", borderColor: PALETTE.purple },
  optionText: { textAlign: "center", fontSize: 18, color: "#0f172a" },
  optionTextSelected: { fontWeight: "800" },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  navBtn: {
    flex: 1,
    backgroundColor: PALETTE.purple,
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 8,
    alignItems: "center",
  },
  navBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  navDisabled: { backgroundColor: "#cbd5e1" },
  navDisabledText: { color: "#475569" },
  resultsContent: { padding: 24, alignItems: "center" },
  resultsTitle: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  badgeBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 12,
  },
  badgeLabel: { fontSize: 18, fontWeight: "900" },
  badgeScore: { fontSize: 40, fontWeight: "900", marginTop: 6 },
  badgeMsg: { marginTop: 8, textAlign: "center", fontSize: 15 },
  domainGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },
  domainCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  domainTitle: { fontWeight: "800", marginBottom: 6 },
  domainPercent: { fontSize: 22, fontWeight: "900" },
  domainBar: {
    height: 8,
    backgroundColor: "#EEF2FF",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 8,
  },
  domainFill: { height: "100%" },
  domainSmall: { marginTop: 6, color: "#475569" },
  resultNavRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  resultNavBtn: {
    backgroundColor: PALETTE.green,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 140,
    alignItems: "center",
  },
  resultNavBtnAlt: {
    backgroundColor: PALETTE.purple,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 140,
    alignItems: "center",
  },
  resultNavText: { color: "#fff", fontWeight: "800" },
  resultNavTextAlt: { color: "#fff", fontWeight: "800" },
  retakeBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retakeText: { color: "#fff", fontWeight: "800" },
});
