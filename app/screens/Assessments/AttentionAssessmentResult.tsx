// app/src/screens/Games/Attention/AttentionAssessmentResult.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { saveAttentionAssessment } from '../../services/attentionAssessmentService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '@/app/contexts/SettingsContext'; // Add this import

type AttentionAssessmentResultNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AttentionAssessmentResult'
>;

type TrialResult = {
  taskId: number;
  trialNumber: number;
  targetPresent: boolean;
  responseGiven: boolean;
  responseTime: number | null;
  accuracy: boolean;
  timestamp: number;
};

type AssessmentResultsRouteParams = {
  totalTime: number;
  results: TrialResult[];
  overallAccuracy: number;
  averageReactionTime: number;
  tasksCompleted: number;
};

const AttentionAssessmentResult: React.FC = () => {
  const navigation = useNavigation<AttentionAssessmentResultNavigationProp>();
  const route = useRoute();
  // Add settings hook
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';
  
  const {
    totalTime = 0,
    results = [],
    overallAccuracy = 0,
    averageReactionTime = 0,
    tasksCompleted = 0,
  } = (route.params as AssessmentResultsRouteParams) || {};

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const lightCardBg = isDark ? '#3a3a3a' : '#F9FAFB';
  const infoBg = isDark ? '#2a3a4a' : '#F0F9FF';
  const secondaryTextColor = isDark ? '#ccc' : PALETTE.gray;
  const borderColor = isDark ? '#444' : '#E5E7EB';

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const savedRef = useRef(false);

  // Calculate detailed metrics
  const calculateMetrics = () => {
    const task1Results = results.filter(r => r.taskId === 1);
    const task2Results = results.filter(r => r.taskId === 2);
    const task3Results = results.filter(r => r.taskId === 3);

    const calculateTaskMetrics = (taskResults: TrialResult[]) => {
      const correct = taskResults.filter(r => r.accuracy).length;
      const total = taskResults.length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      const responseTimes = taskResults
        .filter(r => r.responseTime !== null && r.responseTime! < 5000) // Filter extreme outliers
        .map(r => r.responseTime!);
      
      const avgRT = responseTimes.length > 0 
        ? Math.round(responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length)
        : 0;

      return { accuracy, avgRT, total };
    };

    const task1Metrics = calculateTaskMetrics(task1Results);
    const task2Metrics = calculateTaskMetrics(task2Results);
    const task3Metrics = calculateTaskMetrics(task3Results);

    return { task1Metrics, task2Metrics, task3Metrics };
  };

  // Calculate overall attention score
  const calculateAttentionScore = () => {
    if (results.length === 0) return 0;

    const { task1Metrics, task2Metrics, task3Metrics } = calculateMetrics();
    
    // Weighted scoring based on task importance
    const task1Score = (task1Metrics.accuracy * 0.3) + Math.max(0, (2000 - task1Metrics.avgRT) / 20); // Max 30 + 70 = 100
    const task2Score = (task2Metrics.accuracy * 0.4) + Math.max(0, (1500 - task2Metrics.avgRT) / 15); // Max 40 + 60 = 100
    const task3Score = (task3Metrics.accuracy * 0.5) + Math.max(0, (1200 - task3Metrics.avgRT) / 12); // Max 50 + 50 = 100

    const weightedScore = (task1Score * 0.3 + task2Score * 0.4 + task3Score * 0.3);
    return Math.max(0, Math.min(100, Math.round(weightedScore)));
  };

  // Get performance interpretation
  const getPerformanceInterpretation = (score: number) => {
    if (score >= 85) return {
      level: 'Superior',
      color: PALETTE.teal,
      description: 'Outstanding attention abilities. Your focus, speed, and accuracy are all excellent.',
      recommendations: ['Continue challenging yourself with complex tasks', 'Consider helping others develop attention skills']
    };
    
    if (score >= 70) return {
      level: 'Above Average',
      color: '#059669',
      description: 'Strong attention skills with good focus and response speed.',
      recommendations: ['Practice sustained attention tasks', 'Try more complex multi-tasking exercises']
    };
    
    if (score >= 55) return {
      level: 'Average',
      color: PALETTE.orange,
      description: 'Normal attention abilities with room for improvement in focus or speed.',
      recommendations: ['Regular attention training exercises', 'Focus on one task at a time', 'Practice mindfulness meditation']
    };
    
    if (score >= 40) return {
      level: 'Below Average',
      color: '#DC2626',
      description: 'Attention skills could benefit from focused training and practice.',
      recommendations: ['Daily attention exercises', 'Minimize distractions in environment', 'Consider consulting a healthcare provider']
    };
    
    return {
      level: 'Needs Attention',
      color: PALETTE.red,
      description: 'Significant attention challenges detected. Consider professional evaluation.',
      recommendations: ['Seek professional assessment', 'Start with basic attention exercises', 'Maintain consistent sleep schedule']
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const attentionScore = calculateAttentionScore();
  const performance = getPerformanceInterpretation(attentionScore);
  const { task1Metrics, task2Metrics, task3Metrics } = calculateMetrics();

  // Save assessment results
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      setSaveStatus('saving');
      
      try {
        const assessmentData = {
          totalTime,
          tasksCompleted,
          overallAccuracy,
          averageReactionTime,
          attentionScore,
          performanceLevel: performance.level,
          task1Accuracy: task1Metrics.accuracy,
          task1AvgRT: task1Metrics.avgRT,
          task2Accuracy: task2Metrics.accuracy,
          task2AvgRT: task2Metrics.avgRT,
          task3Accuracy: task3Metrics.accuracy,
          task3AvgRT: task3Metrics.avgRT,
          rawResults: results,
        };

        const result = await saveAttentionAssessment(assessmentData);
        
        if (result.success) {
          setSaveStatus('saved');
          console.log('Assessment saved with ID:', result.id);
        } else {
          setSaveStatus('error');
          console.error('Failed to save assessment:', result.error);
        }
      } catch (error) {
        setSaveStatus('error');
        console.error('Error saving assessment:', error);
      }
    })();
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-center px-5 pt-12 pb-6"
        style={{ backgroundColor: performance.color }}
      >
        <Text 
          className="text-3xl font-bold text-white"
          style={{ fontSize: 32 * fontScale }}
        >
          Assessment Complete
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Overall Score */}
        <View className="items-center my-8">
          <View
            className="items-center justify-center w-40 h-40 mb-6 rounded-full"
            style={{ backgroundColor: performance.color }}
          >
            <Text 
              className="text-5xl font-bold text-white"
              style={{ fontSize: 48 * fontScale }}
            >
              {attentionScore}
            </Text>
            <Text 
              className="text-lg text-white"
              style={{ fontSize: 18 * fontScale }}
            >
              / 100
            </Text>
          </View>
          
          <Text 
            className="mb-2 text-3xl font-bold"
            style={{ 
              fontSize: 32 * fontScale,
              color: performance.color 
            }}
          >
            {performance.level}
          </Text>
          <Text 
            className="mb-4 text-xl text-center"
            style={{ 
              fontSize: 20 * fontScale,
              color: secondaryTextColor 
            }}
          >
            Attention Performance Score
          </Text>

          {/* Save Status */}
          {saveStatus === 'saving' && (
            <Text 
              className="mb-2 text-sm"
              style={{ 
                fontSize: 14 * fontScale,
                color: secondaryTextColor 
              }}
            >
              Saving assessment...
            </Text>
          )}
          {saveStatus === 'saved' && (
            <Text 
              className="mb-2 text-sm text-green-600"
              style={{ fontSize: 14 * fontScale }}
            >
              ✓ Assessment saved
            </Text>
          )}
          {saveStatus === 'error' && (
            <Text 
              className="mb-2 text-sm text-red-500"
              style={{ fontSize: 14 * fontScale }}
            >
              Could not save (offline?)
            </Text>
          )}
        </View>

        {/* Summary Stats */}
        <View
          className="p-5 mb-6 rounded-2xl"
          style={{ backgroundColor: lightCardBg }}
        >
          <Text 
            className="mb-4 text-xl font-bold"
            style={{ 
              fontSize: 20 * fontScale,
              color: PALETTE.teal 
            }}
          >
            Assessment Summary
          </Text>
          
          <View className="flex-row justify-between mb-3">
            <Text 
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              Duration:
            </Text>
            <Text 
              className="font-semibold"
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              {formatTime(totalTime)}
            </Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text 
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              Tasks Completed:
            </Text>
            <Text 
              className="font-semibold"
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              {tasksCompleted}/3
            </Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text 
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              Overall Accuracy:
            </Text>
            <Text 
              className="font-semibold"
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              {overallAccuracy}%
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text 
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              Avg Response Time:
            </Text>
            <Text 
              className="font-semibold"
              style={{ 
                fontSize: 16 * fontScale,
                color: textColor 
              }}
            >
              {averageReactionTime}ms
            </Text>
          </View>
        </View>

        {/* Task Breakdown */}
        <View
          className="p-5 mb-6 rounded-2xl"
          style={{ 
            backgroundColor: cardBg, 
            borderWidth: 1, 
            borderColor: borderColor 
          }}
        >
          <Text 
            className="mb-4 text-xl font-bold"
            style={{ 
              fontSize: 20 * fontScale,
              color: PALETTE.teal 
            }}
          >
            Task Performance Breakdown
          </Text>

          {tasksCompleted >= 1 && (
            <View 
              className="p-4 mb-3 rounded-xl" 
              style={{ backgroundColor: isDark ? '#2a4a4a' : PALETTE.lightTeal }}
            >
              <Text 
                className="mb-2 text-lg font-semibold"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: PALETTE.teal 
                }}
              >
                Task 1: Visual Search
              </Text>
              <View className="flex-row justify-between">
                <Text 
                  style={{ 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }}
                >
                  Accuracy: {task1Metrics.accuracy}%
                </Text>
                <Text 
                  style={{ 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }}
                >
                  Avg RT: {task1Metrics.avgRT}ms
                </Text>
              </View>
            </View>
          )}

          {tasksCompleted >= 2 && (
            <View 
              className="p-4 mb-3 rounded-xl" 
              style={{ backgroundColor: isDark ? '#4a3a2a' : '#FFEDCC' }}
            >
              <Text 
                className="mb-2 text-lg font-semibold"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: PALETTE.orange 
                }}
              >
                Task 2: Sustained Focus
              </Text>
              <View className="flex-row justify-between">
                <Text 
                  style={{ 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }}
                >
                  Accuracy: {task2Metrics.accuracy}%
                </Text>
                <Text 
                  style={{ 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }}
                >
                  Avg RT: {task2Metrics.avgRT}ms
                </Text>
              </View>
            </View>
          )}

          {tasksCompleted >= 3 && (
            <View 
              className="p-4 rounded-xl" 
              style={{ backgroundColor: isDark ? '#4a2a2a' : '#FFE0E0' }}
            >
              <Text 
                className="mb-2 text-lg font-semibold"
                style={{ 
                  fontSize: 18 * fontScale,
                  color: PALETTE.red 
                }}
              >
                Task 3: Divided Attention
              </Text>
              <View className="flex-row justify-between">
                <Text 
                  style={{ 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }}
                >
                  Accuracy: {task3Metrics.accuracy}%
                </Text>
                <Text 
                  style={{ 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }}
                >
                  Avg RT: {task3Metrics.avgRT}ms
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Interpretation */}
        <View
          className="p-5 mb-6 rounded-2xl"
          style={{ 
            backgroundColor: cardBg, 
            borderWidth: 2, 
            borderColor: performance.color 
          }}
        >
          <Text 
            className="mb-3 text-xl font-bold"
            style={{ 
              fontSize: 20 * fontScale,
              color: performance.color 
            }}
          >
            What This Means
          </Text>
          <Text 
            className="mb-4 text-base"
            style={{ 
              fontSize: 16 * fontScale,
              color: textColor 
            }}
          >
            {performance.description}
          </Text>
          
          <Text 
            className="mb-3 text-lg font-semibold"
            style={{ 
              fontSize: 18 * fontScale,
              color: PALETTE.teal 
            }}
          >
            Recommendations:
          </Text>
          {performance.recommendations.map((rec, index) => (
            <View key={index} className="flex-row items-start gap-2 mb-2">
              <Text 
                style={{ 
                  fontSize: 16 * fontScale,
                  color: textColor 
                }}
              >•</Text>
              <Text 
                className="flex-1"
                style={{ 
                  fontSize: 16 * fontScale,
                  color: textColor 
                }}
              >
                {rec}
              </Text>
            </View>
          ))}
        </View>

        {/* Age-Based Context */}
        <View
          className="p-5 mb-6 rounded-2xl"
          style={{ backgroundColor: infoBg }}
        >
          <Text 
            className="mb-3 text-lg font-semibold"
            style={{ 
              fontSize: 18 * fontScale,
              color: PALETTE.teal 
            }}
          >
            Understanding Your Results
          </Text>
          <Text 
            className="mb-3 text-base"
            style={{ 
              fontSize: 16 * fontScale,
              color: textColor 
            }}
          >
            Attention abilities can vary based on many factors including age, health, stress, and sleep. 
            These results provide a snapshot of your current attention performance.
          </Text>
          <Text 
            className="text-base"
            style={{ 
              fontSize: 16 * fontScale,
              color: textColor 
            }}
          >
            Regular practice with attention training exercises can help improve focus and concentration over time.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-5 space-y-3">
        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.teal }}
          onPress={() => navigation.navigate('AttentionQuiz')}
        >
          <Text className="mr-2 text-2xl">🎯</Text>
          <Text 
            className="text-xl font-semibold text-white"
            style={{ fontSize: 20 * fontScale }}
          >
            Practice Attention Games
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.orange }}
          onPress={() => navigation.navigate('Assessment')}
        >
          <Text className="mr-2 text-2xl">📊</Text>
          <Text 
            className="text-xl font-semibold text-white"
            style={{ fontSize: 20 * fontScale }}
          >
            Other Assessments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightTeal }}
          onPress={() => navigation.navigate('Home')}
        >
          <Text className="mr-2 text-2xl">🏠</Text>
          <Text 
            className="text-xl font-semibold"
            style={{ 
              fontSize: 20 * fontScale,
              color: textColor 
            }}
          >
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AttentionAssessmentResult;