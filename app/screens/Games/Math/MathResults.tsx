// screens/MathResultsScreen.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { saveMathResult } from '@/app/services/mathResultsService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

  // Get color theme based on performance
  const getThemeColor = () => {
    if (percentageScore >= 90) return PALETTE.teal;
    if (percentageScore >= 70) return PALETTE.orange;
    if (percentageScore >= 50) return PALETTE.blue;
    return PALETTE.red;
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

  const themeColor = getThemeColor();

  return (
    <View className="flex-1" style={{ backgroundColor: PALETTE.lightPink }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Hero Section */}
        <View className="items-center px-4 pt-12 pb-6 sm:pt-16">
          <View
            className="items-center justify-center w-24 h-24 mb-4 rounded-full shadow-lg sm:w-32 sm:h-32 sm:mb-6"
            style={{ backgroundColor: themeColor }}
          >
            <Text className="text-5xl sm:text-6xl">{getTrophyEmoji()}</Text>
          </View>

          <Text className="mb-2 text-3xl font-bold text-center sm:mb-4 sm:text-4xl" style={{ color: themeColor }}>
            {percentageScore >= 90 ? 'Outstanding!' : 
             percentageScore >= 70 ? 'Excellent!' : 
             percentageScore >= 50 ? 'Good Job!' : 'Keep Practicing!'}
          </Text>
          
          <Text className="mb-2 text-lg font-medium text-center text-gray-700 sm:text-xl">
            {getEndMessage()}
          </Text>
          
          <Text className="px-4 mb-6 text-sm text-center text-gray-600 sm:mb-8 sm:text-base">
            {percentageScore >= 70 ? 'Your math skills are excellent!' : 'Practice makes perfect!'}
          </Text>

          {/* Save Status Indicator */}
          <View className="mb-4">
            {saveStatus === 'saving' && (
              <View className="flex-row items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                <Text className="text-sm text-gray-600">💾 Saving your results...</Text>
              </View>
            )}
            {saveStatus === 'saved' && (
              <View className="flex-row items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Text className="text-sm" style={{ color: PALETTE.green }}>✅ Results saved!</Text>
              </View>
            )}
            {saveStatus === 'error' && (
              <View className="flex-row items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(240, 79, 78, 0.1)' }}>
                <Text className="text-sm" style={{ color: PALETTE.red }}>⚠️ Couldn't save results</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Card */}
        <View className="mx-4 mb-6 sm:mx-6 sm:mb-8">
          <View 
            className="p-6 border-2 shadow-lg sm:p-8 rounded-3xl" 
            style={{ backgroundColor: 'white', borderColor: themeColor }}
          >
            <Text className="mb-6 text-xl font-bold text-center sm:text-2xl" style={{ color: themeColor }}>
              📊 Your Performance
            </Text>
            
            <View className="gap-4 sm:gap-6">
              <View className="flex-row items-center justify-between">
                <View className="items-center flex-1">
                  <View 
                    className="items-center justify-center w-16 h-16 mb-2 rounded-full shadow-md sm:w-20 sm:h-20"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    <Text className="text-2xl font-bold sm:text-3xl" style={{ color: themeColor }}>
                      {formatTime(timeTaken)}
                    </Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-600 sm:text-base">Time Used</Text>
                </View>
                
                <View className="items-center flex-1">
                  <View 
                    className="items-center justify-center w-16 h-16 mb-2 rounded-full shadow-md sm:w-20 sm:h-20"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    <Text className="text-xl font-bold sm:text-2xl" style={{ color: themeColor }}>
                      {score}/{totalQuestions}
                    </Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-600 sm:text-base">Correct</Text>
                </View>
                
                <View className="items-center flex-1">
                  <View 
                    className="items-center justify-center w-16 h-16 mb-2 rounded-full shadow-md sm:w-20 sm:h-20"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    <Text className="text-2xl font-bold sm:text-3xl" style={{ color: themeColor }}>
                      {percentageScore}%
                    </Text>
                  </View>
                  <Text className="text-sm font-medium text-gray-600 sm:text-base">Accuracy</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Achievement Badge */}
        {percentageScore >= 80 && (
          <View className="mx-4 mb-6 sm:mx-6">
            <View 
              className="p-4 border-l-4 shadow-md sm:p-6 rounded-2xl" 
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderLeftColor: themeColor }}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl sm:text-3xl">⭐</Text>
                <View className="flex-1">
                  <Text className="text-lg font-bold sm:text-xl" style={{ color: themeColor }}>
                    Achievement Unlocked!
                  </Text>
                  <Text className="text-sm text-gray-700 sm:text-base">
                    {percentageScore >= 90 ? 'Math Master!' : 'Great Problem Solver!'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-3 px-4 sm:px-6 sm:gap-4">
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 shadow-lg sm:py-5 rounded-2xl active:scale-95"
            style={{ backgroundColor: themeColor }}
            onPress={() => navigation.navigate('MathQuiz')}
            accessibilityRole="button"
            accessibilityLabel="Play the quiz again"
          >
            <Text className="mr-3 text-xl sm:text-2xl">🔄</Text>
            <Text className="text-lg font-semibold text-white sm:text-xl">Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center py-4 border-2 shadow-md sm:py-5 rounded-2xl active:scale-95"
            style={{ backgroundColor: 'white', borderColor: themeColor }}
            onPress={() => navigation.navigate('BrainGames')}
            accessibilityRole="button"
            accessibilityLabel="Go to more brain games"
          >
            <Text className="mr-3 text-xl sm:text-2xl">🎮</Text>
            <Text className="text-lg font-semibold sm:text-xl" style={{ color: themeColor }}>
              More Games
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center py-4 border-2 shadow-md sm:py-5 rounded-2xl active:scale-95"
            style={{ backgroundColor: 'white', borderColor: PALETTE.neutralMuted }}
            onPress={() => navigation.navigate('Home')}
            accessibilityRole="button"
            accessibilityLabel="Go to home screen"
          >
            <Text className="mr-3 text-xl sm:text-2xl">🏠</Text>
            <Text className="text-lg font-semibold text-gray-600 sm:text-xl">Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default MathResultsScreen;