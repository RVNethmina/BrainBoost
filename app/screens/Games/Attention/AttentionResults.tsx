// app/src/screens/AttentionResults.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { saveAttentionResult } from '@/app/services/attentionResultsService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type AttentionResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AttentionResults'
>;

type AttentionResultsRouteParams = {
  score: number;
  totalTargets: number;
  timeTaken: number;
  averageReactionTime: number;
  accuracy: number;
  endedBy: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

// Define the response type from saveAttentionResult
type SaveAttentionResultResponse = 
  | { success: true; id: string }
  | { success: false; error: unknown };

const AttentionResultsScreen: React.FC = () => {
  const navigation = useNavigation<AttentionResultsScreenNavigationProp>();
  const route = useRoute();
  const { 
    score = 0, 
    totalTargets = 0, 
    timeTaken = 0, 
    averageReactionTime = 0,
    accuracy = 0,
    endedBy = 'completed', 
    difficulty = 'easy'
  } = (route.params as AttentionResultsRouteParams) || {};

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const savedRef = useRef(false);

  // Format time taken (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format reaction time
  const formatReactionTime = (ms: number) => {
    return `${ms}ms`;
  };

  // Get appropriate message based on how the game ended
  const getEndMessage = () => {
    if (endedBy === 'time') return "Time's up!";
    if (endedBy === 'completed') return 'Game completed!';
    if (endedBy === 'quit') return 'You finished early';
    return 'Game ended';
  };

  // Get performance message
  const getPerformanceMessage = () => {
    if (accuracy >= 90) return 'Outstanding Focus!';
    if (accuracy >= 70) return 'Great Attention!';
    if (accuracy >= 50) return 'Good Progress!';
    return 'Keep Practicing!';
  };

  // Get trophy emoji
  const getTrophyEmoji = () => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 70) return '🥈';
    if (accuracy >= 50) return '🥉';
    return '🎯';
  };

  // Get reaction time feedback
  const getReactionTimeFeedback = () => {
    if (averageReactionTime < 500) return 'Lightning fast!';
    if (averageReactionTime < 800) return 'Quick reflexes!';
    if (averageReactionTime < 1200) return 'Steady response';
    return 'Take your time';
  };

  useEffect(() => {
    // Save result once on mount
    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      setSaveStatus('saving');
      const res = await saveAttentionResult({ 
        score, 
        totalTargets, 
        timeTaken, 
        averageReactionTime,
        accuracy,
        endedBy,
        difficulty
      }) as SaveAttentionResultResponse;
      
      if (res.success) {
        console.log('✅ Attention result saved, id:', res.id);
        setSaveStatus('saved');
      } else {
        console.error('❌ Failed to save attention result', res.error);
        setSaveStatus('error');
      }
    })();
  }, [score, totalTargets, timeTaken, averageReactionTime, accuracy, endedBy, difficulty]);

  return (
    <View className="flex-1 bg-white">
      {/* Content */}
      <View className="items-center justify-center flex-1 p-5">
        <View
          className="items-center justify-center w-32 h-32 mb-6 rounded-full"
          style={{ backgroundColor: PALETTE.orange }}
        >
          <Text className="text-6xl">{getTrophyEmoji()}</Text>
        </View>

        <Text className="mb-4 text-4xl font-bold" style={{ color: PALETTE.teal }}>
          {getPerformanceMessage()}
        </Text>
        <Text className="mb-2 text-xl text-center text-gray-600">{getEndMessage()}</Text>
        <Text className="mb-8 text-lg text-center text-gray-600">Your focus is improving!</Text>

        {/* Save Status Indicator */}
        {saveStatus === 'saving' && (
          <Text className="mb-2 text-sm text-gray-500">Saving your results...</Text>
        )}
        {saveStatus === 'error' && (
          <Text className="mb-2 text-sm text-red-500">Couldn't save results (offline?)</Text>
        )}

        <View className="w-full mb-8 space-y-4">
          <View className="p-5 rounded-2xl" style={{ backgroundColor: PALETTE.lightTeal }}>
            <View className="grid grid-cols-2 gap-4">
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {formatTime(timeTaken)}
                </Text>
                <Text className="text-gray-600">Time</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {score}/{totalTargets}
                </Text>
                <Text className="text-gray-600">Hits</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {accuracy.toFixed(1)}%
                </Text>
                <Text className="text-gray-600">Accuracy</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {formatReactionTime(averageReactionTime)}
                </Text>
                <Text className="text-gray-600">Avg Time</Text>
              </View>
            </View>
          </View>

          {/* Performance Insights */}
          <View className="p-4 rounded-2xl" style={{ backgroundColor: PALETTE.lightPink }}>
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">⚡</Text>
              <View>
                <Text className="font-bold">{getReactionTimeFeedback()}</Text>
                <Text className="text-gray-700">
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level completed
                </Text>
              </View>
            </View>
          </View>

          {accuracy >= 80 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#E8F5E8' }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">⭐</Text>
                <View>
                  <Text className="font-bold">Excellent Focus!</Text>
                  <Text className="text-gray-700">You're mastering attention skills!</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="p-5 space-y-4">
        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.teal }}
          onPress={() => navigation.navigate('AttentionQuiz')}
        >
          <Text className="mr-2 text-2xl">🔄</Text>
          <Text className="text-xl font-semibold text-white">Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
          onPress={() => navigation.navigate('BrainGames')}
        >
          <Text className="mr-2 text-2xl">🎮</Text>
          <Text className="text-xl font-semibold text-white">More Games</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
          onPress={() => navigation.navigate('Home')}
        >
          <Text className="mr-2 text-2xl">🏠</Text>
          <Text className="text-xl font-semibold text-white">Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AttentionResultsScreen;