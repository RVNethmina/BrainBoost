// app/src/screens/Games/Attention/AttentionResults.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { saveAttentionResult } from '@/app/services/attentionResultsService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '@/app/contexts/SettingsContext';
import { FatigueLevel } from '@/app/services/fatigueDetectionService';

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
  fatigueLevel?: FatigueLevel;
};

type SaveAttentionResultResponse =
  | { success: true; id: string }
  | { success: false; error: unknown };

const AttentionResults: React.FC = () => {
  const navigation = useNavigation<AttentionResultsScreenNavigationProp>();
  const route = useRoute();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

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
    fatigueLevel = 'none',
  } = (route.params as AttentionResultsRouteParams) || {};

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const savedRef = useRef(false);

  const percentageScore = totalQuestions > 0 ? Math.round((score / (totalQuestions * 20)) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const getEndMessage = () => {
    if (endedBy === 'time') return "Time's up!";
    if (endedBy === 'finished') return 'Challenge completed!';
    if (endedBy === 'quit') return 'You finished early';
    return 'Game ended';
  };

  const getPerformanceMessage = () => {
    if (accuracy >= 95 && avgReactionTime < 1000) return 'Lightning-fast attention!';
    if (accuracy >= 90) return 'Outstanding focus and precision!';
    if (accuracy >= 80) return 'Excellent attention skills!';
    if (accuracy >= 70) return 'Good focus and concentration!';
    if (accuracy >= 60) return 'Your attention is improving!';
    return 'Keep practicing your focus!';
  };

  const getTrophyEmoji = () => {
    if (accuracy >= 95 && avgReactionTime < 1000) return '🏆';
    if (accuracy >= 90) return '🥇';
    if (accuracy >= 80) return '🥈';
    if (accuracy >= 70) return '🥉';
    if (accuracy >= 60) return '🎯';
    return '💪';
  };

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

  const getReactionTimeRating = () => {
    if (avgReactionTime < 800) return { text: 'Lightning Fast', color: PALETTE.teal };
    if (avgReactionTime < 1200) return { text: 'Quick', color: PALETTE.orange };
    if (avgReactionTime < 1800) return { text: 'Steady', color: '#9333EA' };
    return { text: 'Thoughtful', color: PALETTE.red };
  };

  const getFatigueColor = () => {
    switch (fatigueLevel) {
      case 'high':
        return PALETTE.red;
      case 'moderate':
        return PALETTE.orange;
      case 'early':
        return '#F59E0B';
      default:
        return PALETTE.teal;
    }
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
        fatigueLevel,
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
  const bgColor = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const cardBg = isDark ? '#2a2a2a' : '#fff';

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Content */}
      <View className="items-center justify-center flex-1 p-5">
        <View
          className="items-center justify-center w-32 h-32 mb-6 rounded-full"
          style={{ backgroundColor: getDifficultyColor() }}
        >
          <Text className="text-6xl">{getTrophyEmoji()}</Text>
        </View>

        <Text 
          className="mb-4 text-4xl font-bold" 
          style={{ fontSize: 32 * fontScale, color: PALETTE.teal }}
        >
          {accuracy >= 90
            ? 'Sharp Focus!'
            : accuracy >= 70
            ? 'Good Attention!'
            : 'Keep Training!'}
        </Text>

        <Text 
          className="mb-2 text-xl text-center" 
          style={{ fontSize: 18 * fontScale, color: textColor }}
        >
          {getEndMessage()}
        </Text>
        <Text 
          className="mb-2 text-lg text-center" 
          style={{ fontSize: 16 * fontScale, color: textColor }}
        >
          {getPerformanceMessage()}
        </Text>
        <Text
          className="mb-8 text-lg font-semibold text-center"
          style={{ fontSize: 16 * fontScale, color: getDifficultyColor() }}
        >
          {getGameTypeName()} - Level {level}
        </Text>

        {/* Save Status Indicator */}
        {saveStatus === 'saving' && (
          <Text className="mb-2 text-sm" style={{ fontSize: 12 * fontScale, color: textColor }}>
            Saving your results...
          </Text>
        )}
        {saveStatus === 'error' && (
          <Text className="mb-2 text-sm" style={{ fontSize: 12 * fontScale, color: PALETTE.red }}>
            Couldn't save results (offline?)
          </Text>
        )}

        <View className="w-full mb-8 space-y-4">
          {/* Main Stats */}
          <View 
            className="p-5 rounded-2xl" 
            style={{ backgroundColor: PALETTE.lightTeal }}
          >
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text 
                  className="font-bold" 
                  style={{ fontSize: 24 * fontScale, color: PALETTE.teal }}
                >
                  {formatTime(timeTaken)}
                </Text>
                <Text style={{ fontSize: 12 * fontScale, color: textColor }}>
                  Time
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text 
                  className="font-bold" 
                  style={{ fontSize: 24 * fontScale, color: PALETTE.teal }}
                >
                  {score}
                </Text>
                <Text style={{ fontSize: 12 * fontScale, color: textColor }}>
                  Score
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text 
                  className="font-bold" 
                  style={{ fontSize: 24 * fontScale, color: PALETTE.teal }}
                >
                  {accuracy}%
                </Text>
                <Text style={{ fontSize: 12 * fontScale, color: textColor }}>
                  Accuracy
                </Text>
              </View>
            </View>
          </View>

          {/* Detailed Stats */}
          <View 
            className="p-5 rounded-2xl" 
            style={{ backgroundColor: '#F9FAFB' }}
          >
            <View className="flex-row justify-between mb-3">
              <View className="items-center flex-1">
                <Text 
                  className="font-bold" 
                  style={{ fontSize: 18 * fontScale, color: reactionRating.color }}
                >
                  {avgReactionTime}ms
                </Text>
                <Text style={{ fontSize: 12 * fontScale, color: textColor }}>
                  Avg Response
                </Text>
                <Text 
                  style={{ fontSize: 11 * fontScale, color: reactionRating.color }}
                >
                  {reactionRating.text}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text 
                  className="font-bold" 
                  style={{ fontSize: 18 * fontScale, color: PALETTE.teal }}
                >
                  {correctSelections}/{totalSelections}
                </Text>
                <Text style={{ fontSize: 12 * fontScale, color: textColor }}>
                  Correct/Total
                </Text>
              </View>
              {missedRounds !== undefined && missedRounds > 0 && (
                <View className="items-center flex-1">
                  <Text 
                    className="font-bold" 
                    style={{ fontSize: 18 * fontScale, color: PALETTE.red }}
                  >
                    {missedRounds}
                  </Text>
                  <Text style={{ fontSize: 12 * fontScale, color: textColor }}>
                    Missed Rounds
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Fatigue Status */}
          {fatigueLevel && fatigueLevel !== 'none' && (
            <View 
              className="p-4 rounded-2xl" 
              style={{ backgroundColor: getFatigueColor() + '20' }}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">
                  {fatigueLevel === 'high' ? '😴' : fatigueLevel === 'moderate' ? '😐' : '😊'}
                </Text>
                <View className="flex-1">
                  <Text 
                    className="font-bold" 
                    style={{ fontSize: 14 * fontScale, color: getFatigueColor() }}
                  >
                    {fatigueLevel === 'high'
                      ? 'High Fatigue Detected'
                      : fatigueLevel === 'moderate'
                      ? 'Moderate Fatigue'
                      : 'Early Signs of Fatigue'}
                  </Text>
                  <Text 
                    style={{ fontSize: 12 * fontScale, color: textColor, marginTop: 4 }}
                  >
                    {fatigueLevel === 'high'
                      ? 'Please rest before your next session.'
                      : fatigueLevel === 'moderate'
                      ? 'Consider taking a break soon.'
                      : 'You performed well, but monitor your energy.'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Achievements */}
          {accuracy >= 95 && avgReactionTime < 1000 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#FEF3C7' }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">⚡</Text>
                <View className="flex-1">
                  <Text style={{ fontSize: 14 * fontScale, fontWeight: 'bold', color: textColor }}>
                    Lightning Focus!
                  </Text>
                  <Text style={{ fontSize: 12 * fontScale, color: textColor, marginTop: 2 }}>
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
                <View className="flex-1">
                  <Text style={{ fontSize: 14 * fontScale, fontWeight: 'bold', color: textColor }}>
                    Eagle Eye!
                  </Text>
                  <Text style={{ fontSize: 12 * fontScale, color: textColor, marginTop: 2 }}>
                    Your attention to detail is impressive!
                  </Text>
                </View>
              </View>
            </View>
          )}

          {difficulty === 'hard' && accuracy >= 75 && (
            <View className="p-4 rounded-2xl" style={{ backgroundColor: '#E0E7FF' }}>
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">💎</Text>
                <View className="flex-1">
                  <Text style={{ fontSize: 14 * fontScale, fontWeight: 'bold', color: textColor }}>
                    Speed Master!
                  </Text>
                  <Text style={{ fontSize: 12 * fontScale, color: textColor, marginTop: 2 }}>
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
                <View className="flex-1">
                  <Text style={{ fontSize: 14 * fontScale, fontWeight: 'bold', color: textColor }}>
                    Quick Reflexes!
                  </Text>
                  <Text style={{ fontSize: 12 * fontScale, color: textColor, marginTop: 2 }}>
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
          <Text 
            className="font-semibold text-white" 
            style={{ fontSize: 18 * fontScale }}
          >
            Play Same Game
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.teal }}
          onPress={() => navigation.navigate('AttentionQuiz')}
        >
          <Text className="mr-2 text-2xl">🔄</Text>
          <Text 
            className="font-semibold text-white" 
            style={{ fontSize: 18 * fontScale }}
          >
            Try Different Level
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
          onPress={() => navigation.navigate('BrainGames')}
        >
          <Text className="mr-2 text-2xl">🎮</Text>
          <Text 
            className="font-semibold text-white" 
            style={{ fontSize: 18 * fontScale }}
          >
            More Games
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
          onPress={() => navigation.navigate('Home')}
        >
          <Text className="mr-2 text-2xl">🏠</Text>
          <Text 
            className="font-semibold text-white" 
            style={{ fontSize: 18 * fontScale }}
          >
            Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AttentionResults;