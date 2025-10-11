// app/src/screens/Games/Attention/AttentionAssessment.tsx
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
  View,
  Vibration,
  BackHandler
} from 'react-native';
import { useSettings } from '@/app/contexts/SettingsContext';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

interface TaskConfig {
  id: number;
  name: string;
  duration: number;
  instructions: string;
  type: 'visual_search' | 'sustained_focus' | 'divided_attention';
}

interface TrialResult {
  taskId: number;
  trialNumber: number;
  targetPresent: boolean;
  responseGiven: boolean;
  responseTime: number | null;
  accuracy: boolean;
  timestamp: number;
}

interface AssessmentResult {
  userId?: string;
  totalTime: number;
  tasksCompleted: number;
  overallAccuracy: number;
  averageReactionTime: number;
  attentionScore: number;
  performanceLevel: string;
  task1Accuracy: number;
  task1AvgRT: number;
  task2Accuracy: number;
  task2AvgRT: number;
  task3Accuracy: number;
  task3AvgRT: number;
  rawResults: TrialResult[];
  completedAt: Date;
  cognitiveLevel: 'superior' | 'above_average' | 'average' | 'below_average' | 'needs_attention';
}

const STORAGE_KEY = 'attention_assessment_inprogress_v2';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const auth = getAuth();

// Task configurations
const TASK_CONFIGS: TaskConfig[] = [
  {
    id: 1,
    name: 'Visual Search',
    duration: 180, // 3 minutes
    instructions: 'Find the target symbol shown at the top. Tap it if you see it, or tap "No Target" if it\'s not present.',
    type: 'visual_search'
  },
  {
    id: 2,
    name: 'Sustained Focus',
    duration: 60, // 1 minute
    instructions: 'Tap the screen whenever you see the target symbol (🎯). Ignore other symbols.',
    type: 'sustained_focus'
  },
  {
    id: 3,
    name: 'Divided Attention',
    duration: 60, // 1 minute
    instructions: 'Tap the glowing symbols as quickly as possible. Multiple targets may appear at once.',
    type: 'divided_attention'
  }
];

// Task-specific constants
const TASK1_SYMBOLS = ['🔴', '🟢', '🔵', '🟡', '🟣'];
const TASK1_ROUNDS = 15;
const TASK1_GRID_SIZE = 16;

const TASK2_STIMULUS_INTERVAL = 2000;
const TASK2_TARGET_PROBABILITY = 0.3;

const TASK3_GRID_SIZE = 12;
const TASK3_TARGET_INTERVAL = 3000;
const TASK3_TARGET_DISPLAY_TIME = 2000;

type AssessmentPhase = 'intro' | 'task1' | 'task2' | 'task3' | 'complete';
type TaskState = 'instruction' | 'running' | 'complete';

interface GridItem {
  id: number;
  symbol: string;
  isTarget: boolean;
  isSelected: boolean;
}

const AttentionAssessment: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const [currentPhase, setCurrentPhase] = useState<AssessmentPhase>('intro');
  const [taskState, setTaskState] = useState<TaskState>('instruction');
  const [currentTask, setCurrentTask] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(TASK_CONFIGS.reduce((sum, task) => sum + task.duration, 0));
  const [taskTimeLeft, setTaskTimeLeft] = useState<number>(TASK_CONFIGS[0].duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [assessmentStarted, setAssessmentStarted] = useState<boolean>(false);
  const [restored, setRestored] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Task states
  const [task1Round, setTask1Round] = useState<number>(0);
  const [task1Items, setTask1Items] = useState<GridItem[]>([]);
  const [task1Target, setTask1Target] = useState<string>('');
  const [task1StartTime, setTask1StartTime] = useState<number>(0);
  
  const [task2StimulusCount, setTask2StimulusCount] = useState<number>(0);
  const [task2CurrentStimulus, setTask2CurrentStimulus] = useState<string>('');
  const [task2IsTarget, setTask2IsTarget] = useState<boolean>(false);
  const [task2ShowingStimulus, setTask2ShowingStimulus] = useState<boolean>(false);
  const [task2StartTime, setTask2StartTime] = useState<number>(0);
  
  const [task3Items, setTask3Items] = useState<GridItem[]>([]);
  const [task3ActiveTargets, setTask3ActiveTargets] = useState<Set<number>>(new Set());
  const [task3StartTime, setTask3StartTime] = useState<number>(0);
  const [task3TrialNumber, setTask3TrialNumber] = useState<number>(0);
  
  // Results tracking
  const [allResults, setAllResults] = useState<TrialResult[]>([]);
  const [currentTaskResults, setCurrentTaskResults] = useState<TrialResult[]>([]);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const taskIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stimulusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const task3IntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const task3TimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jumpRef = useRef<RNScrollView | null>(null);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#F7FAFC';
  const textColor = isDark ? '#fff' : PALETTE.teal;
  const mutedTextColor = isDark ? '#aaa' : '#64748b';
  const darkTextColor = isDark ? '#fff' : '#0f172a';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const cardBorderColor = isDark ? PALETTE.teal : PALETTE.lightTeal;
  const lightCardBg = isDark ? '#3a3a3a' : '#F0F9FF';
  const buttonBg = isDark ? '#3a3a3a' : PALETTE.lightTeal;
  const activeButtonBg = isDark ? '#4a3a00' : '#FEF3C7';
  const gridItemBg = isDark ? '#3a3a3a' : PALETTE.lightTeal;
  const inactiveGridBg = isDark ? '#2a2a2a' : '#F3F4F6';

  // Restore saved progress
  useEffect(() => {
    try { NotificationService.initialize(); } catch (e) { console.warn('Notification init failed', e); }
    const restore = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && saved.allResults) {
            Alert.alert('Resume Assessment?', 'Continue your previous attention assessment?', [
              { text: 'Start Fresh', style: 'destructive', onPress: async () => { HapticFeedbackService.buttonPress(); await AsyncStorage.removeItem(STORAGE_KEY); setRestored(true); } },
              { text: 'Resume', onPress: () => { 
                HapticFeedbackService.buttonPress(); 
                setAllResults(saved.allResults || []); 
                setCurrentTask(saved.currentTask || 0); 
                setCurrentPhase(saved.currentPhase || 'task1');
                setTaskState(saved.taskState || 'instruction');
                setTimeLeft(saved.timeLeft || timeLeft);
                setTaskTimeLeft(saved.taskTimeLeft || TASK_CONFIGS[0].duration);
                setAssessmentStarted(true);
                setRestored(true);
              } }
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
      try { 
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          allResults, 
          currentTask, 
          currentPhase,
          taskState,
          timeLeft, 
          taskTimeLeft,
          startTime: new Date().toISOString(), 
          savedAt: new Date().toISOString() 
        })); 
      } catch (e) { console.warn('Save failed', e); }
    };
    save();
  }, [allResults, currentTask, currentPhase, taskState, timeLeft, taskTimeLeft, assessmentStarted]);

  // Jump-bar auto-scroll
  useEffect(() => {
    if (currentPhase === 'intro' || currentPhase === 'complete') return;
    const buttonWidth = 70; const gap = 12;
    const totalWidth = TASK_CONFIGS.length * (buttonWidth + gap);
    const centerOffset = Math.max(0, (SCREEN_WIDTH / 2) - (buttonWidth / 2));
    const maxScroll = Math.max(0, totalWidth - SCREEN_WIDTH + 24);
    const targetX = Math.max(0, Math.min(maxScroll, currentTask * (buttonWidth + gap) - centerOffset));
    try { jumpRef.current?.scrollTo({ x: targetX, animated: true }); } catch { try { jumpRef.current?.scrollToEnd({ animated: true }); } catch {} }
  }, [currentTask, currentPhase]);

  // Prevent back button during assessment
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isRunning && assessmentStarted) {
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [isRunning, assessmentStarted]);

  // Main timer
  useEffect(() => {
    if (isRunning && timeLeft > 0 && assessmentStarted) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft, assessmentStarted]);

  // Task timer
  useEffect(() => {
    if (isRunning && taskTimeLeft > 0 && taskState === 'running' && assessmentStarted) {
      if (taskIntervalRef.current) clearInterval(taskIntervalRef.current);
      taskIntervalRef.current = setInterval(() => {
        setTaskTimeLeft(t => {
          if (t <= 1) {
            completeCurrentTask();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (taskIntervalRef.current) {
        clearInterval(taskIntervalRef.current);
        taskIntervalRef.current = null;
      }
    };
  }, [isRunning, taskTimeLeft, taskState, assessmentStarted]);

  // Time up - end assessment
  useEffect(() => {
    if (timeLeft <= 0 && assessmentStarted) {
      endAssessment();
    }
  }, [timeLeft, assessmentStarted]);

  // Task 1 - Generate visual search round
  const generateTask1Round = (round: number) => {
    const target = TASK1_SYMBOLS[round % TASK1_SYMBOLS.length];
    const distractors = TASK1_SYMBOLS.filter(s => s !== target);
    
    const items: GridItem[] = [];
    const targetCount = Math.random() < 0.7 ? 1 : 0;
    
    for (let i = 0; i < TASK1_GRID_SIZE; i++) {
      const shouldBeTarget = i === 0 && targetCount > 0;
      items.push({
        id: i,
        symbol: shouldBeTarget ? target : distractors[Math.floor(Math.random() * distractors.length)],
        isTarget: shouldBeTarget,
        isSelected: false,
      });
    }
    
    // Shuffle items
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    
    setTask1Items(items);
    setTask1Target(target);
    setTask1StartTime(Date.now());
  };

  // Task 1 - Handle item press
  const handleTask1ItemPress = (itemId: number) => {
    if (taskState !== 'running' || currentPhase !== 'task1') return;

    const item = task1Items.find(i => i.id === itemId);
    if (!item) return;

    const responseTime = Date.now() - task1StartTime;
    const isCorrect = item.isTarget;
    
    const result: TrialResult = {
      taskId: 1,
      trialNumber: task1Round + 1,
      targetPresent: task1Items.some(i => i.isTarget),
      responseGiven: true,
      responseTime,
      accuracy: isCorrect,
      timestamp: Date.now(),
    };
    
    setCurrentTaskResults(prev => [...prev, result]);
    
    if (isCorrect) {
      Vibration.vibrate(100);
    } else {
      Vibration.vibrate([50, 50, 50]);
    }

    setTimeout(() => {
      if (task1Round + 1 >= TASK1_ROUNDS) {
        completeCurrentTask();
      } else {
        setTask1Round(r => r + 1);
        generateTask1Round(task1Round + 1);
      }
    }, 500);
  };

  // Task 2 - Sustained attention stimulus presentation
  useEffect(() => {
    if (currentPhase === 'task2' && taskState === 'running' && isRunning && assessmentStarted) {
      const showStimulus = () => {
        const isTarget = Math.random() < TASK2_TARGET_PROBABILITY;
        const stimulus = isTarget ? '🎯' : ['○', '□', '△'][Math.floor(Math.random() * 3)];
        
        setTask2CurrentStimulus(stimulus);
        setTask2IsTarget(isTarget);
        setTask2ShowingStimulus(true);
        setTask2StartTime(Date.now());
        setTask2StimulusCount(prev => prev + 1);
        
        stimulusTimeoutRef.current = setTimeout(() => {
          setTask2ShowingStimulus(false);
          
          if (isTarget) {
            const result: TrialResult = {
              taskId: 2,
              trialNumber: task2StimulusCount + 1,
              targetPresent: true,
              responseGiven: false,
              responseTime: null,
              accuracy: false,
              timestamp: Date.now(),
            };
            setCurrentTaskResults(prev => [...prev, result]);
          }
        }, 1000);
      };

      if (task2StimulusCount === 0) {
        setTimeout(showStimulus, 1000);
      }

      const stimulusInterval = setInterval(showStimulus, TASK2_STIMULUS_INTERVAL);

      return () => {
        clearInterval(stimulusInterval);
        if (stimulusTimeoutRef.current) {
          clearTimeout(stimulusTimeoutRef.current);
        }
      };
    }
  }, [currentPhase, taskState, isRunning, task2StimulusCount, assessmentStarted]);

  // Task 2 - Handle response
  const handleTask2Response = () => {
    if (!task2ShowingStimulus || currentPhase !== 'task2' || taskState !== 'running') return;

    const responseTime = Date.now() - task2StartTime;
    const isCorrect = task2IsTarget;
    
    const result: TrialResult = {
      taskId: 2,
      trialNumber: task2StimulusCount,
      targetPresent: task2IsTarget,
      responseGiven: true,
      responseTime,
      accuracy: isCorrect,
      timestamp: Date.now(),
    };
    
    setCurrentTaskResults(prev => [...prev, result]);
    
    if (isCorrect) {
      Vibration.vibrate(100);
    } else {
      Vibration.vibrate([50, 50, 50]);
    }
  };

  // Task 3 - Initialize grid and start target activation cycle
  useEffect(() => {
    if (currentPhase === 'task3' && taskState === 'running' && isRunning && assessmentStarted) {
      // Initialize grid
      const items: GridItem[] = [];
      const symbols = ['●', '■', '▲'];
      
      for (let i = 0; i < TASK3_GRID_SIZE; i++) {
        items.push({
          id: i,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          isTarget: false,
          isSelected: false,
        });
      }
      
      setTask3Items(items);
      setTask3TrialNumber(0);
      
      const activateTargets = () => {
        const newTargets = new Set<number>();
        const targetCount = Math.floor(Math.random() * 2) + 1;
        
        while (newTargets.size < targetCount) {
          newTargets.add(Math.floor(Math.random() * TASK3_GRID_SIZE));
        }
        
        setTask3ActiveTargets(newTargets);
        setTask3StartTime(Date.now());
        setTask3TrialNumber(prev => prev + 1);
        
        task3TimeoutRef.current = setTimeout(() => {
          newTargets.forEach(targetId => {
            const result: TrialResult = {
              taskId: 3,
              trialNumber: task3TrialNumber + 1,
              targetPresent: true,
              responseGiven: false,
              responseTime: null,
              accuracy: false,
              timestamp: Date.now(),
            };
            setCurrentTaskResults(prev => [...prev, result]);
          });
          
          setTask3ActiveTargets(new Set());
        }, TASK3_TARGET_DISPLAY_TIME);
      };

      activateTargets();
      
      task3IntervalRef.current = setInterval(activateTargets, TASK3_TARGET_INTERVAL);

      return () => {
        if (task3IntervalRef.current) {
          clearInterval(task3IntervalRef.current);
          task3IntervalRef.current = null;
        }
        if (task3TimeoutRef.current) {
          clearTimeout(task3TimeoutRef.current);
          task3TimeoutRef.current = null;
        }
      };
    }
  }, [currentPhase, taskState, isRunning, assessmentStarted]);

  // Task 3 - Handle item press
  const handleTask3ItemPress = (itemId: number) => {
    if (currentPhase !== 'task3' || taskState !== 'running' || !isRunning) return;
    if (task3ActiveTargets.size === 0) return;

    const responseTime = Date.now() - task3StartTime;
    const isCorrect = task3ActiveTargets.has(itemId);
    
    const result: TrialResult = {
      taskId: 3,
      trialNumber: task3TrialNumber,
      targetPresent: true,
      responseGiven: true,
      responseTime,
      accuracy: isCorrect,
      timestamp: Date.now(),
    };
    
    setCurrentTaskResults(prev => [...prev, result]);
    
    if (isCorrect) {
      Vibration.vibrate(100);
      setTask3ActiveTargets(prev => {
        const newTargets = new Set(prev);
        newTargets.delete(itemId);
        return newTargets;
      });
    } else {
      Vibration.vibrate([50, 50, 50]);
    }
  };

  const startAssessment = () => { 
    HapticFeedbackService.gameStart(); 
    setAssessmentStarted(true); 
    setCurrentPhase('task1'); 
    setCurrentTask(0);
    setTaskTimeLeft(TASK_CONFIGS[0].duration);
    setTimeLeft(TASK_CONFIGS.reduce((sum, task) => sum + task.duration, 0));
    setAllResults([]);
    setCurrentTaskResults([]);
  };

  const startTask = () => {
    setIsRunning(true);
    setTaskState('running');

    switch (currentPhase) {
      case 'task1':
        generateTask1Round(0);
        break;
      case 'task2':
        break;
      case 'task3':
        break;
    }
  };

  const completeCurrentTask = () => {
    setTaskState('complete');
    setAllResults(prev => [...prev, ...currentTaskResults]);
    setCurrentTaskResults([]);
    
    if (task3IntervalRef.current) {
      clearInterval(task3IntervalRef.current);
      task3IntervalRef.current = null;
    }
    if (task3TimeoutRef.current) {
      clearTimeout(task3TimeoutRef.current);
      task3TimeoutRef.current = null;
    }

    setTimeout(() => {
      const nextTask = currentTask + 1;
      if (nextTask < TASK_CONFIGS.length) {
        setCurrentTask(nextTask);
        setCurrentPhase(`task${nextTask + 1}` as AssessmentPhase);
        setTaskTimeLeft(TASK_CONFIGS[nextTask].duration);
        setTask1Round(0);
        setTask2StimulusCount(0);
        setTask3TrialNumber(0);
      } else {
        endAssessment();
        return;
      }
      setTaskState('instruction');
    }, 2000);
  };

  const calculateResults = (): AssessmentResult => {
    const finalResults = [...allResults, ...currentTaskResults];
    
    // Calculate overall metrics
    const totalTrials = finalResults.length;
    const correctResponses = finalResults.filter(r => r.accuracy).length;
    const overallAccuracy = totalTrials > 0 ? Math.round((correctResponses / totalTrials) * 100) : 0;
    
    const validResponseTimes = finalResults.filter(r => r.responseTime !== null && r.responseTime! < 5000);
    const averageReactionTime = validResponseTimes.length > 0 
      ? Math.round(validResponseTimes.reduce((sum, r) => sum + (r.responseTime || 0), 0) / validResponseTimes.length)
      : 0;

    // Calculate task-specific metrics
    const task1Results = finalResults.filter(r => r.taskId === 1);
    const task2Results = finalResults.filter(r => r.taskId === 2);
    const task3Results = finalResults.filter(r => r.taskId === 3);

    const calculateTaskMetrics = (taskResults: TrialResult[]) => {
      const correct = taskResults.filter(r => r.accuracy).length;
      const total = taskResults.length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      const responseTimes = taskResults
        .filter(r => r.responseTime !== null && r.responseTime! < 5000)
        .map(r => r.responseTime!);
      
      const avgRT = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length)
        : 0;

      return { accuracy, avgRT };
    };

    const task1Metrics = calculateTaskMetrics(task1Results);
    const task2Metrics = calculateTaskMetrics(task2Results);
    const task3Metrics = calculateTaskMetrics(task3Results);

    // Calculate attention score
    const task1Score = (task1Metrics.accuracy * 0.3) + Math.max(0, (2000 - task1Metrics.avgRT) / 20);
    const task2Score = (task2Metrics.accuracy * 0.4) + Math.max(0, (1500 - task2Metrics.avgRT) / 15);
    const task3Score = (task3Metrics.accuracy * 0.5) + Math.max(0, (1200 - task3Metrics.avgRT) / 12);

    const attentionScore = Math.max(0, Math.min(100, Math.round((task1Score * 0.3 + task2Score * 0.4 + task3Score * 0.3))));

    // Determine cognitive level
    let cognitiveLevel: AssessmentResult['cognitiveLevel'] = 'needs_attention';
    if (attentionScore >= 85) cognitiveLevel = 'superior';
    else if (attentionScore >= 70) cognitiveLevel = 'above_average';
    else if (attentionScore >= 55) cognitiveLevel = 'average';
    else if (attentionScore >= 40) cognitiveLevel = 'below_average';

    const performanceLevel = cognitiveLevel.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return {
      userId: auth.currentUser?.uid,
      totalTime: timeLeft > 0 ? (TASK_CONFIGS.reduce((sum, task) => sum + task.duration, 0) - timeLeft) : 0,
      tasksCompleted: currentTask + 1,
      overallAccuracy,
      averageReactionTime,
      attentionScore,
      performanceLevel,
      task1Accuracy: task1Metrics.accuracy,
      task1AvgRT: task1Metrics.avgRT,
      task2Accuracy: task2Metrics.accuracy,
      task2AvgRT: task2Metrics.avgRT,
      task3Accuracy: task3Metrics.accuracy,
      task3AvgRT: task3Metrics.avgRT,
      rawResults: finalResults,
      completedAt: new Date(),
      cognitiveLevel
    };
  };

  const saveToFirestore = async (results: AssessmentResult) => {
    const userId = auth.currentUser?.uid;
    if (!userId) { Alert.alert('Login Required', 'Please login to save results.'); return false; }
    try {
      setIsLoading(true);
      const docRef = await addDoc(collection(firestore, `users/${userId}/attentionResults`), { 
        ...results, 
        createdAt: serverTimestamp(), 
        assessmentType: 'cognitive_attention_comprehensive' 
      });
      console.log('Attention assessment saved', docRef.id);
      HapticFeedbackService.achievement();
      try { await NotificationService.sendLocalNotification('Attention Assessment Complete! 🎯', `Score: ${results.attentionScore}% - ${results.performanceLevel}`); } catch {}
      await AsyncStorage.removeItem(STORAGE_KEY); 
      return true;
    } catch (error) {
      console.error('Save failed', error); 
      HapticFeedbackService.wrongAnswer();
      try { await NotificationService.sendLocalNotification('Save Failed', 'Unable to save attention assessment results.'); } catch {}
      Alert.alert('Save Failed', 'Unable to save results. Please check your connection.'); 
      return false;
    } finally { setIsLoading(false); }
  };

  const endAssessment = async () => {
    HapticFeedbackService.gameEnd(); 
    setIsRunning(false);
    setCurrentPhase('complete');
    
    // Clean up all intervals and timeouts
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (taskIntervalRef.current) clearInterval(taskIntervalRef.current);
    if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
    if (task3IntervalRef.current) clearInterval(task3IntervalRef.current);
    if (task3TimeoutRef.current) clearTimeout(task3TimeoutRef.current);

    const results = calculateResults();
    const saved = await saveToFirestore(results);
    if (saved) {
      setCurrentPhase('complete');
    }
  };

  const resetAssessment = async () => { 
    HapticFeedbackService.buttonPress(); 
    await AsyncStorage.removeItem(STORAGE_KEY); 
    setAssessmentStarted(false); 
    setCurrentPhase('intro'); 
    setCurrentTask(0);
    setTaskState('instruction');
    setAllResults([]); 
    setCurrentTaskResults([]); 
    setIsRunning(false);
    setTimeLeft(TASK_CONFIGS.reduce((sum, task) => sum + task.duration, 0));
  };

  const exitAssessment = async () => { 
    HapticFeedbackService.buttonPress(); 
    Alert.alert('Exit Assessment', 'Your progress will be saved. You can resume later.', [
      { text: 'Cancel', style: 'cancel', onPress: () => HapticFeedbackService.buttonPress() }, 
      { text: 'Exit', onPress: () => { HapticFeedbackService.buttonPress(); navigation.goBack(); } }
    ]); 
  };

  const jumpToTask = (idx: number) => { 
    if (idx <= currentTask) {
      HapticFeedbackService.buttonPress(); 
      setCurrentTask(idx); 
      setCurrentPhase(`task${idx + 1}` as AssessmentPhase);
      setTaskTimeLeft(TASK_CONFIGS[idx].duration);
      setTaskState('instruction');
    }
  };

  const getCognitiveBadge = (level: string) => {
    switch(level){
      case 'superior': return { label: 'Superior', color: PALETTE.teal, emoji: '🌟', text: 'Outstanding attention abilities!' };
      case 'above_average': return { label: 'Above Average', color: '#059669', emoji: '👍', text: 'Strong attention skills with good focus.' };
      case 'average': return { label: 'Average', color: PALETTE.orange, emoji: '💪', text: 'Normal attention abilities with room for improvement.' };
      case 'below_average': return { label: 'Below Average', color: '#DC2626', emoji: '📋', text: 'Attention skills could benefit from training.' };
      case 'needs_attention': return { label: 'Needs Attention', color: PALETTE.red, emoji: '🎯', text: 'Consider professional evaluation and training.' };
      default: return { label: 'Unknown', color: '#666', emoji: '❓', text: '' };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- UI Rendering ---

  if (!assessmentStarted && restored && currentPhase === 'intro') {
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
          }]}>🎯 Attention Assessment</Text>
          
          <Text style={[styles.largeSubtitle, { 
            color: mutedTextColor,
            fontSize: 20 * fontScale 
          }]}>Measure your focus & concentration</Text>

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
            }]}>• 🔍 Visual search abilities</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• ⏱️ Sustained focus over time</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• 🎯 Divided attention skills</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• ⚡ Reaction time and accuracy</Text>
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
            }]}>• ✅ 3 comprehensive tasks</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• ⏱️ Takes about 5 minutes total</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• 💾 Progress saved automatically</Text>
            
            <Text style={[styles.welcomeLine, { 
              color: mutedTextColor,
              fontSize: 18 * fontScale 
            }]}>• 📊 Detailed performance analysis</Text>
          </View>

          <TouchableOpacity style={[styles.startButton, { backgroundColor: PALETTE.teal }]} onPress={startAssessment} activeOpacity={0.8} accessibilityLabel="Start attention assessment">
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
  if (currentPhase === 'complete') {
    const results = calculateResults();
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
            }]}>{results.attentionScore}%</Text>
            
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
              }]}>{results.tasksCompleted}</Text>
              <Text style={[styles.statLabel, { 
                color: mutedTextColor,
                fontSize: 14 * fontScale 
              }]}>Tasks Completed</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.statNumber, { 
                color: PALETTE.teal,
                fontSize: 32 * fontScale 
              }]}>{results.overallAccuracy}%</Text>
              <Text style={[styles.statLabel, { 
                color: mutedTextColor,
                fontSize: 14 * fontScale 
              }]}>Accuracy</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.statNumber, { 
                color: PALETTE.teal,
                fontSize: 32 * fontScale 
              }]}>{Math.floor(results.totalTime / 60)}m</Text>
              <Text style={[styles.statLabel, { 
                color: mutedTextColor,
                fontSize: 14 * fontScale 
              }]}>Time</Text>
            </View>
          </View>

          <Text style={[styles.domainHeader, { 
            color: darkTextColor,
            fontSize: 20 * fontScale 
          }]}>Performance by Task</Text>
          
          <View style={styles.domainGrid}>
            {results.tasksCompleted >= 1 && (
              <View style={[styles.domainCard, { backgroundColor: cardBg }]}>
                <Text style={[styles.domainTitle, { 
                  color: darkTextColor,
                  fontSize: 13 * fontScale 
                }]}>VISUAL SEARCH</Text>
                <Text style={[styles.domainPercent, { 
                  color: PALETTE.teal,
                  fontSize: 28 * fontScale 
                }]}>{results.task1Accuracy}%</Text>
                <View style={[styles.domainBar, { backgroundColor: isDark ? '#3a3a3a' : '#EEF2FF' }]}>
                  <View style={[styles.domainFill, { width: `${results.task1Accuracy}%`, backgroundColor: PALETTE.teal }]} />
                </View>
                <Text style={[styles.domainSmall, { 
                  color: mutedTextColor,
                  fontSize: 13 * fontScale 
                }]}>Avg RT: {results.task1AvgRT}ms</Text>
              </View>
            )}

            {results.tasksCompleted >= 2 && (
              <View style={[styles.domainCard, { backgroundColor: cardBg }]}>
                <Text style={[styles.domainTitle, { 
                  color: darkTextColor,
                  fontSize: 13 * fontScale 
                }]}>SUSTAINED FOCUS</Text>
                <Text style={[styles.domainPercent, { 
                  color: PALETTE.teal,
                  fontSize: 28 * fontScale 
                }]}>{results.task2Accuracy}%</Text>
                <View style={[styles.domainBar, { backgroundColor: isDark ? '#3a3a3a' : '#EEF2FF' }]}>
                  <View style={[styles.domainFill, { width: `${results.task2Accuracy}%`, backgroundColor: PALETTE.teal }]} />
                </View>
                <Text style={[styles.domainSmall, { 
                  color: mutedTextColor,
                  fontSize: 13 * fontScale 
                }]}>Avg RT: {results.task2AvgRT}ms</Text>
              </View>
            )}

            {results.tasksCompleted >= 3 && (
              <View style={[styles.domainCard, { backgroundColor: cardBg }]}>
                <Text style={[styles.domainTitle, { 
                  color: darkTextColor,
                  fontSize: 13 * fontScale 
                }]}>DIVIDED ATTENTION</Text>
                <Text style={[styles.domainPercent, { 
                  color: PALETTE.teal,
                  fontSize: 28 * fontScale 
                }]}>{results.task3Accuracy}%</Text>
                <View style={[styles.domainBar, { backgroundColor: isDark ? '#3a3a3a' : '#EEF2FF' }]}>
                  <View style={[styles.domainFill, { width: `${results.task3Accuracy}%`, backgroundColor: PALETTE.teal }]} />
                </View>
                <Text style={[styles.domainSmall, { 
                  color: mutedTextColor,
                  fontSize: 13 * fontScale 
                }]}>Avg RT: {results.task3AvgRT}ms</Text>
              </View>
            )}
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

  // --- Task screens ---
  const currentTaskConfig = TASK_CONFIGS[currentTask];
  const progress = Math.round(((currentTask + 1) / TASK_CONFIGS.length) * 100);

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
          }]}>Task {currentTask + 1} / {TASK_CONFIGS.length}</Text>
        
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
        {TASK_CONFIGS.map((task, idx) => {
          const taskCompleted = idx < currentTask;
          const active = idx === currentTask;
          return (
            <TouchableOpacity key={task.id} onPress={() => jumpToTask(idx)} accessibilityLabel={`Jump to task ${idx + 1}`} activeOpacity={0.7} style={[
              styles.jumpBtn, 
              { backgroundColor: isDark ? '#3a3a3a' : '#F1F5F9' },
              active ? [styles.jumpBtnActive, { backgroundColor: PALETTE.teal }] : null, 
              taskCompleted ? [styles.jumpBtnAnswered, { borderColor: PALETTE.orange }] : null
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
        {taskState === 'instruction' && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.category, { 
              color: PALETTE.teal, 
              backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal,
              fontSize: 13 * fontScale 
            }]}>{currentTaskConfig.name.toUpperCase()}</Text>
            
            <Text style={[styles.questionText, { 
              fontSize: 22 * fontScale, 
              lineHeight: 32 * fontScale,
              color: darkTextColor 
            }]}>{currentTaskConfig.instructions}</Text>

            <TouchableOpacity
              style={[styles.startTaskButton, { backgroundColor: PALETTE.teal }]}
              onPress={startTask}
            >
              <Text style={[styles.startTaskButtonText, { fontSize: 20 * fontScale }]}>
                Start {currentTaskConfig.name}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {taskState === 'running' && currentPhase === 'task1' && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.category, { 
              color: PALETTE.teal, 
              backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal,
              fontSize: 13 * fontScale 
            }]}>VISUAL SEARCH</Text>
            
            <Text style={[styles.questionText, { 
              fontSize: 22 * fontScale, 
              lineHeight: 32 * fontScale,
              color: darkTextColor,
              textAlign: 'center',
              marginBottom: 20
            }]}>Find: {task1Target}</Text>

            <View style={styles.gridContainer}>
              {task1Items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: gridItemBg,
                      borderColor: cardBorderColor,
                    }
                  ]}
                  onPress={() => handleTask1ItemPress(item.id)}
                >
                  <Text style={{ fontSize: 24 }}>{item.symbol}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.noTargetButton, { backgroundColor: PALETTE.orange }]}
              onPress={() => {
                const result: TrialResult = {
                  taskId: 1,
                  trialNumber: task1Round + 1,
                  targetPresent: task1Items.some(i => i.isTarget),
                  responseGiven: false,
                  responseTime: Date.now() - task1StartTime,
                  accuracy: !task1Items.some(i => i.isTarget),
                  timestamp: Date.now(),
                };
                setCurrentTaskResults(prev => [...prev, result]);

                setTimeout(() => {
                  if (task1Round + 1 >= TASK1_ROUNDS) {
                    completeCurrentTask();
                  } else {
                    setTask1Round(r => r + 1);
                    generateTask1Round(task1Round + 1);
                  }
                }, 500);
              }}
            >
              <Text style={[styles.noTargetButtonText, { fontSize: 18 * fontScale }]}>
                No Target
              </Text>
            </TouchableOpacity>

            <Text style={[styles.roundText, { 
              color: mutedTextColor,
              fontSize: 16 * fontScale 
            }]}>
              Round: {task1Round + 1}/{TASK1_ROUNDS}
            </Text>
          </View>
        )}

        {taskState === 'running' && currentPhase === 'task2' && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.category, { 
              color: PALETTE.teal, 
              backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal,
              fontSize: 13 * fontScale 
            }]}>SUSTAINED FOCUS</Text>
            
            <Text style={[styles.questionText, { 
              fontSize: 20 * fontScale, 
              lineHeight: 28 * fontScale,
              color: darkTextColor,
              textAlign: 'center',
              marginBottom: 30
            }]}>Tap when you see the target: 🎯</Text>

            <View style={styles.stimulusContainer}>
              <TouchableOpacity
                style={[
                  styles.stimulusButton,
                  {
                    backgroundColor: task2ShowingStimulus ? buttonBg : inactiveGridBg,
                    borderColor: task2IsTarget ? PALETTE.teal : (isDark ? '#666' : '#D1D5DB'),
                  }
                ]}
                onPress={handleTask2Response}
              >
                <Text style={{ fontSize: 60 }}>
                  {task2ShowingStimulus ? task2CurrentStimulus : ''}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.roundText, { 
              color: mutedTextColor,
              fontSize: 16 * fontScale 
            }]}>
              Stimuli shown: {task2StimulusCount}
            </Text>
          </View>
        )}

        {taskState === 'running' && currentPhase === 'task3' && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.category, { 
              color: PALETTE.teal, 
              backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal,
              fontSize: 13 * fontScale 
            }]}>DIVIDED ATTENTION</Text>
            
            <Text style={[styles.questionText, { 
              fontSize: 20 * fontScale, 
              lineHeight: 28 * fontScale,
              color: darkTextColor,
              textAlign: 'center',
              marginBottom: 20
            }]}>Tap the Glowing Symbols</Text>

            <View style={styles.gridContainer}>
              {task3Items.map((item) => {
                const isActive = task3ActiveTargets.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.gridItem,
                      {
                        backgroundColor: isActive ? activeButtonBg : gridItemBg,
                        borderColor: isActive ? PALETTE.orange : cardBorderColor,
                        borderWidth: isActive ? 3 : 2,
                        shadowColor: isActive ? PALETTE.orange : 'transparent',
                        shadowOpacity: isActive ? 0.8 : 0,
                        shadowRadius: isActive ? 10 : 0,
                        elevation: isActive ? 8 : 0,
                      }
                    ]}
                    onPress={() => handleTask3ItemPress(item.id)}
                  >
                    <Text style={{ fontSize: 28 }}>{item.symbol}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.roundText, { 
              color: mutedTextColor,
              fontSize: 16 * fontScale 
            }]}>
              Active targets: {task3ActiveTargets.size} | Trial: {task3TrialNumber}
            </Text>
          </View>
        )}

        {taskState === 'complete' && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.questionText, { 
              fontSize: 24 * fontScale, 
              lineHeight: 32 * fontScale,
              color: PALETTE.teal,
              textAlign: 'center'
            }]}>
              Task {currentTask + 1} Complete! {currentTask < TASK_CONFIGS.length - 1 ? 'Preparing next task...' : 'Calculating results...'}
            </Text>
          </View>
        )}
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
  startTaskButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20
  },
  startTaskButtonText: { color: '#fff', fontWeight: '800' },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20
  },
  gridItem: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2
  },
  noTargetButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  noTargetButtonText: { color: '#fff', fontWeight: '800' },
  roundText: { textAlign: 'center' },
  stimulusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30
  },
  stimulusButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4
  },
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
  statNumber: { fontWeight: '900' },
  statLabel: { marginTop: 4 },
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

export default AttentionAssessment;