// app/src/screens/Games/Attention/AttentionResults.tsx
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
  totalQuestions: number;
  timeTaken: number;
  endedBy: string;
  gameType: 'symbol_search' | 'color_focus' | 'speed_challenge';
  level: number;
  difficulty: 'easy' | 'medium' | 'hard';
  accuracy: number;
  avgReactionTime: number;
  totalSelections: number;
  correctSelections: number;
  missedRounds?: number;
};

type SaveAttentionResultResponse =
  | { success: true; id: string }
  | { success: false; error: unknown };

const AttentionResults: React.FC = () => {
  const navigation = useNavigation<AttentionResultsScreenNavigationProp>();
  const route = useRoute();
  const {
    score = 0,
    totalQuestions = 0,
    timeTaken = 0,
    endedBy = 'completed',
    gameType = 'symbol_search',
    level = 1,
    difficulty = 'easy',
    accuracy = 0,
    avgReactionTime = 0,
    totalSelections = 0,
    correctSelections = 0,
    missedRounds = 0,
  } = (route.params as AttentionResultsRouteParams) || {};

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const savedRef = useRef(false);

  // Calculate percentage score
  const percentageScore = totalQuestions > 0 ? Math.round((score / (totalQuestions * 20)) * 100) : 0;

  // Format time taken (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get game type display name
  const getGameTypeName = () => {
    switch (gameType) {
      case 'symbol_search':
        return 'Symbol Search';
      case 'color_focus':
        return 'Color Focus';
      case 'speed_challenge':
        return 'Speed Challenge';
      default:
        return 'Attention Game';
    }
  };

  // Get appropriate message based on performance and how the quiz ended
  const getEndMessage = () => {
    if (endedBy === 'time') return "Time's up!";
    if (endedBy === 'finished') return 'Challenge completed!';
    if (endedBy === 'quit') return 'You finished early';
    return 'Game ended';
  };

  // Get performance message based on accuracy and reaction time
  const getPerformanceMessage = () => {
    if (accuracy >= 95 && avgReactionTime < 1000) return 'Lightning-fast attention!';
    if (accuracy >= 90) return 'Outstanding focus and precision!';
    if (accuracy >= 80) return 'Excellent attention skills!';
    if (accuracy >= 70) return 'Good focus and concentration!';
    if (accuracy >= 60) return 'Your attention is improving!';
    return 'Keep practicing your focus!';
  };

  // Trophy emoji helper
  const getTrophyEmoji = () => {
    if (accuracy >= 95 && avgReactionTime < 1000) return '🏆';
    if (accuracy >= 90) return '🥇';
    if (accuracy >= 80) return '🥈';
    if (accuracy >= 70) return '🥉';
    if (accuracy >= 60) return '🎯';
    return '💪';
  };

  // Get difficulty color
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return PALETTE.teal;
      case 'medium':
        return PALETTE.orange;
      case 'hard':
        return PALETTE.red;
      default:
        return PALETTE.teal;
    }
  };

  // Get reaction time rating
  const getReactionTimeRating = () => {
    if (avgReactionTime < 800) return { text: 'Lightning Fast', color: PALETTE.teal };
    if (avgReactionTime < 1200) return { text: 'Quick', color: PALETTE.orange };
    if (avgReactionTime < 1800) return { text: 'Steady', color: '#9333EA' };
    return { text: 'Thoughtful', color: PALETTE.red };
  };

  // Save results once
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      setSaveStatus('saving');
      const res = (await saveAttentionResult({
        score,
        totalQuestions,
        timeTaken,
        level,
        endedBy,
        gameType,
        difficulty,
        accuracy,
        avgReactionTime,
        totalSelections,
        correctSelections,
        missedRounds,
      })) as SaveAttentionResultResponse;

      if (res.success) {
        console.log('Attention result saved, id:', res.id);
        setSaveStatus('saved');
      } else {
        console.error('Failed to save attention result', res.error);
        setSaveStatus('error');
      }
    })();
  }, []);

  const reactionRating = getReactionTimeRating();

  return (
    <View className="flex-1 bg-white">
      {/* Content */}
      <View className="items-center justify-center flex-1 p-5">
        <View
          className="items-center justify-center w-32 h-32 mb-6 rounded-full"
          style={{ backgroundColor: getDifficultyColor() }}
        >
          <Text className="text-6xl">{getTrophyEmoji()}</Text>
        </View>

        <Text className="mb-4 text-4xl font-bold" style={{ color: PALETTE.teal }}>
          {accuracy >= 90
            ? 'Sharp Focus!'
            : accuracy >= 70
            ? 'Good Attention!'
            : 'Keep Training!'}
        </Text>

        <Text className="mb-2 text-xl text-center text-gray-600">{getEndMessage()}</Text>
        <Text className="mb-2 text-lg text-center text-gray-600">{getPerformanceMessage()}</Text>
        <Text
          className="mb-8 text-lg font-semibold text-center"
          style={{ color: getDifficultyColor() }}
        >
          {getGameTypeName()} - Level {level}
        </Text>

        {/* Save Status Indicator */}
        {saveStatus === 'saving' && (
          <Text className="mb-2 text-sm text-gray-500">Saving your results...</Text>
        )}
        {saveStatus === 'error' && (
          <Text className="mb-2 text-sm text-red-500">Couldn't save results (offline?)</Text>
        )}

        <View className="w-full mb-8 space-y-4">
          {/* Main Stats */}
          <View className="p-5 rounded-2xl" style={{ backgroundColor: PALETTE.lightTeal }}>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {formatTime(timeTaken)}
                </Text>
                <Text className="text-gray-600">Time</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {score}
                </Text>
                <Text className="text-gray-600">Score</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {accuracy}%
                </Text>
                <Text className="text-gray-600">Accuracy</Text>
              </View>
            </View>
          </View>

          {/* Detailed Stats */}
          <View className="p-5 rounded-2xl" style={{ backgroundColor: '#F9FAFB' }}>
            <View className="flex-row justify-between mb-3">
              <View className="items-center flex-1">
                <Text className="text-lg font-bold" style={{ color: reactionRating.color }}>
                  {avgReactionTime}ms
                </Text>
                <Text className="text-sm text-gray-600">Avg Response</Text>
                <Text className="text-xs" style={{ color: reactionRating.color }}>
                  {reactionRating.text}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg font-bold" style={{ color: PALETTE.teal }}>
                  {correctSelections}/{totalSelections}
                </Text>
                <Text className="text-sm text-gray-600">Correct/Total</Text>
              </View>
              {missedRounds !== undefined && missedRounds > 0 && (
                <View className="items-center flex-1">
                  <Text className="text-lg font-bold" style={{ color: PALETTE.red }}>
                    {missedRounds}
                  </Text>
                  <Text className="text-sm text-gray-600">Missed Rounds</Text>
                </View>
              )}
            </View>
          </View>

          {/* Achievements */}
          {accuracy >= 95 && avgReactionTime < 1000 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#FEF3C7' }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">⚡</Text>
                <View>
                  <Text className="font-bold">Lightning Focus!</Text>
                  <Text className="text-gray-700">
                    Outstanding speed and accuracy on {difficulty} level!
                  </Text>
                </View>
              </View>
            </View>
          )}

          {accuracy >= 90 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: PALETTE.lightPink }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">👁️</Text>
                <View>
                  <Text className="font-bold">Eagle Eye!</Text>
                  <Text className="text-gray-700">Your attention to detail is impressive!</Text>
                </View>
              </View>
            </View>
          )}

          {difficulty === 'hard' && accuracy >= 75 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#E0E7FF' }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">💎</Text>
                <View>
                  <Text className="font-bold">Speed Master!</Text>
                  <Text className="text-gray-700">
                    You conquered the hardest attention challenge!
                  </Text>
                </View>
              </View>
            </View>
          )}

          {avgReactionTime < 800 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#ECFDF5' }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">⚡</Text>
                <View>
                  <Text className="font-bold">Quick Reflexes!</Text>
                  <Text className="text-gray-700">
                    Average response time under 800ms - very fast!
                  </Text>
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
          style={{ backgroundColor: getDifficultyColor() }}
          onPress={() => {
            switch (gameType) {
              case 'symbol_search':
                navigation.navigate('AttentionPlayEasy');
                break;
              case 'color_focus':
                navigation.navigate('AttentionPlayMedium');
                break;
              case 'speed_challenge':
                navigation.navigate('AttentionPlayHard');
                break;
              default:
                navigation.navigate('AttentionQuiz');
            }
          }}
        >
          <Text className="mr-2 text-2xl">🎯</Text>
          <Text className="text-xl font-semibold text-white">Play Same Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.teal }}
          onPress={() => navigation.navigate('AttentionQuiz')}
        >
          <Text className="mr-2 text-2xl">🔄</Text>
          <Text className="text-xl font-semibold text-white">Try Different Level</Text>
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

export default AttentionResults;