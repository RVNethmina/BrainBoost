// screens/Games/MemoryMatch/MemoryResultsScreen.tsx
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { saveMemoryResult } from '../../../services/memoryResultsService';

type MemoryResultsRouteProp = RouteProp<RootStackParamList, 'MemoryResults'>;
type MemoryResultsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MemoryResults'>;

const MemoryResultsScreen: React.FC = () => {
  const route = useRoute<MemoryResultsRouteProp>();
  const navigation = useNavigation<MemoryResultsNavigationProp>();
  const [saving, setSaving] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { score, totalQuestions, timeTaken, endedBy, gameType, level, difficulty } = route.params;

  // Calculate percentage
  const percentage = totalQuestions > 0
    ? Math.min(100, Math.round((score / totalQuestions) * 100))
    : 0;

  useEffect(() => {
    const saveResult = async () => {
      try {
        setSaving(true);
        setSaveError(null);

        const result = await saveMemoryResult({
          score,
          totalQuestions,
          timeTaken,
          level,
          endedBy,
          gameType,
          difficulty,
        });

        if (result.success) {
          console.log('✅ Memory result saved successfully:', result.id);
        } else {
          console.error('❌ Failed to save memory result:', result.error);
          setSaveError('Failed to save result');
        }
      } catch (error) {
        console.error('💥 Error saving memory result:', error);
        setSaveError('Error saving result');
      } finally {
        setSaving(false);
      }
    };

    saveResult();
  }, [score, totalQuestions, timeTaken, level, endedBy, gameType, difficulty]);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return 'Outstanding! 🌟';
    if (percentage >= 75) return 'Great job! 🎉';
    if (percentage >= 60) return 'Good effort! 👍';
    if (percentage >= 40) return 'Keep practicing! 💪';
    return 'Try again! 🎯';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getGameTypeLabel = () => {
    const labels: Record<string, string> = {
      pattern: 'Pattern Memory',
      cards: 'Card Matching',
      numbers: 'Number Memory',
      pictures: 'Picture Memory',
    };
    return labels[gameType] || 'Memory Game';
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Game Complete!</Text>
        
        {saving ? (
          <View style={styles.savingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.savingText}>Saving your result...</Text>
          </View>
        ) : saveError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {saveError}</Text>
            <Text style={styles.errorSubtext}>Your score is displayed below</Text>
          </View>
        ) : (
          <View style={styles.savedContainer}>
            <Text style={styles.savedText}>✓ Result saved successfully</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Game Type</Text>
            <Text style={styles.statValue}>{getGameTypeLabel()}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>{level}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={styles.statValue}>{difficulty.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.performanceText}>{getPerformanceMessage()}</Text>
          <Text style={styles.scoreText}>{percentage}%</Text>
          <Text style={styles.scoreDetail}>
            {score} / {totalQuestions} correct
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time Taken:</Text>
            <Text style={styles.detailValue}>{formatTime(timeTaken)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ended By:</Text>
            <Text style={styles.detailValue}>{endedBy}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('MemoryQuiz')}
          >
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
  },
  savingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  savingText: {
    marginTop: 10,
    color: '#7F8C8D',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  savedContainer: {
    backgroundColor: '#D4EDDA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C3E6CB',
  },
  savedText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
  },
  performanceText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  scoreDetail: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  detailsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#4A90E2',
  },
});

export default MemoryResultsScreen;