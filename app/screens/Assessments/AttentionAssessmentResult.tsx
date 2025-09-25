// app/src/screens/Games/Attention/AttentionAssessmentResult.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { saveAttentionAssessment } from '../../services/attentionAssessmentService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
  const {
    totalTime = 0,
    results = [],
    overallAccuracy = 0,
    averageReactionTime = 0,
    tasksCompleted = 0,
  } = (route.params as AssessmentResultsRouteParams) || {};

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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center justify-center px-5 pt-12 pb-6"
        style={{ backgroundColor: performance.color }}
      >
        <Text className="text-3xl font-bold text-white">Assessment Complete</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Overall Score */}
        <View className="items-center my-8">
          <View
            className="items-center justify-center w-40 h-40 mb-6 rounded-full"
            style={{ backgroundColor: performance.color }}
          >
            <Text className="text-5xl font-bold text-white">{attentionScore}</Text>
            <Text className="text-lg text-white">/ 100</Text>
          </View>
          
          <Text className="mb-2 text-3xl font-bold" style={{ color: performance.color }}>
            {performance.level}
          </Text>
          <Text className="mb-4 text-xl text-center text-gray-600">
            Attention Performance Score
          </Text>

          {/* Save Status */}
          {saveStatus === 'saving' && (
            <Text className="mb-2 text-sm text-gray-500">Saving assessment...</Text>
          )}
          {saveStatus === 'saved' && (
            <Text className="mb-2 text-sm text-green-600">✓ Assessment saved</Text>
          )}
          {saveStatus === 'error' && (
            <Text className="mb-2 text-sm text-red-500">Could not save (offline?)</Text>
          )}
        </View>

        {/* Summary Stats */}
        <View
          className="p-5 mb-6 rounded-2xl"
          style={{ backgroundColor: '#F9FAFB' }}
        >
          <Text className="mb-4 text-xl font-bold" style={{ color: PALETTE.teal }}>
            Assessment Summary
          </Text>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">Duration:</Text>
            <Text className="font-semibold">{formatTime(totalTime)}</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">Tasks Completed:</Text>
            <Text className="font-semibold">{tasksCompleted}/3</Text>
          </View>
          
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">Overall Accuracy:</Text>
            <Text className="font-semibold">{overallAccuracy}%</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-700">Avg Response Time:</Text>
            <Text className="font-semibold">{averageReactionTime}ms</Text>
          </View>
        </View>

        {/* Task Breakdown */}
        <View
          className="p-5 mb-6 rounded-2xl"
          style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' }}
        >
          <Text className="mb-4 text-xl font-bold" style={{ color: PALETTE.teal }}>
            Task Performance Breakdown
          </Text>

          {tasksCompleted >= 1 && (
            <View className="p-4 mb-3 rounded-xl" style={{ backgroundColor: PALETTE.lightTeal }}>
              <Text className="mb-2 text-lg font-semibold" style={{ color: PALETTE.teal }}>
                Task 1: Visual Search
              </Text>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Accuracy: {task1Metrics.accuracy}%</Text>
                <Text className="text-gray-700">Avg RT: {task1Metrics.avgRT}ms</Text>
              </View>
            </View>
          )}

          {tasksCompleted >= 2 && (
            <View className="p-4 mb-3 rounded-xl" style={{ backgroundColor: '#FFEDCC' }}>
              <Text className="mb-2 text-lg font-semibold" style={{ color: PALETTE.orange }}>
                Task 2: Sustained Focus
              </Text>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Accuracy: {task2Metrics.accuracy}%</Text>
                <Text className="text-gray-700">Avg RT: {task2Metrics.avgRT}ms</Text>
              </View>
            </View>
          )}

          {tasksCompleted >= 3 && (
            <View className="p-4 rounded-xl" style={{ backgroundColor: '#FFE0E0' }}>
              <Text className="mb-2 text-lg font-semibold" style={{ color: PALETTE.red }}>
                Task 3: Divided Attention
              </Text>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">Accuracy: {task3Metrics.accuracy}%</Text>
                <Text className="text-gray-700">Avg RT: {task3Metrics.avgRT}ms</Text>
              </View>
            </View>
          )}
        </View>

        {/* Interpretation */}
        <View
          className="p-5 mb-6 rounded-2xl"
          style={{ backgroundColor: 'white', borderWidth: 2, borderColor: performance.color }}
        >
          <Text className="mb-3 text-xl font-bold" style={{ color: performance.color }}>
            What This Means
          </Text>
          <Text className="mb-4 text-base text-gray-700">
            {performance.description}
          </Text>
          
          <Text className="mb-3 text-lg font-semibold" style={{ color: PALETTE.teal }}>
            Recommendations:
          </Text>
          {performance.recommendations.map((rec, index) => (
            <View key={index} className="flex-row items-start gap-2 mb-2">
              <Text className="text-base text-gray-700">•</Text>
              <Text className="flex-1 text-base text-gray-700">{rec}</Text>
            </View>
          ))}
        </View>

        {/* Age-Based Context */}
        <View
          className="p-5 mb-6 rounded-2xl"
          style={{ backgroundColor: '#F0F9FF' }}
        >
          <Text className="mb-3 text-lg font-semibold" style={{ color: PALETTE.teal }}>
            Understanding Your Results
          </Text>
          <Text className="mb-3 text-base text-gray-700">
            Attention abilities can vary based on many factors including age, health, stress, and sleep. 
            These results provide a snapshot of your current attention performance.
          </Text>
          <Text className="text-base text-gray-700">
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
          <Text className="text-xl font-semibold text-white">Practice Attention Games</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.orange }}
          onPress={() => navigation.navigate('Assessment')}
        >
          <Text className="mr-2 text-2xl">📊</Text>
          <Text className="text-xl font-semibold text-white">Other Assessments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
          onPress={() => navigation.navigate('Home')}
        >
          <Text className="mr-2 text-2xl">🏠</Text>
          <Text className="text-xl font-semibold text-white">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AttentionAssessmentResult;