// app/src/screens/Games/MemoryMatch/MemoryTest.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { HapticFeedbackService } from "../../services/HapticFeedbackService";
import { firestore } from '@/config/firebaseConfig';
import { NotificationService } from '@/config/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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
import { useSettings } from '@/app/contexts/SettingsContext'; // Import the settings context

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

const STORAGE_KEY = 'memory_assessment_inprogress_v2';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const auth = getAuth();

const MemoryTest: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  // Use settings context
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [restored, setRestored] = useState(false);
  const jumpRef = useRef<RNScrollView | null>(null);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#F7FAFC';
  const textColor = isDark ? '#fff' : PALETTE.teal;
  const mutedTextColor = isDark ? '#aaa' : '#64748b';
  const darkTextColor = isDark ? '#fff' : '#0f172a';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const cardBorderColor = isDark ? PALETTE.teal : PALETTE.lightTeal;
  const lightCardBg = isDark ? '#3a3a3a' : '#F0F9FF';

  // Simplified 8-question set for elderly-friendly assessment
  const questions: Question[] = [
    { id: 1, question: 'Look at this pattern:\n🔴 🔵 🔴 🔵 ___\n\nWhat comes next?', options: ['🔴','🔵','🟡','🟢'], correctAnswer: 0, difficulty: 'easy', category: 'pattern', type: 'multiple_choice' },
    { id: 2, question: 'Remember this sequence:\n7, 3, 9, 1\nWhich number was third?', options: ['7','3','9','1'], correctAnswer: 2, difficulty: 'easy', category: 'sequence', type: 'multiple_choice' },
    { id: 3, question: 'Study these items:\n🍎 🚗 📚 ⚽\nHow many items were there?', options: ['3','4','5','6'], correctAnswer: 1, difficulty: 'easy', category: 'recall', type: 'multiple_choice' },
    { id: 4, question: 'Complete this number sequence:\n2, 4, 6, 8, ___', options: ['9','10','11','12'], correctAnswer: 1, difficulty: 'medium', category: 'sequence', type: 'multiple_choice' },
    { id: 5, question: 'Remember these colors:\nRED, BLUE, GREEN, YELLOW\nWhich color was second?', options: ['RED','BLUE','GREEN','YELLOW'], correctAnswer: 1, difficulty: 'medium', category: 'visual', type: 'multiple_choice' },
    { id: 6, question: 'What comes next in this pattern:\n🌟 🌟 ⭐ 🌟 🌟 ⭐ ___?', options: ['🌟','⭐','🌙','☀️'], correctAnswer: 0, difficulty: 'medium', category: 'pattern', type: 'multiple_choice' },
    { id: 7, question: 'Study this sequence:\nA-3-B-7-C-11\nWhat number comes next?', options: ['13','14','15','16'], correctAnswer: 2, difficulty: 'hard', category: 'sequence', type: 'multiple_choice' },
    { id: 8, question: 'Remember these words:\nHOUSE, TREE, CAR, BOOK, PHONE\nWhich was in the middle position?', options: ['HOUSE','TREE','CAR','BOOK'], correctAnswer: 2, difficulty: 'hard', category: 'recall', type: 'multiple_choice' }
  ];

  // Restore saved progress
  useEffect(() => {
    try { NotificationService.initialize(); } catch (e) { console.warn('Notification init failed', e); }
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && saved.selectedAnswers) {
            Alert.alert('Resume Assessment?', 'Continue your previous memory assessment?', [
              { text: 'Start Fresh', style: 'destructive', onPress: async () => { HapticFeedbackService.buttonPress(); await AsyncStorage.removeItem(STORAGE_KEY); setRestored(true); } },
              { text: 'Resume', onPress: () => { HapticFeedbackService.buttonPress(); setSelectedAnswers(saved.selectedAnswers || {}); setCurrentQuestion(saved.currentQuestion || 0); setStartTime(saved.startTime ? new Date(saved.startTime) : new Date()); setAssessmentStarted(true); setRestored(true); } }
            ], { cancelable: false });
            return;
          }
        }
      } catch (e) { console.warn('Restore failed', e); }
      setRestored(true);
    };
    restore();
  }, []);

  // Persist progress
  useEffect(() => {
    if (!assessmentStarted) return;
    const save = async () => {
      try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedAnswers, currentQuestion, startTime: startTime?.toISOString() || new Date().toISOString(), savedAt: new Date().toISOString() })); }
      catch (e) { console.warn('Save failed', e); }
    };
    save();
  }, [selectedAnswers, currentQuestion, assessmentStarted, startTime]);

  // Jump-bar auto-scroll
  useEffect(() => {
    const buttonWidth = 70; const gap = 12;
    const totalWidth = questions.length * (buttonWidth + gap);
    const centerOffset = Math.max(0, (SCREEN_WIDTH / 2) - (buttonWidth / 2));
    const maxScroll = Math.max(0, totalWidth - SCREEN_WIDTH + 24);
    const targetX = Math.max(0, Math.min(maxScroll, currentQuestion * (buttonWidth + gap) - centerOffset));
    try { jumpRef.current?.scrollTo({ x: targetX, animated: true }); } catch { try { jumpRef.current?.scrollToEnd({ animated: true }); } catch {} }
  }, [currentQuestion]);

  const startAssessment = () => { HapticFeedbackService.gameStart(); setAssessmentStarted(true); setStartTime(new Date()); setCurrentQuestion(0); setSelectedAnswers({}); setShowResults(false); };
  const handleAnswerSelect = (answerIndex: number) => { HapticFeedbackService.selection(); setSelectedAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: answerIndex })); };
  const goPrev = () => { if (currentQuestion === 0) return; HapticFeedbackService.buttonPress(); setCurrentQuestion(c => c - 1); };
  const goNext = () => { HapticFeedbackService.buttonPress(); if (currentQuestion < questions.length - 1) { setCurrentQuestion(c => c + 1); } else { Alert.alert('Submit Assessment', 'Ready to submit? You cannot change answers after submission.', [{ text: 'Review', style: 'cancel', onPress: () => HapticFeedbackService.buttonPress() }, { text: 'Submit', onPress: finishAssessment }]); } };
  const jumpToQuestion = (idx: number) => { HapticFeedbackService.buttonPress(); setCurrentQuestion(idx); };

  const calculateResults = (): AssessmentResult => {
    let correctAnswers = 0;
    const memoryCategories = { pattern: { correct: 0, total: 0 }, sequence: { correct: 0, total: 0 }, visual: { correct: 0, total: 0 }, spatial: { correct: 0, total: 0 }, recall: { correct: 0, total: 0 } };
    const answers = questions.map(q => {
      const sel = selectedAnswers[q.id]; const isCorrect = sel === q.correctAnswer;
      if (isCorrect) correctAnswers++; memoryCategories[q.category].total++; if (isCorrect) memoryCategories[q.category].correct++;
      return { questionId: q.id, selectedAnswer: sel ?? -1, isCorrect };
    });
    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeSpent = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : 0;
    let cognitiveLevel: AssessmentResult['cognitiveLevel'] = 'needs_attention';
    if (score >= 88) cognitiveLevel = 'excellent'; else if (score >= 75) cognitiveLevel = 'good'; else if (score >= 63) cognitiveLevel = 'fair';
    return { userId: auth.currentUser?.uid, totalQuestions: questions.length, correctAnswers, incorrectAnswers: questions.length - correctAnswers, score, timeSpent, difficulty: 'mixed', answers, completedAt: new Date(), cognitiveLevel, memoryCategories };
  };

  const computeDomainStats = () => Object.entries(calculateResults().memoryCategories).filter(([_, val]) => val.total > 0).map(([category, val]) => ({ category: category.toUpperCase(), correct: val.correct, total: val.total, percent: Math.round((val.correct / Math.max(1, val.total)) * 100) }));

  const saveToFirestore = async (results: AssessmentResult) => {
    const userId = auth.currentUser?.uid;
    if (!userId) { Alert.alert('Login Required', 'Please login to save results.'); return false; }
    try {
      setIsLoading(true);
      const docRef = await addDoc(collection(firestore, `users/${userId}/memoryResults`), { ...results, createdAt: serverTimestamp(), assessmentType: 'cognitive_memory_elderly' });
      console.log('Memory assessment saved', docRef.id);
      HapticFeedbackService.achievement();
      try { await NotificationService.sendLocalNotification('Memory Assessment Complete! 🧠', `Score: ${results.score}% - ${results.cognitiveLevel}`); } catch {}
      await AsyncStorage.removeItem(STORAGE_KEY); return true;
    } catch (error) {
      console.error('Save failed', error); HapticFeedbackService.wrongAnswer();
      try { await NotificationService.sendLocalNotification('Save Failed', 'Unable to save memory assessment results.'); } catch {}
      Alert.alert('Save Failed', 'Unable to save results. Please check your connection.'); return false;
    } finally { setIsLoading(false); }
  };

  const finishAssessment = async () => { HapticFeedbackService.gameEnd(); const results = calculateResults(); const saved = await saveToFirestore(results); if (saved) setShowResults(true); };
  const resetAssessment = async () => { HapticFeedbackService.buttonPress(); await AsyncStorage.removeItem(STORAGE_KEY); setAssessmentStarted(false); setCurrentQuestion(0); setSelectedAnswers({}); setShowResults(false); setStartTime(null); };
  const exitAssessment = async () => { HapticFeedbackService.buttonPress(); Alert.alert('Exit Assessment', 'Your progress will be saved. You can resume later.', [{ text: 'Cancel', style: 'cancel', onPress: () => HapticFeedbackService.buttonPress() }, { text: 'Exit', onPress: () => { HapticFeedbackService.buttonPress(); navigation.goBack(); } }]); };

  const getCognitiveBadge = (level: string) => {
    switch(level){
      case 'excellent': return { label: 'Excellent', color: PALETTE.teal, emoji: '🌟', text: 'Outstanding memory performance!' };
      case 'good': return { label: 'Good', color: PALETTE.orange, emoji: '👍', text: 'Good memory skills - keep practicing!' };
      case 'fair': return { label: 'Fair', color: '#FEC84D', emoji: '💪', text: 'Fair performance - regular practice recommended.' };
      case 'needs_attention': return { label: 'Needs Attention', color: PALETTE.red, emoji: '📋', text: 'Consider memory exercises or follow-up.' };
      default: return { label: 'Unknown', color: '#666', emoji: '❓', text: '' };
    }
  };

  // --- UI Rendering ---

  if (!assessmentStarted && restored) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => { HapticFeedbackService.buttonPress(); navigation.goBack(); }} activeOpacity={0.7}>
            <Text style={[styles.backBtnText, { color: PALETTE.teal, fontSize: 18 * fontScale }]}>← Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.welcomeContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.bigTitle, { 
            color: textColor,
            fontSize: 34 * fontScale 
          }]}>🧠 Memory Assessment</Text>
          
          <Text style={[styles.largeSubtitle, { 
            color: mutedTextColor,
            fontSize: 20 * fontScale 
          }]}>Evaluate your cognitive abilities</Text>

          <View style={[styles.welcomeCard, { 
            borderColor: cardBorderColor,
            backgroundColor: cardBg
          }]}>
            <Text style={[styles.welcomeCardTitle, { 
              color: textColor,
              fontSize: 20 * fontScale 
            }]}>What We Test</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• 🎨 Pattern recognition</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• 🔢 Sequence recall</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• 👁️ Visual memory</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• 🧩 Problem solving</Text>
          </View>

          <View style={[styles.welcomeCard, { 
            borderColor: cardBorderColor, 
            backgroundColor: lightCardBg 
          }]}>
            <Text style={[styles.welcomeCardTitle, { 
              color: textColor,
              fontSize: 20 * fontScale 
            }]}>Assessment Details</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• ✅ 8 carefully designed questions</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• ⏱️ Takes about 6-8 minutes</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• 💾 Progress saved automatically</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• 📊 Detailed results provided</Text>
          </View>

          <TouchableOpacity style={[styles.startButton, { backgroundColor: PALETTE.teal }]} onPress={startAssessment} activeOpacity={0.8} accessibilityLabel="Start memory assessment">
            <Text style={[styles.startButtonText, { fontSize: 20 * fontScale }]}>Start Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallAction} onPress={async () => { HapticFeedbackService.buttonPress(); await AsyncStorage.removeItem(STORAGE_KEY); Alert.alert('Cleared', 'Saved progress cleared.'); }} activeOpacity={0.7}>
            <Text style={[styles.smallActionText, { 
              color: mutedTextColor,
              fontSize: 16 * fontScale 
            }]}>Clear saved progress</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Results screen ---
  if (showResults) {
    const results = calculateResults();
    const domainStats = computeDomainStats();
    const badge = getCognitiveBadge(results.cognitiveLevel);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.resultsTitle, { 
            color: textColor,
            fontSize: 26 * fontScale 
          }]}>Assessment Complete! {badge.emoji}</Text>

          <View style={[styles.badgeBox, { 
            borderColor: badge.color,
            backgroundColor: cardBg
          }]}>
            <Text style={[styles.badgeLabel, { 
              color: badge.color,
              fontSize: 20 * fontScale 
            }]}>{badge.label}</Text>
            
            <Text style={[styles.badgeScore, { 
              color: badge.color,
              fontSize: 48 * fontScale 
            }]}>{results.score}%</Text>
            
            <Text style={[styles.badgeMsg, { 
              color: mutedTextColor,
              fontSize: 17 * fontScale 
            }]}>{badge.text}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.statNumber, { 
                color: PALETTE.teal,
                fontSize: 32 * fontScale 
              }]}>{results.correctAnswers}</Text>
              <Text style={[styles.statLabel, { 
                color: mutedTextColor,
                fontSize: 14 * fontScale 
              }]}>Correct</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.statNumber, { 
                color: PALETTE.teal,
                fontSize: 32 * fontScale 
              }]}>{results.incorrectAnswers}</Text>
              <Text style={[styles.statLabel, { 
                color: mutedTextColor,
                fontSize: 14 * fontScale 
              }]}>Incorrect</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.statNumber, { 
                color: PALETTE.teal,
                fontSize: 32 * fontScale 
              }]}>{Math.floor(results.timeSpent / 60)}m</Text>
              <Text style={[styles.statLabel, { 
                color: mutedTextColor,
                fontSize: 14 * fontScale 
              }]}>Time</Text>
            </View>
          </View>

          <Text style={[styles.domainHeader, { 
            color: darkTextColor,
            fontSize: 20 * fontScale 
          }]}>Performance by Category</Text>
          
          <View style={styles.domainGrid}>
            {domainStats.map((d) => (
              <View key={d.category} style={[styles.domainCard, { backgroundColor: cardBg }]}>
                <Text style={[styles.domainTitle, { 
                  color: darkTextColor,
                  fontSize: 13 * fontScale 
                }]}>{d.category}</Text>
                
                <Text style={[styles.domainPercent, { 
                  color: PALETTE.teal,
                  fontSize: 28 * fontScale 
                }]}>{d.percent}%</Text>
                
                <View style={[styles.domainBar, { backgroundColor: isDark ? '#3a3a3a' : '#EEF2FF' }]}>
                  <View style={[styles.domainFill, { width: `${d.percent}%`, backgroundColor: PALETTE.teal }]} />
                </View>
                
                <Text style={[styles.domainSmall, { 
                  color: mutedTextColor,
                  fontSize: 13 * fontScale 
                }]}>{d.correct}/{d.total} correct</Text>
              </View>
            ))}
          </View>

          {isLoading && <View style={{ marginVertical: 16 }}><ActivityIndicator size="large" color={PALETTE.teal} /></View>}

          <View style={styles.resultNavRow}>
            <TouchableOpacity style={[styles.resultNavBtn, { backgroundColor: PALETTE.teal }]} onPress={() => { HapticFeedbackService.buttonPress(); navigation.navigate('Home'); }} activeOpacity={0.8}>
              <Text style={[styles.resultNavText, { fontSize: 16 * fontScale }]}>Go Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.resultNavBtnAlt, { backgroundColor: PALETTE.orange }]} onPress={() => { HapticFeedbackService.buttonPress(); navigation.navigate('Assessment'); }} activeOpacity={0.8}>
              <Text style={[styles.resultNavTextAlt, { fontSize: 16 * fontScale }]}>All Assessments</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.retakeBtn, { backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal }]} onPress={resetAssessment} activeOpacity={0.8}>
            <Text style={[styles.retakeText, { 
              color: PALETTE.teal,
              fontSize: 16 * fontScale 
            }]}>Take Again</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Question screen ---
  const question = questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);
  const answered = selectedAnswers[question.id] !== undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => { HapticFeedbackService.buttonPress(); navigation.goBack(); }} activeOpacity={0.7}>
          <Text style={[styles.backSmall, { 
            color: PALETTE.teal,
            fontSize: 16 * fontScale 
          }]}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={[styles.progressText, { 
          color: darkTextColor,
          fontSize: 18 * fontScale 
        }]}>Question {currentQuestion + 1} / {questions.length}</Text>
        
        <TouchableOpacity onPress={exitAssessment} activeOpacity={0.7}>
          <Text style={[styles.exitText, { 
            color: PALETTE.red,
            fontSize: 16 * fontScale 
          }]}>Exit</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.progressBar, { backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal }]}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: PALETTE.teal }]} />
      </View>

      <RNScrollView horizontal ref={jumpRef} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.jumpBar, { paddingRight: 28 }]}>
        {questions.map((q, idx) => {
          const questionAnswered = selectedAnswers[q.id] !== undefined;
          const active = idx === currentQuestion;
          return (
            <TouchableOpacity key={q.id} onPress={() => jumpToQuestion(idx)} accessibilityLabel={`Jump to question ${idx + 1}`} activeOpacity={0.7} style={[
              styles.jumpBtn, 
              { backgroundColor: isDark ? '#3a3a3a' : '#F1F5F9' },
              active ? [styles.jumpBtnActive, { backgroundColor: PALETTE.teal }] : null, 
              questionAnswered ? [styles.jumpBtnAnswered, { borderColor: PALETTE.orange }] : null
            ]}>
              <Text style={[
                styles.jumpBtnText, 
                { 
                  color: isDark ? '#fff' : '#0f172a',
                  fontSize: 22 * fontScale 
                },
                active ? styles.jumpBtnTextActive : null
              ]}>{idx + 1}</Text>
            </TouchableOpacity>
          );
        })}
      </RNScrollView>

      <ScrollView contentContainerStyle={styles.questionWrap} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.category, { 
            color: PALETTE.teal, 
            backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal,
            fontSize: 13 * fontScale 
          }]}>{question.category.toUpperCase()}</Text>
          
          <Text style={[styles.questionText, { 
            fontSize: 22 * fontScale, 
            lineHeight: 32 * fontScale,
            color: darkTextColor 
          }]}>{question.question}</Text>

          <View style={{ marginTop: 16 }}>
            {question.options.map((opt, i) => {
              const selected = selectedAnswers[question.id] === i;
              return (
                <TouchableOpacity key={i} onPress={() => handleAnswerSelect(i)} activeOpacity={0.7} style={[
                  styles.option, 
                  { 
                    backgroundColor: isDark ? '#3a3a3a' : '#F8FAFC',
                    borderColor: selected ? PALETTE.teal : (isDark ? '#555' : '#E6EEF8')
                  }, 
                  selected ? [styles.optionSelected, { backgroundColor: isDark ? '#2a4a4a' : '#F0F9FF' }] : null
                ]} accessibilityLabel={`Option ${i + 1}: ${opt}`}>
                  <Text style={[
                    styles.optionText, 
                    { 
                      color: darkTextColor,
                      fontSize: 19 * fontScale 
                    }, 
                    selected ? [styles.optionTextSelected, { color: PALETTE.teal }] : null
                  ]}>{opt}</Text>
                  
                  {selected && <View style={[styles.checkmark, { backgroundColor: isDark ? '#1a3a3a' : PALETTE.lightTeal }]}>
                    <Text style={{ color: PALETTE.teal, fontSize: 20 * fontScale, fontWeight: 'bold' }}>✓</Text>
                  </View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity onPress={goPrev} disabled={currentQuestion === 0} activeOpacity={0.8} style={[
            styles.navBtn, 
            { backgroundColor: PALETTE.teal }, 
            currentQuestion === 0 ? [styles.navDisabled, { backgroundColor: isDark ? '#555' : '#cbd5e1' }] : null
          ]}>
            <Text style={[
              styles.navBtnText, 
              { fontSize: 18 * fontScale },
              currentQuestion === 0 ? [styles.navDisabledText, { color: isDark ? '#888' : '#475569' }] : null
            ]}>← Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goNext} disabled={!answered} activeOpacity={0.8} style={[
            styles.navBtn, 
            { backgroundColor: PALETTE.teal }, 
            !answered ? [styles.navDisabled, { backgroundColor: isDark ? '#555' : '#cbd5e1' }] : null
          ]}>
            <Text style={[
              styles.navBtnText, 
              { fontSize: 18 * fontScale },
              !answered ? [styles.navDisabledText, { color: isDark ? '#888' : '#475569' }] : null
            ]}>{currentQuestion === questions.length - 1 ? 'Finish ✓' : 'Next →'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  topRow: { paddingHorizontal: 16, paddingTop: 16, alignItems: 'flex-start' },
  backBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { fontWeight: '700' },

  welcomeContent: { padding: 24, alignItems: 'center' },
  bigTitle: { fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  largeSubtitle: { marginBottom: 24, textAlign: 'center' },
  welcomeCard: { 
    width: '100%', 
    padding: 22, 
    borderRadius: 16, 
    marginBottom: 20, 
    elevation: 3,
    borderWidth: 2
  },
  welcomeCardTitle: { fontWeight: '700', marginBottom: 12 },
  welcomeLine: { marginVertical: 4, lineHeight: 26 },
  startButton: { 
    marginTop: 12, 
    paddingVertical: 20, 
    paddingHorizontal: 32, 
    borderRadius: 16, 
    width: '100%' 
  },
  startButtonText: { color: '#fff', fontWeight: '800', textAlign: 'center' },
  smallAction: { marginTop: 14 },
  smallActionText: { textDecorationLine: 'underline' },

  headerRow: { 
    padding: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  progressText: { fontWeight: '700' },
  backSmall: { fontWeight: '700' },
  exitText: { fontWeight: '700' },

  progressBar: { height: 10, marginHorizontal: 16, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },

  jumpBar: { paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  jumpBtn: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  jumpBtnActive: {},
  jumpBtnAnswered: { borderWidth: 3 },
  jumpBtnText: { fontWeight: '800' },
  jumpBtnTextActive: { color: '#fff' },

  questionWrap: { padding: 20, paddingBottom: 40 },
  card: { padding: 24, borderRadius: 16, elevation: 3 },
  category: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 14, 
    fontWeight: '700',
    marginBottom: 16 
  },
  questionText: { lineHeight: 32, marginBottom: 10 },

  option: { 
    paddingVertical: 20, 
    paddingHorizontal: 16, 
    borderRadius: 14, 
    borderWidth: 2, 
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  optionSelected: {},
  optionText: { flex: 1 },
  optionTextSelected: { fontWeight: '800' },
  checkmark: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  navBtn: { 
    flex: 1, 
    paddingVertical: 18, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  navBtnText: { color: '#fff', fontWeight: '800' },
  navDisabled: {},
  navDisabledText: {},

  resultsContent: { padding: 24, alignItems: 'center' },
  resultsTitle: { fontWeight: '800', marginBottom: 16, textAlign: 'center' },

  badgeBox: { 
    width: '100%', 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center', 
    borderWidth: 3, 
    marginBottom: 20 
  },
  badgeLabel: { fontWeight: '900' },
  badgeScore: { fontWeight: '900', marginTop: 8 },
  badgeMsg: { marginTop: 12, textAlign: 'center', lineHeight: 24 },

  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2
  },
  statNumber: {
    fontWeight: '900'
  },
  statLabel: {
    marginTop: 4
  },

  domainHeader: {
    fontWeight: '700',
    marginBottom: 12,
    alignSelf: 'flex-start'
  },
  domainGrid: { 
    width: '100%', 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginTop: 8 
  },
  domainCard: { 
    width: '48%', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    elevation: 2 
  },
  domainTitle: { fontWeight: '800', marginBottom: 8 },
  domainPercent: { fontWeight: '900' },
  domainBar: { 
    height: 10, 
    borderRadius: 8, 
    overflow: 'hidden', 
    marginTop: 10 
  },
  domainFill: { height: '100%', borderRadius: 8 },
  domainSmall: { marginTop: 8 },

  resultNavRow: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-between', 
    marginBottom: 16,
    marginTop: 8,
    gap: 12
  },
  resultNavBtn: { 
    flex: 1,
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  resultNavBtnAlt: { 
    flex: 1,
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  resultNavText: { color: '#fff', fontWeight: '800' },
  resultNavTextAlt: { color: '#fff', fontWeight: '800' },

  retakeBtn: { 
    marginTop: 8, 
    paddingVertical: 16, 
    paddingHorizontal: 24, 
    borderRadius: 12,
    width: '100%'
  },
  retakeText: { fontWeight: '800', textAlign: 'center' }
});

export default MemoryTest;