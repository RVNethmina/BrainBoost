// app/src/screens/Games/MemoryMatch/MemoryResultsScreen.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { saveMemoryResult } from '@/app/services/memoryResultsService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { auth } from '@/config/firebaseConfig'; // ✅ Import auth

type MemoryResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MemoryResults'
>;

type MemoryResultsRouteParams = {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  endedBy: string;
  gameType: 'pattern' | 'cards' | 'sequence' | 'spatial';
  level: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
};

type SaveMemoryResultResponse =
  | { success: true; id: string }
  | { success: false; error: unknown };

const MemoryResultsScreen: React.FC = () => {
  const navigation = useNavigation<MemoryResultsScreenNavigationProp>();
  const route = useRoute();
  const {
    score = 0,
    totalQuestions = 0,
    timeTaken = 0,
    endedBy = 'completed',
    gameType = 'pattern',
    level = 1,
    difficulty = 'easy',
  } = (route.params as MemoryResultsRouteParams) || {};

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const savedRef = useRef(false);

  // Calculate percentage score
  const percentageScore = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Format time taken (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get game type display name
  const getGameTypeName = () => {
    switch (gameType) {
      case 'pattern':
        return 'Pattern Memory';
      case 'cards':
        return 'Memory Cards';
      case 'sequence':
        return 'Sequence Memory';
      case 'spatial':
        return 'Spatial Memory';
      default:
        return 'Memory Game';
    }
  };

  // Get appropriate message based on performance and how the quiz ended
  const getEndMessage = () => {
    if (endedBy === 'time') return "Time's up!";
    if (endedBy === 'finished') return 'Game completed!';
    if (endedBy === 'lives') return 'No more lives left';
    if (endedBy === 'quit') return 'You finished early';
    return 'Game ended';
  };

  // Get performance message
  const getPerformanceMessage = () => {
    if (percentageScore >= 90) return 'Outstanding memory skills!';
    if (percentageScore >= 80) return 'Excellent memory performance!';
    if (percentageScore >= 70) return 'Good memory work!';
    if (percentageScore >= 60) return 'Your memory is improving!';
    return 'Keep practicing your memory!';
  };

  // Trophy emoji helper
  const getTrophyEmoji = () => {
    if (percentageScore >= 90) return '🏆';
    if (percentageScore >= 80) return '🥈';
    if (percentageScore >= 70) return '🥉';
    if (percentageScore >= 60) return '🎯';
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
      case 'expert':
        return '#9333EA';
      default:
        return PALETTE.teal;
    }
  };

  // ✅ Log auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log(
        'Auth state changed:',
        user ? `${user.uid} (${user.email})` : 'Not authenticated'
      );
    });

    return unsubscribe;
  }, []);

  // ✅ Save results once
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      setSaveStatus('saving');
      const res = (await saveMemoryResult({
        score,
        totalQuestions,
        timeTaken,
        level,
        endedBy,
        gameType,
        difficulty,
      })) as SaveMemoryResultResponse;

      if (res.success) {
        console.log('Memory result saved, id:', res.id);
        setSaveStatus('saved');
      } else {
        console.error('Failed to save memory result', res.error);
        setSaveStatus('error');
      }
    })();
  }, [score, totalQuestions, timeTaken, level, endedBy, gameType, difficulty]);

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
          {percentageScore >= 80
            ? 'Excellent!'
            : percentageScore >= 60
            ? 'Good Job!'
            : 'Keep Practicing!'}
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
                  {percentageScore}%
                </Text>
                <Text className="text-gray-600">Accuracy</Text>
              </View>
            </View>
          </View>

          {/* Achievements */}
          {percentageScore >= 90 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#FEF3C7' }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">⭐</Text>
                <View>
                  <Text className="font-bold">Memory Master!</Text>
                  <Text className="text-gray-700">
                    Outstanding performance on {difficulty} level!
                  </Text>
                </View>
              </View>
            </View>
          )}

          {percentageScore >= 80 && percentageScore < 90 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: PALETTE.lightPink }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">🧠</Text>
                <View>
                  <Text className="font-bold">Sharp Memory!</Text>
                  <Text className="text-gray-700">Your memory skills are impressive!</Text>
                </View>
              </View>
            </View>
          )}

          {difficulty === 'expert' && percentageScore >= 70 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#E0E7FF' }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">💎</Text>
                <View>
                  <Text className="font-bold">Expert Challenge Complete!</Text>
                  <Text className="text-gray-700">
                    You tackled the hardest memory challenge!
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
              case 'pattern':
                navigation.navigate('MemoryPlayLevel1');
                break;
              case 'cards':
                navigation.navigate('MemoryPlayLevel2');
                break;
              case 'sequence':
                navigation.navigate('MemoryPlayLevel3');
                break;
              case 'spatial':
                navigation.navigate('MemoryPlayLevel4');
                break;
              default:
                navigation.navigate('MemoryQuiz');
            }
          }}
        >
          <Text className="mr-2 text-2xl">🎯</Text>
          <Text className="text-xl font-semibold text-white">Play Same Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.teal }}
          onPress={() => navigation.navigate('MemoryQuiz')}
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

export default MemoryResultsScreen;
