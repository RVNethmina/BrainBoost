// app/src/screens/Games/Attention/AttentionAssessmentRun.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration, BackHandler } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext"; // Add this import

type AttentionAssessmentRunNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AttentionAssessmentRun"
>;

const TOTAL_TIME = 660; // 11 minutes total
const TASK_TIMES = [180, 180, 180]; // 4min, 4min, 3min per task

// Task 1: Visual Search
const TASK1_SYMBOLS = ['🔴', '🟢', '🔵', '🟡', '🟣'];
const TASK1_ROUNDS = 20;
const TASK1_GRID_SIZE = 16;

// Task 2: Sustained Attention  
const TASK2_DURATION = 240; // 4 minutes
const TASK2_STIMULUS_INTERVAL = 2000; // Show stimulus every 2 seconds
const TASK2_TARGET_PROBABILITY = 0.3; // 30% chance of target

// Task 3: Divided Attention
const TASK3_DURATION = 180; // 3 minutes
const TASK3_GRID_SIZE = 12;
const TASK3_TARGET_INTERVAL = 3000; // New target every 3 seconds
const TASK3_TARGET_DISPLAY_TIME = 2000; // Targets visible for 2 seconds

type AssessmentPhase = 'task1' | 'task2' | 'task3' | 'complete';
type TaskState = 'instruction' | 'running' | 'complete';

type GridItem = {
  id: number;
  symbol: string;
  isTarget: boolean;
  isSelected: boolean;
};

type TrialResult = {
  taskId: number;
  trialNumber: number;
  targetPresent: boolean;
  responseGiven: boolean;
  responseTime: number | null;
  accuracy: boolean;
  timestamp: number;
};

const AttentionAssessmentRun: React.FC = () => {
  const navigation = useNavigation<AttentionAssessmentRunNavigationProp>();
  // Add settings hook
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';
  
  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const headerBg = isDark ? '#2a2a2a' : PALETTE.teal;
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const buttonBg = isDark ? '#3a3a3a' : PALETTE.lightTeal;
  const activeButtonBg = isDark ? '#4a3a00' : '#FEF3C7';
  const secondaryTextColor = isDark ? '#ccc' : PALETTE.gray;
  const borderColor = isDark ? '#444' : PALETTE.teal;
  const gridItemBg = isDark ? '#3a3a3a' : PALETTE.lightTeal;
  const inactiveGridBg = isDark ? '#2a2a2a' : '#F3F4F6';

  const [currentPhase, setCurrentPhase] = useState<AssessmentPhase>('task1');
  const [taskState, setTaskState] = useState<TaskState>('instruction');
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);
  const [taskTimeLeft, setTaskTimeLeft] = useState<number>(TASK_TIMES[0]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // Task 1 - Visual Search
  const [task1Round, setTask1Round] = useState<number>(0);
  const [task1Items, setTask1Items] = useState<GridItem[]>([]);
  const [task1Target, setTask1Target] = useState<string>('');
  const [task1StartTime, setTask1StartTime] = useState<number>(0);
  
  // Task 2 - Sustained Attention
  const [task2StimulusCount, setTask2StimulusCount] = useState<number>(0);
  const [task2CurrentStimulus, setTask2CurrentStimulus] = useState<string>('');
  const [task2IsTarget, setTask2IsTarget] = useState<boolean>(false);
  const [task2ShowingStimulus, setTask2ShowingStimulus] = useState<boolean>(false);
  const [task2StartTime, setTask2StartTime] = useState<number>(0);
  
  // Task 3 - Divided Attention
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

  // Prevent back button during assessment
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isRunning) {
        return true; // Prevent going back
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isRunning]);

  // Main timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
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
  }, [isRunning, timeLeft]);

  // Task timer
  useEffect(() => {
    if (isRunning && taskTimeLeft > 0 && taskState === 'running') {
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
  }, [isRunning, taskTimeLeft, taskState]);

  // Time up - end assessment
  useEffect(() => {
    if (timeLeft <= 0) {
      endAssessment();
    }
  }, [timeLeft]);

  // Task 1 - Generate visual search round
  const generateTask1Round = (round: number) => {
    const target = TASK1_SYMBOLS[round % TASK1_SYMBOLS.length];
    const distractors = TASK1_SYMBOLS.filter(s => s !== target);
    
    const items: GridItem[] = [];
    const targetCount = Math.random() < 0.7 ? 1 : 0; // 70% chance of target present
    
    for (let i = 0; i < TASK1_GRID_SIZE; i++) {
      const shouldBeTarget = i === 0 && targetCount > 0; // Place target in first position, then shuffle
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
    
    // Record result
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

    // Move to next round
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
    if (currentPhase === 'task2' && taskState === 'running' && isRunning) {
      const showStimulus = () => {
        const isTarget = Math.random() < TASK2_TARGET_PROBABILITY;
        const stimulus = isTarget ? '🎯' : ['○', '□', '△'][Math.floor(Math.random() * 3)];
        
        setTask2CurrentStimulus(stimulus);
        setTask2IsTarget(isTarget);
        setTask2ShowingStimulus(true);
        setTask2StartTime(Date.now());
        setTask2StimulusCount(prev => prev + 1);
        
        // Hide stimulus after 1 second
        stimulusTimeoutRef.current = setTimeout(() => {
          setTask2ShowingStimulus(false);
          
          // Record missed target if no response given
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

      // Start with first stimulus
      if (task2StimulusCount === 0) {
        setTimeout(showStimulus, 1000);
      }

      // Schedule regular stimuli
      const stimulusInterval = setInterval(showStimulus, TASK2_STIMULUS_INTERVAL);

      return () => {
        clearInterval(stimulusInterval);
        if (stimulusTimeoutRef.current) {
          clearTimeout(stimulusTimeoutRef.current);
        }
      };
    }
  }, [currentPhase, taskState, isRunning, task2StimulusCount]);

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
    if (currentPhase === 'task3' && taskState === 'running' && isRunning) {
      console.log('🎯 Task 3 starting - initializing grid');
      
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
      
      // Function to activate targets
      const activateTargets = () => {
        console.log('🎯 Activating new targets');
        const newTargets = new Set<number>();
        const targetCount = Math.floor(Math.random() * 2) + 1; // 1-2 targets
        
        while (newTargets.size < targetCount) {
          newTargets.add(Math.floor(Math.random() * TASK3_GRID_SIZE));
        }
        
        setTask3ActiveTargets(newTargets);
        setTask3StartTime(Date.now());
        setTask3TrialNumber(prev => prev + 1);
        
        // Record missed targets after display time
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
          
          // Deactivate targets
          setTask3ActiveTargets(new Set());
          console.log('🎯 Targets deactivated');
        }, TASK3_TARGET_DISPLAY_TIME);
      };

      // Start immediately
      activateTargets();
      
      // Then repeat every TASK3_TARGET_INTERVAL
      task3IntervalRef.current = setInterval(activateTargets, TASK3_TARGET_INTERVAL);

      // Cleanup function
      return () => {
        console.log('🎯 Task 3 cleanup');
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
  }, [currentPhase, taskState, isRunning]);

  // Task 3 - Handle item press
  const handleTask3ItemPress = (itemId: number) => {
    if (currentPhase !== 'task3' || taskState !== 'running' || !isRunning) return;
    if (task3ActiveTargets.size === 0) return;

    const responseTime = Date.now() - task3StartTime;
    const isCorrect = task3ActiveTargets.has(itemId);
    
    console.log('🎯 Task 3 item pressed:', { itemId, isCorrect, activeTargets: task3ActiveTargets.size });
    
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
      // Remove the correctly selected target
      setTask3ActiveTargets(prev => {
        const newTargets = new Set(prev);
        newTargets.delete(itemId);
        return newTargets;
      });
    } else {
      Vibration.vibrate([50, 50, 50]);
    }
  };

  const startTask = () => {
    setIsRunning(true);
    setTaskState('running');

    switch (currentPhase) {
      case 'task1':
        generateTask1Round(0);
        break;
      case 'task2':
        // Task 2 stimulus presentation is handled by useEffect
        break;
      case 'task3':
        // Task 3 is handled by useEffect
        console.log('🎯 Task 3 start triggered');
        break;
    }
  };

  const completeCurrentTask = () => {
    setTaskState('complete');
    setAllResults(prev => [...prev, ...currentTaskResults]);
    setCurrentTaskResults([]);
    
    // Clean up task-specific intervals
    if (task3IntervalRef.current) {
      clearInterval(task3IntervalRef.current);
      task3IntervalRef.current = null;
    }
    if (task3TimeoutRef.current) {
      clearTimeout(task3TimeoutRef.current);
      task3TimeoutRef.current = null;
    }

    // Move to next task
    setTimeout(() => {
      switch (currentPhase) {
        case 'task1':
          setCurrentPhase('task2');
          setTaskTimeLeft(TASK_TIMES[1]);
          setTask2StimulusCount(0);
          break;
        case 'task2':
          setCurrentPhase('task3');
          setTaskTimeLeft(TASK_TIMES[2]);
          break;
        case 'task3':
          endAssessment();
          return;
      }
      setTaskState('instruction');
    }, 2000);
  };

  const endAssessment = () => {
    setIsRunning(false);
    setCurrentPhase('complete');
    
    // Clean up all intervals and timeouts
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (taskIntervalRef.current) clearInterval(taskIntervalRef.current);
    if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
    if (task3IntervalRef.current) clearInterval(task3IntervalRef.current);
    if (task3TimeoutRef.current) clearTimeout(task3TimeoutRef.current);

    const finalResults = [...allResults, ...currentTaskResults];
    
    // Calculate overall metrics
    const totalTrials = finalResults.length;
    const correctResponses = finalResults.filter(r => r.accuracy).length;
    const accuracy = totalTrials > 0 ? Math.round((correctResponses / totalTrials) * 100) : 0;
    const avgReactionTime = finalResults
      .filter(r => r.responseTime !== null)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
      finalResults.filter(r => r.responseTime !== null).length || 0;

    console.log('📊 Assessment complete:', { totalTrials, correctResponses, accuracy });

    // Navigate to results
    navigation.navigate('AttentionAssessmentResult', {
      totalTime: TOTAL_TIME - timeLeft,
      results: finalResults,
      overallAccuracy: accuracy,
      averageReactionTime: Math.round(avgReactionTime),
      tasksCompleted: currentPhase === 'complete' ? 3 : 
        currentPhase === 'task3' ? 2 : 
        currentPhase === 'task2' ? 1 : 0,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTaskNumber = () => {
    switch (currentPhase) {
      case 'task1': return 1;
      case 'task2': return 2;
      case 'task3': return 3;
      default: return 1;
    }
  };

  const getCurrentTaskName = () => {
    switch (currentPhase) {
      case 'task1': return 'Visual Search';
      case 'task2': return 'Sustained Focus';
      case 'task3': return 'Divided Attention';
      default: return 'Assessment';
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pt-10 pb-4"
        style={{ backgroundColor: headerBg }}
      >
        <View className="items-center">
          <Text 
            className="text-sm text-white"
            style={{ fontSize: 14 * fontScale }}
          >
            Task {getCurrentTaskNumber()}/3
          </Text>
          <Text 
            className="text-lg font-bold text-white"
            style={{ fontSize: 18 * fontScale }}
          >
            {getCurrentTaskName()}
          </Text>
        </View>

        <View className="items-center">
          <Text 
            className="text-sm text-white"
            style={{ fontSize: 14 * fontScale }}
          >
            Time Remaining
          </Text>
          <Text 
            className="text-xl font-bold text-white"
            style={{ fontSize: 20 * fontScale }}
          >
            {formatTime(taskTimeLeft)}
          </Text>
        </View>

        <View className="items-center">
          <Text 
            className="text-sm text-white"
            style={{ fontSize: 14 * fontScale }}
          >
            Total
          </Text>
          <Text 
            className="text-lg font-bold text-white"
            style={{ fontSize: 18 * fontScale }}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Task Content */}
      <View className="justify-center flex-1 px-5">
        {taskState === 'instruction' && (
          <View
            className="p-6 mb-8 border shadow-sm rounded-2xl"
            style={{ 
              backgroundColor: cardBg, 
              borderColor: borderColor,
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {currentPhase === 'task1' && (
              <>
                <Text 
                  className="mb-4 text-2xl font-bold text-center"
                  style={{ 
                    fontSize: 24 * fontScale,
                    color: PALETTE.teal 
                  }}
                >
                  Task 1: Visual Search
                </Text>
                <Text 
                  className="mb-6 text-lg text-center"
                  style={{ 
                    fontSize: 18 * fontScale,
                    color: textColor 
                  }}
                >
                  Find the target symbol shown at the top. Tap it if you see it, or tap "No Target" if it's not present.
                </Text>
              </>
            )}

            {currentPhase === 'task2' && (
              <>
                <Text 
                  className="mb-4 text-2xl font-bold text-center"
                  style={{ 
                    fontSize: 24 * fontScale,
                    color: PALETTE.teal 
                  }}
                >
                  Task 2: Sustained Focus
                </Text>
                <Text 
                  className="mb-6 text-lg text-center"
                  style={{ 
                    fontSize: 18 * fontScale,
                    color: textColor 
                  }}
                >
                  Tap the screen whenever you see the target symbol (🎯). Ignore other symbols.
                </Text>
              </>
            )}

            {currentPhase === 'task3' && (
              <>
                <Text 
                  className="mb-4 text-2xl font-bold text-center"
                  style={{ 
                    fontSize: 24 * fontScale,
                    color: PALETTE.teal 
                  }}
                >
                  Task 3: Divided Attention
                </Text>
                <Text 
                  className="mb-6 text-lg text-center"
                  style={{ 
                    fontSize: 18 * fontScale,
                    color: textColor 
                  }}
                >
                  Tap the glowing symbols as quickly as possible. Multiple targets may appear at once. They will disappear after 2 seconds.
                </Text>
              </>
            )}

            <TouchableOpacity
              className="px-8 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={startTask}
            >
              <Text 
                className="text-xl font-semibold text-white text-center"
                style={{ fontSize: 20 * fontScale }}
              >
                Start Task
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {taskState === 'running' && currentPhase === 'task1' && (
          <View
            className="p-4 border shadow-sm rounded-2xl"
            style={{ 
              backgroundColor: cardBg, 
              borderColor: borderColor,
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text 
              className="mb-4 text-xl font-bold text-center"
              style={{ 
                fontSize: 20 * fontScale,
                color: PALETTE.teal 
              }}
            >
              Find: {task1Target}
            </Text>

            {/* Grid */}
            <View className="flex-row flex-wrap justify-center gap-2 mb-4">
              {task1Items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: gridItemBg,
                    borderWidth: 2,
                    borderColor: borderColor,
                    width: 60,
                    height: 60,
                    margin: 2,
                  }}
                  onPress={() => handleTask1ItemPress(item.id)}
                >
                  <Text style={{ fontSize: 24 }}>{item.symbol}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="px-6 py-3 rounded-xl"
              style={{ backgroundColor: PALETTE.orange }}
              onPress={() => {
                // Record no-target response
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
              <Text 
                className="text-lg font-semibold text-white text-center"
                style={{ fontSize: 18 * fontScale }}
              >
                No Target
              </Text>
            </TouchableOpacity>

            <Text 
              className="mt-4 text-center"
              style={{ 
                fontSize: 16 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Round: {task1Round + 1}/{TASK1_ROUNDS}
            </Text>
          </View>
        )}

        {taskState === 'running' && currentPhase === 'task2' && (
          <View
            className="items-center justify-center flex-1"
          >
            <Text 
              className="mb-8 text-xl text-center"
              style={{ 
                fontSize: 20 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Tap when you see the target: 🎯
            </Text>

            <TouchableOpacity
              className="items-center justify-center rounded-full"
              style={{
                backgroundColor: task2ShowingStimulus ? buttonBg : inactiveGridBg,
                borderWidth: 4,
                borderColor: task2IsTarget ? PALETTE.teal : (isDark ? '#666' : '#D1D5DB'),
                width: 200,
                height: 200,
              }}
              onPress={handleTask2Response}
            >
              <Text style={{ fontSize: 60 }}>
                {task2ShowingStimulus ? task2CurrentStimulus : ''}
              </Text>
            </TouchableOpacity>

            <Text 
              className="mt-8 text-center"
              style={{ 
                fontSize: 16 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Stimuli shown: {task2StimulusCount}
            </Text>
          </View>
        )}

        {taskState === 'running' && currentPhase === 'task3' && (
          <View
            className="p-4 border shadow-sm rounded-2xl"
            style={{ 
              backgroundColor: cardBg, 
              borderColor: borderColor,
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text 
              className="mb-4 text-xl font-bold text-center"
              style={{ 
                fontSize: 20 * fontScale,
                color: PALETTE.teal 
              }}
            >
              Tap the Glowing Symbols
            </Text>

            {/* Grid */}
            <View className="flex-row flex-wrap justify-center gap-2">
              {task3Items.map((item) => {
                const isActive = task3ActiveTargets.has(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    className="items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: isActive ? activeButtonBg : gridItemBg,
                      borderWidth: 3,
                      borderColor: isActive ? PALETTE.orange : borderColor,
                      width: 70,
                      height: 70,
                      margin: 2,
                      shadowColor: isActive ? PALETTE.orange : 'transparent',
                      shadowOpacity: isActive ? 0.8 : 0,
                      shadowRadius: isActive ? 10 : 0,
                      elevation: isActive ? 8 : 0,
                    }}
                    onPress={() => handleTask3ItemPress(item.id)}
                  >
                    <Text style={{ fontSize: 28 }}>{item.symbol}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text 
              className="mt-4 text-center"
              style={{ 
                fontSize: 16 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Active targets: {task3ActiveTargets.size} | Trial: {task3TrialNumber}
            </Text>
          </View>
        )}

        {taskState === 'complete' && (
          <View
            className="p-6 border shadow-sm rounded-2xl"
            style={{ 
              backgroundColor: cardBg, 
              borderColor: borderColor,
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text 
              className="mb-4 text-2xl font-bold text-center"
              style={{ 
                fontSize: 24 * fontScale,
                color: PALETTE.teal 
              }}
            >
              Task {getCurrentTaskNumber()} Complete!
            </Text>
            <Text 
              className="text-lg text-center"
              style={{ 
                fontSize: 18 * fontScale,
                color: textColor 
              }}
            >
              {currentPhase === 'task3' ? 'Calculating your results...' : 'Preparing next task...'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AttentionAssessmentRun;