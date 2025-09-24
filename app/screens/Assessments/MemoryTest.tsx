// app/src/screens/Games/MemoryMatch/MemoryTest.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { firestore } from '@/config/firebaseConfig';
import { NotificationService } from '@/config/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView as RNScrollView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'pattern' | 'sequence' | 'visual' | 'spatial' | 'recall';
  type: 'multiple_choice' | 'sequence' | 'visual_memory';
}

interface AssessmentResult {
  userId?: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  timeSpent: number;
  difficulty: string;
  answers: { questionId: number; selectedAnswer: number; isCorrect: boolean }[];
  completedAt: Date;
  cognitiveLevel: 'excellent' | 'good' | 'fair' | 'needs_attention';
  memoryCategories: {
    pattern: { correct: number; total: number };
    sequence: { correct: number; total: number };
    visual: { correct: number; total: number };
    spatial: { correct: number; total: number };
    recall: { correct: number; total: number };
  };
}

const STORAGE_KEY = 'memory_assessment_inprogress_v1';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MemoryTest: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [restored, setRestored] = useState(false);

  // Horizontal jump bar ref
  const jumpRef = useRef<RNScrollView | null>(null);

  const questions: Question[] = [
    { 
      id: 1, 
      question: 'Look at this pattern: 🔴 🔵 🔴 🔵 ___. What comes next?', 
      options: ['🔴', '🔵', '🟡', '🟢'], 
      correctAnswer: 0, 
      difficulty: 'easy', 
      category: 'pattern',
      type: 'multiple_choice'
    },
    { 
      id: 2, 
      question: 'Remember this sequence: 7, 3, 9, 1. Which number was third?', 
      options: ['7', '3', '9', '1'], 
      correctAnswer: 2, 
      difficulty: 'easy', 
      category: 'sequence',
      type: 'multiple_choice'
    },
    { 
      id: 3, 
      question: 'Which shape was shown first in this sequence: ⭐ 🔺 ⬜?', 
      options: ['⭐', '🔺', '⬜', 'None'], 
      correctAnswer: 0, 
      difficulty: 'easy', 
      category: 'visual',
      type: 'multiple_choice'
    },
    { 
      id: 4, 
      question: 'Study these items: 🍎 🚗 📚 ⚽. How many items were there?', 
      options: ['3', '4', '5', '6'], 
      correctAnswer: 1, 
      difficulty: 'medium', 
      category: 'recall',
      type: 'multiple_choice'
    },
    { 
      id: 5, 
      question: 'Complete the number sequence: 2, 4, 6, 8, ___', 
      options: ['9', '10', '11', '12'], 
      correctAnswer: 1, 
      difficulty: 'medium', 
      category: 'sequence',
      type: 'multiple_choice'
    },
    { 
      id: 6, 
      question: 'If you placed items in this order: Top-Left, Bottom-Right, Top-Right, where would the next logical position be?', 
      options: ['Top-Left', 'Bottom-Left', 'Center', 'Top-Right'], 
      correctAnswer: 1, 
      difficulty: 'medium', 
      category: 'spatial',
      type: 'multiple_choice'
    },
    { 
      id: 7, 
      question: 'Remember these colors shown for 3 seconds: RED, BLUE, GREEN, YELLOW. Which color was second?', 
      options: ['RED', 'BLUE', 'GREEN', 'YELLOW'], 
      correctAnswer: 1, 
      difficulty: 'medium', 
      category: 'visual',
      type: 'multiple_choice'
    },
    { 
      id: 8, 
      question: 'What comes next in this pattern: 🌟 🌟 ⭐ 🌟 🌟 ⭐ ___?', 
      options: ['🌟', '⭐', '🌙', '☀️'], 
      correctAnswer: 0, 
      difficulty: 'hard', 
      category: 'pattern',
      type: 'multiple_choice'
    },
    { 
      id: 9, 
      question: 'Study this sequence: A-3-B-7-C-11. What number should come next?', 
      options: ['13', '14', '15', '16'], 
      correctAnswer: 2, 
      difficulty: 'hard', 
      category: 'sequence',
      type: 'multiple_choice'
    },
    { 
      id: 10, 
      question: 'Remember these words: HOUSE, TREE, CAR, BOOK, PHONE. Which word was in the middle position?', 
      options: ['HOUSE', 'TREE', 'CAR', 'BOOK'], 
      correctAnswer: 2, 
      difficulty: 'hard', 
      category: 'recall',
      type: 'multiple_choice'
    },
    { 
      id: 11, 
      question: 'Which pattern follows the rule "alternate between two shapes, add one more of the first shape each time"?', 
      options: ['⭐ 🔺 ⭐⭐ 🔺', '⭐ 🔺 🔺 ⭐', '⭐ 🔺 ⭐ 🔺 ⭐', '🔺 ⭐ 🔺 🔺 ⭐'], 
      correctAnswer: 0, 
      difficulty: 'hard', 
      category: 'pattern',
      type: 'multiple_choice'
    },
    { 
      id: 12, 
      question: 'In a 3x3 grid, if you place items in corners first, then sides, what position comes after all corners are filled?', 
      options: ['Center', 'Top-middle', 'Any side position', 'Bottom-middle'], 
      correctAnswer: 2, 
      difficulty: 'hard', 
      category: 'spatial',
      type: 'multiple_choice'
    }
  ];

  useEffect(() => {
    try { 
      NotificationService.initialize(); 
    } catch (e) { 
      console.warn('Notification init failed', e); 
    }
    
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && saved.selectedAnswers) {
            Alert.alert(
              'Resume Assessment?',
              'We found an in-progress memory assessment. Do you want to continue?',
              [
                {
                  text: 'No',
                  onPress: async () => {
                    await AsyncStorage.removeItem(STORAGE_KEY);
                    setRestored(true);
                  },
                  style: 'destructive',
                },
                {
                  text: 'Yes',
                  onPress: () => {
                    setSelectedAnswers(saved.selectedAnswers || {});
                    setCurrentQuestion(saved.currentQuestion || 0);
                    setStartTime(saved.startTime ? new Date(saved.startTime) : new Date());
                    setAssessmentStarted(true);
                    setRestored(true);
                  },
                },
              ],
              { cancelable: false },
            );
            return;
          }
        }
      } catch (e) {
        console.warn('Restore failed', e);
      }
      setRestored(true);
    };
    restore();
  }, []);

  // Persist progress
  useEffect(() => {
    if (!assessmentStarted) return;
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
          selectedAnswers,
          currentQuestion,
          startTime: startTime ? startTime.toISOString() : new Date().toISOString(),
          savedAt: new Date().toISOString()
        }));
      } catch (e) { 
        console.warn('Save failed', e); 
      }
    };
    save();
  }, [selectedAnswers, currentQuestion, assessmentStarted, startTime]);

  // Jump-bar auto-scroll logic
  useEffect(() => {
    const buttonWidth = 64;
    const gap = 10;
    const totalWidth = questions.length * (buttonWidth + gap);
    const centerOffset = Math.max(0, (SCREEN_WIDTH / 2) - (buttonWidth / 2));
    const maxScroll = Math.max(0, totalWidth - SCREEN_WIDTH + 24);

    const targetX = Math.max(0, Math.min(maxScroll, currentQuestion * (buttonWidth + gap) - centerOffset));

    try {
      if (jumpRef.current) {
        jumpRef.current.scrollTo({ x: targetX, animated: true });
      }
    } catch (e) {
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
    setSelectedAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: answerIndex }));
  };

  const goPrev = () => {
    if (currentQuestion === 0) return;
    setCurrentQuestion(c => c - 1);
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
    } else {
      Alert.alert(
        'Submit', 
        'Submit your memory assessment? You will not be able to change your answers after submission.', 
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: finishAssessment }
        ]
      );
    }
  };

  const jumpToQuestion = (idx: number) => setCurrentQuestion(idx);

  const calculateResults = (): AssessmentResult => {
    let correctAnswers = 0;
    const memoryCategories = {
      pattern: { correct: 0, total: 0 },
      sequence: { correct: 0, total: 0 },
      visual: { correct: 0, total: 0 },
      spatial: { correct: 0, total: 0 },
      recall: { correct: 0, total: 0 }
    };

    const answers = questions.map(q => {
      const sel = selectedAnswers[q.id];
      const isCorrect = sel === q.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      // Update category stats
      memoryCategories[q.category].total++;
      if (isCorrect) memoryCategories[q.category].correct++;
      
      return { questionId: q.id, selectedAnswer: sel ?? -1, isCorrect };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeSpent = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : 0;
    
    let cognitiveLevel: AssessmentResult['cognitiveLevel'] = 'needs_attention';
    if (score >= 90) cognitiveLevel = 'excellent';
    else if (score >= 75) cognitiveLevel = 'good';
    else if (score >= 60) cognitiveLevel = 'fair';

    return {
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers: questions.length - correctAnswers,
      score,
      timeSpent,
      difficulty: 'mixed',
      answers,
      completedAt: new Date(),
      cognitiveLevel,
      memoryCategories
    };
  };

  const computeDomainStats = () => {
    const results = calculateResults();
    return Object.entries(results.memoryCategories).map(([category, val]) => ({
      category: category.toUpperCase(),
      correct: val.correct,
      total: val.total,
      percent: Math.round((val.correct / Math.max(1, val.total)) * 100)
    }));
  };

  const saveToFirestore = async (results: AssessmentResult): Promise<boolean> => {
    try {
      setIsLoading(true);
      const docRef = await addDoc(collection(firestore, 'memory_assessments'), {
        ...results,
        createdAt: serverTimestamp(),
        assessmentType: 'cognitive_memory_elderly'
      });
      console.log('Memory assessment saved', docRef.id);
      
      try { 
        await NotificationService.sendLocalNotification(
          'Memory Assessment Completed! 🧠', 
          `Score: ${results.score}% - ${results.cognitiveLevel}`
        ); 
      } catch {}
      
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Save failed', error);
      try { 
        await NotificationService.sendLocalNotification(
          'Save Failed', 
          'Unable to save memory assessment results.'
        ); 
      } catch {}
      Alert.alert('Save Failed', 'Unable to save results. Please check your connection.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const finishAssessment = async () => {
    const results = calculateResults();
    const saved = await saveToFirestore(results);
    if (saved) setShowResults(true);
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
    Alert.alert(
      'Exit', 
      'Exit and save progress so you can resume later?', 
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => setAssessmentStarted(false) }
      ]
    );
  };

  const getCognitiveBadge = (level: string) => {
    switch (level) {
      case 'excellent': 
        return { 
          label: 'Excellent', 
          color: PALETTE.teal, 
          text: 'Outstanding memory performance — keep it up!' 
        };
      case 'good': 
        return { 
          label: 'Good', 
          color: PALETTE.orange, 
          text: 'Good memory skills — continue regular practice.' 
        };
      case 'fair': 
        return { 
          label: 'Fair', 
          color: '#FEC84D', 
          text: 'Fair performance — regular memory exercises recommended.' 
        };
      case 'needs_attention': 
        return { 
          label: 'Needs Attention', 
          color: PALETTE.red, 
          text: 'Consider memory training exercises or follow-up assessment.' 
        };
      default: 
        return { 
          label: 'Unknown', 
          color: '#666', 
          text: '' 
        };
    }
  };

  // Welcome screen
  if (!assessmentStarted && restored) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtnText, { color: PALETTE.teal }]}>← Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.welcomeContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.bigTitle, { color: PALETTE.teal }]}>Memory Assessment</Text>
          <Text style={[styles.largeSubtitle, { color: '#666' }]}>
            Comprehensive evaluation of your memory abilities
          </Text>

          <View style={[styles.welcomeCard, { borderColor: PALETTE.lightTeal }]}>
            <Text style={styles.welcomeCardTitle}>What this assessment covers</Text>
            <Text style={styles.welcomeLine}>• Pattern recognition and memory</Text>
            <Text style={styles.welcomeLine}>• Sequence recall abilities</Text>
            <Text style={styles.welcomeLine}>• Visual memory skills</Text>
            <Text style={styles.welcomeLine}>• Spatial memory functions</Text>
            <Text style={styles.welcomeLine}>• Short-term recall capacity</Text>
          </View>

          <View style={[styles.welcomeCard, { borderColor: PALETTE.lightTeal, backgroundColor: '#F0F9FF' }]}>
            <Text style={styles.welcomeCardTitle}>Assessment Details</Text>
            <Text style={styles.welcomeLine}>• 12 carefully designed questions</Text>
            <Text style={styles.welcomeLine}>• Takes about 8-12 minutes</Text>
            <Text style={styles.welcomeLine}>• Results saved securely</Text>
            <Text style={styles.welcomeLine}>• Progress tracking available</Text>
          </View>

          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: PALETTE.teal }]} 
            onPress={startAssessment} 
            accessibilityLabel="Start memory assessment"
          >
            <Text style={styles.startButtonText}>Start Memory Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.smallAction} 
            onPress={async () => { 
              await AsyncStorage.removeItem(STORAGE_KEY); 
              Alert.alert('Cleared', 'Saved progress cleared.'); 
            }}
          >
            <Text style={[styles.smallActionText, { color: '#666' }]}>Clear saved progress</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Results screen
  if (showResults) {
    const results = calculateResults();
    const domainStats = computeDomainStats();
    const badge = getCognitiveBadge(results.cognitiveLevel);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.resultsTitle, { color: PALETTE.teal }]}>Memory Assessment Complete 🧠</Text>

          <View style={[styles.badgeBox, { borderColor: badge.color }]}>
            <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label}</Text>
            <Text style={[styles.badgeScore, { color: badge.color }]}>{results.score}%</Text>
            <Text style={styles.badgeMsg}>{badge.text}</Text>
          </View>

          <View style={styles.domainGrid}>
            {domainStats.map((d) => (
              <View key={d.category} style={styles.domainCard}>
                <Text style={styles.domainTitle}>{d.category}</Text>
                <Text style={[styles.domainPercent, { color: PALETTE.teal }]}>{d.percent}%</Text>
                <View style={styles.domainBar}>
                  <View style={[styles.domainFill, { width: `${d.percent}%`, backgroundColor: PALETTE.teal }]} />
                </View>
                <Text style={styles.domainSmall}>{d.correct}/{d.total} correct</Text>
              </View>
            ))}
          </View>

          {isLoading && (
            <View style={{ marginVertical: 12 }}>
              <ActivityIndicator size="large" color={PALETTE.teal} />
            </View>
          )}

          <View style={styles.resultNavRow}>
            <TouchableOpacity 
              style={[styles.resultNavBtn, { backgroundColor: PALETTE.teal }]} 
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.resultNavText}>Go Home</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.resultNavBtnAlt, { backgroundColor: PALETTE.orange }]} 
              onPress={() => navigation.navigate('Assessment')}
            >
              <Text style={styles.resultNavTextAlt}>All Assessments</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.retakeBtn, { backgroundColor: PALETTE.lightTeal }]} 
            onPress={resetAssessment}
          >
            <Text style={[styles.retakeText, { color: PALETTE.teal }]}>Take Again</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Question screen
  const question = questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backSmall, { color: PALETTE.teal }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.progressText, { color: '#0f172a' }]}>
          Question {currentQuestion + 1} / {questions.length}
        </Text>
        <TouchableOpacity onPress={exitAssessment}>
          <Text style={[styles.exitText, { color: PALETTE.red }]}>Exit</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.progressBar, { backgroundColor: PALETTE.lightTeal }]}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: PALETTE.teal }]} />
      </View>

      <RNScrollView
        horizontal
        ref={jumpRef}
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
                answered ? styles.jumpBtnAnswered : null
              ]}
            >
              <Text style={[styles.jumpBtnText, active ? styles.jumpBtnTextActive : null]}>
                {idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </RNScrollView>

      <ScrollView contentContainerStyle={styles.questionWrap} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={[styles.category, { color: PALETTE.teal, backgroundColor: PALETTE.lightTeal }]}>
            {question.category.toUpperCase()}
          </Text>
          <Text style={[styles.questionText, { fontSize: 20 }]}>{question.question}</Text>

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
                    { borderColor: selected ? PALETTE.teal : '#E6EEF8' }
                  ]}
                  accessibilityLabel={`Option ${i + 1}: ${opt}`}
                >
                  <Text style={[
                    styles.optionText, 
                    selected ? styles.optionTextSelected : null
                  ]}>
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
              { backgroundColor: PALETTE.teal },
              currentQuestion === 0 ? styles.navDisabled : null
            ]}
          >
            <Text style={[
              styles.navBtnText, 
              currentQuestion === 0 ? styles.navDisabledText : null
            ]}>
              ← Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={goNext} 
            disabled={selectedAnswers[question.id] === undefined} 
            style={[
              styles.navBtn, 
              { backgroundColor: PALETTE.teal },
              selectedAnswers[question.id] === undefined ? styles.navDisabled : null
            ]}
          >
            <Text style={[
              styles.navBtnText, 
              selectedAnswers[question.id] === undefined ? styles.navDisabledText : null
            ]}>
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },

  topRow: { paddingHorizontal: 12, paddingTop: 12, alignItems: 'flex-start' },
  backBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  backBtnText: { fontWeight: '700', fontSize: 16 },

  welcomeContent: { padding: 24, alignItems: 'center' },
  bigTitle: { fontSize: 30, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  largeSubtitle: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  welcomeCard: { 
    width: '100%', 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 18, 
    elevation: 3,
    borderWidth: 1
  },
  welcomeCardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  welcomeLine: { fontSize: 16, color: '#475569', marginVertical: 2 },
  startButton: { 
    marginTop: 8, 
    paddingVertical: 18, 
    paddingHorizontal: 28, 
    borderRadius: 12, 
    width: '100%' 
  },
  startButtonText: { fontSize: 18, color: '#fff', fontWeight: '800', textAlign: 'center' },
  smallAction: { marginTop: 10 },
  smallActionText: { textDecorationLine: 'underline' },

  headerRow: { 
    padding: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  progressText: { fontSize: 16, fontWeight: '700' },
  backSmall: { fontWeight: '700' },
  exitText: { fontSize: 14, fontWeight: '700' },

  progressBar: { height: 8, marginHorizontal: 12, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%' },

  jumpBar: { paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center' },
  jumpBtn: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#F1F5F9', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 10 
  },
  jumpBtnActive: { backgroundColor: PALETTE.teal },
  jumpBtnAnswered: { borderWidth: 2, borderColor: PALETTE.orange },
  jumpBtnText: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  jumpBtnTextActive: { color: '#fff' },

  questionWrap: { padding: 16, paddingBottom: 36 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 3 },
  category: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12, 
    fontWeight: '700', 
    marginBottom: 12 
  },
  questionText: { fontSize: 20, color: '#0f172a', lineHeight: 28, marginBottom: 8 },

  option: { 
    backgroundColor: '#F8FAFC', 
    paddingVertical: 16, 
    paddingHorizontal: 10, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginVertical: 8 
  },
  optionSelected: { backgroundColor: '#F0F9FF' },
  optionText: { textAlign: 'center', fontSize: 18, color: '#0f172a' },
  optionTextSelected: { fontWeight: '800' },

  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  navBtn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 10, 
    marginHorizontal: 8, 
    alignItems: 'center' 
  },
  navBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  navDisabled: { backgroundColor: '#cbd5e1' },
  navDisabledText: { color: '#475569' },

  resultsContent: { padding: 24, alignItems: 'center' },
  resultsTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },

  badgeBox: { 
    width: '100%', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    borderWidth: 2, 
    marginBottom: 12 
  },
  badgeLabel: { fontSize: 18, fontWeight: '900' },
  badgeScore: { fontSize: 40, fontWeight: '900', marginTop: 6 },
  badgeMsg: { marginTop: 8, textAlign: 'center', fontSize: 15 },

  domainGrid: { 
    width: '100%', 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginTop: 6 
  },
  domainCard: { 
    width: '48%', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 10, 
    elevation: 2 
  },
  domainTitle: { fontWeight: '800', marginBottom: 6, fontSize: 12 },
  domainPercent: { fontSize: 22, fontWeight: '900' },
  domainBar: { 
    height: 8, 
    backgroundColor: '#EEF2FF', 
    borderRadius: 6, 
    overflow: 'hidden', 
    marginTop: 8 
  },
  domainFill: { height: '100%' },
  domainSmall: { marginTop: 6, color: '#475569', fontSize: 12 },

  resultNavRow: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-around', 
    marginBottom: 12 
  },
  resultNavBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    minWidth: 140, 
    alignItems: 'center' 
  },
  resultNavBtnAlt: { 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    minWidth: 140, 
    alignItems: 'center' 
  },
  resultNavText: { color: '#fff', fontWeight: '800' },
  resultNavTextAlt: { color: '#fff', fontWeight: '800' },

  retakeBtn: { 
    marginTop: 8, 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10 
  },
  retakeText: { fontWeight: '800', textAlign: 'center' }
});

export default MemoryTest;