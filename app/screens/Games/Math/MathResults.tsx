// screens/MathResultsScreen.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { saveMathResult } from '@/app/services/mathResultsService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type MathResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MathResults'
>;

type MathResultsRouteParams = {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  endedBy: string;
  gameType?: string;
};

// Define the response type from saveMathResult
type SaveMathResultResponse = 
  | { success: true; id: string }
  | { success: false; error: unknown };

const MathResultsScreen: React.FC = () => {
  const navigation = useNavigation<MathResultsScreenNavigationProp>();
  const route = useRoute();
  const { score = 0, totalQuestions = 0, timeTaken = 0, endedBy = 'completed', gameType = 'math' } =
    (route.params as MathResultsRouteParams) || {};

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

  // Get appropriate message based on how the quiz ended
  const getEndMessage = () => {
    if (endedBy === 'timeUp') return "Time's up!";
    if (endedBy === 'completed') return 'Quiz completed!';
    if (endedBy === 'quit') return 'You finished early';
    return 'Quiz ended';
  };

  // Trophy emoji helper
  const getTrophyEmoji = () => {
    if (percentageScore >= 90) return '🏆';
    if (percentageScore >= 70) return '🥈';
    if (percentageScore >= 50) return '🥉';
    return '🎯';
  };

  useEffect(() => {
    // Save result once on mount
    if (savedRef.current) return;
    savedRef.current = true;

    (async () => {
      setSaveStatus('saving');
      const res = await saveMathResult({ 
        score, 
        totalQuestions, 
        timeTaken, 
        endedBy,
        gameType
      }) as SaveMathResultResponse;
      
      if (res.success) {
        console.log('✅ Math result saved, id:', res.id);
        setSaveStatus('saved');
      } else {
        console.error('❌ Failed to save math result', res.error);
        setSaveStatus('error');
      }
    })();
  }, [score, totalQuestions, timeTaken, endedBy, gameType]);

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
          {percentageScore >= 70 ? 'Excellent!' : percentageScore >= 50 ? 'Good Job!' : 'Keep Practicing!'}
        </Text>
        <Text className="mb-2 text-xl text-center text-gray-600">{getEndMessage()}</Text>
        <Text className="mb-8 text-lg text-center text-gray-600">Your math skills are improving!</Text>

        {/* Save Status Indicator */}
        {saveStatus === 'saving' && (
          <Text className="mb-2 text-sm text-gray-500">Saving your results...</Text>
        )}
        {saveStatus === 'error' && (
          <Text className="mb-2 text-sm text-red-500">Couldn't save results (offline?)</Text>
        )}

        <View className="w-full mb-8 space-y-4">
          <View className="p-5 rounded-2xl" style={{ backgroundColor: PALETTE.lightTeal }}>
            <View className="grid grid-cols-3 gap-4">
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {formatTime(timeTaken)}
                </Text>
                <Text className="text-gray-600">Time</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {score}/{totalQuestions}
                </Text>
                <Text className="text-gray-600">Score</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold" style={{ color: PALETTE.teal }}>
                  {percentageScore}%
                </Text>
                <Text className="text-gray-600">Accuracy</Text>
              </View>
            </View>
          </View>

          {percentageScore >= 80 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: PALETTE.lightPink }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">⭐</Text>
                <View>
                  <Text className="font-bold">Great Job!</Text>
                  <Text className="text-gray-700">You're mastering math skills!</Text>
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
          onPress={() => navigation.navigate('MathQuiz')}
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

export default MathResultsScreen;