// app/src/screens/ProgressScreen.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { auth, firestore } from '@/config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ProgressScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Progress'
>;

interface GameStats {
  mathGames: number;
  memoryGames: number;
  attentionGames: number;
  totalGames: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: Date | null;
}

interface WeeklyData {
  day: string;
  games: number;
  score: number;
  time: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  date: Date;
  type: 'milestone' | 'streak' | 'performance' | 'improvement';
}

interface CognitiveScore {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: string;
}

const { width: screenWidth } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<ProgressScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    mathGames: 0,
    memoryGames: 0,
    attentionGames: 0,
    totalGames: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [cognitiveScores, setCognitiveScores] = useState<CognitiveScore[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchUserProgress();
    const unsubscribe = setupRealtimeListeners();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const setupRealtimeListeners = () => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Listen to real-time updates for user's results
      const unsubscribeMath = onSnapshot(
        query(collection(firestore, 'users', user.uid, 'mathResults'), orderBy('createdAt', 'desc'), limit(100)),
        () => fetchUserProgress(),
        (error) => console.error('Math results listener error:', error)
      );

      const unsubscribeMemory = onSnapshot(
        query(collection(firestore, 'users', user.uid, 'memoryResults'), orderBy('createdAt', 'desc'), limit(100)),
        () => fetchUserProgress(),
        (error) => console.error('Memory results listener error:', error)
      );

      const unsubscribeAttention = onSnapshot(
        query(collection(firestore, 'users', user.uid, 'attentionResults'), orderBy('createdAt', 'desc'), limit(100)),
        () => fetchUserProgress(),
        (error) => console.error('Attention results listener error:', error)
      );

      return () => {
        unsubscribeMath();
        unsubscribeMemory();
        unsubscribeAttention();
      };
    } catch (error) {
      console.error('Error setting up listeners:', error);
      setLoading(false);
      return undefined;
    }
  };

  const fetchUserProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch all game results
      const [mathResults, memoryResults, attentionResults] = await Promise.all([
        getDocs(query(collection(firestore, 'users', user.uid, 'mathResults'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(firestore, 'users', user.uid, 'memoryResults'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(firestore, 'users', user.uid, 'attentionResults'), orderBy('createdAt', 'desc'), limit(100))),
      ]);

      // Process statistics
      let totalScore = 0;
      let totalTime = 0;
      let bestScore = 0;
      let gameCount = 0;

      const processResults = (results: any) => {
        results.forEach((doc: any) => {
          const data = doc.data();
          gameCount++;
          totalScore += data.percentage || data.score || 0;
          totalTime += data.timeTaken || 0;
          bestScore = Math.max(bestScore, data.percentage || data.score || 0);
        });
      };

      processResults(mathResults);
      processResults(memoryResults);
      processResults(attentionResults);

      // Calculate weekly data
      const weekData = calculateWeeklyData(mathResults, memoryResults, attentionResults);

      // Calculate cognitive scores
      const cogScores = calculateCognitiveScores(mathResults, memoryResults, attentionResults);

      // Calculate streak
      const streak = calculateStreak(mathResults, memoryResults, attentionResults);

      const newStats = {
        mathGames: mathResults.size,
        memoryGames: memoryResults.size,
        attentionGames: attentionResults.size,
        totalGames: gameCount,
        averageScore: gameCount > 0 ? Math.round(totalScore / gameCount) : 0,
        bestScore: Math.round(bestScore),
        totalTimeSpent: totalTime,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        lastPlayedDate: streak.lastDate,
      };

      // Generate achievements
      const achievementsList = generateAchievements(newStats, gameCount, bestScore);

      setStats(newStats);
      setWeeklyData(weekData);
      setCognitiveScores(cogScores);
      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateWeeklyData = (mathResults: any, memoryResults: any, attentionResults: any): WeeklyData[] => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekData: WeeklyData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

      let dayGames = 0;
      let dayScore = 0;
      let dayTime = 0;

      const checkDate = (doc: any) => {
        const data = doc.data();
        const docDate = data.createdAt?.toDate() || new Date(data.timestamp);
        return docDate.toDateString() === date.toDateString();
      };

      [mathResults, memoryResults, attentionResults].forEach(results => {
        results.forEach((doc: any) => {
          if (checkDate(doc)) {
            const data = doc.data();
            dayGames++;
            dayScore += data.percentage || data.score || 0;
            dayTime += data.timeTaken || 0;
          }
        });
      });

      weekData.push({
        day: daysOfWeek[dayIndex],
        games: dayGames,
        score: dayGames > 0 ? Math.round(dayScore / dayGames) : 0,
        time: Math.round(dayTime / 60), // Convert to minutes
      });
    }

    return weekData;
  };

  const calculateCognitiveScores = (mathResults: any, memoryResults: any, attentionResults: any): CognitiveScore[] => {
    const calculateAverage = (results: any) => {
      if (results.size === 0) return 0;
      let total = 0;
      results.forEach((doc: any) => {
        const data = doc.data();
        total += data.percentage || data.score || 0;
      });
      return Math.round(total / results.size);
    };

    const calculateTrend = (results: any): 'up' | 'down' | 'stable' => {
      if (results.size < 2) return 'stable';
      const docs = results.docs;
      const recent = docs.slice(0, 3).reduce((acc: number, doc: any) => {
        return acc + (doc.data().percentage || doc.data().score || 0);
      }, 0) / Math.min(3, docs.length);
      const older = docs.slice(3, 6).reduce((acc: number, doc: any) => {
        return acc + (doc.data().percentage || doc.data().score || 0);
      }, 0) / Math.min(3, docs.length - 3);
      
      if (older === 0) return 'stable';
      const change = ((recent - older) / older) * 100;
      if (change > 5) return 'up';
      if (change < -5) return 'down';
      return 'stable';
    };

    return [
      {
        category: 'Problem Solving',
        score: calculateAverage(mathResults),
        trend: calculateTrend(mathResults),
        color: PALETTE.purple,
        icon: '🧮',
      },
      {
        category: 'Memory',
        score: calculateAverage(memoryResults),
        trend: calculateTrend(memoryResults),
        color: PALETTE.blue,
        icon: '🧠',
      },
      {
        category: 'Focus',
        score: calculateAverage(attentionResults),
        trend: calculateTrend(attentionResults),
        color: PALETTE.orange,
        icon: '🎯',
      },
      {
        category: 'Overall Health',
        score: Math.round((calculateAverage(mathResults) + calculateAverage(memoryResults) + calculateAverage(attentionResults)) / 3),
        trend: 'stable',
        color: PALETTE.green,
        icon: '❤️',
      },
    ];
  };

  const calculateStreak = (mathResults: any, memoryResults: any, attentionResults: any) => {
    const allDates: Date[] = [];
    
    [mathResults, memoryResults, attentionResults].forEach(results => {
      results.forEach((doc: any) => {
        const data = doc.data();
        const date = data.createdAt?.toDate() || new Date(data.timestamp);
        allDates.push(date);
      });
    });

    allDates.sort((a, b) => b.getTime() - a.getTime());
    
    if (allDates.length === 0) {
      return { current: 0, longest: 0, lastDate: null };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let streakCount = 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastPlay = new Date(allDates[0]);
    lastPlay.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((today.getTime() - lastPlay.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff <= 1) {
      currentStreak = 1;
    }

    for (let i = 1; i < allDates.length; i++) {
      const prevDate = new Date(allDates[i - 1]);
      const currDate = new Date(allDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        streakCount++;
        if (dayDiff <= 1 && i < 10) {
          currentStreak = streakCount;
        }
      } else if (diff > 1) {
        longestStreak = Math.max(longestStreak, streakCount);
        streakCount = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, streakCount, currentStreak);

    return {
      current: currentStreak,
      longest: longestStreak,
      lastDate: allDates[0],
    };
  };

  const generateAchievements = (stats: GameStats, totalGames: number, bestScore: number): Achievement[] => {
    const achievements: Achievement[] = [];
    const now = new Date();

    if (totalGames >= 1) {
      achievements.push({
        id: 'first_game',
        title: 'First Steps',
        description: 'Completed your first brain training game',
        icon: '🌟',
        color: PALETTE.yellow,
        date: now,
        type: 'milestone',
      });
    }

    if (totalGames >= 10) {
      achievements.push({
        id: 'ten_games',
        title: 'Getting Started',
        description: 'Completed 10 brain training games',
        icon: '🎯',
        color: PALETTE.blue,
        date: now,
        type: 'milestone',
      });
    }

    if (totalGames >= 50) {
      achievements.push({
        id: 'fifty_games',
        title: 'Brain Trainer',
        description: 'Completed 50 brain training games',
        icon: '🏆',
        color: PALETTE.purple,
        date: now,
        type: 'milestone',
      });
    }

    if (totalGames >= 100) {
      achievements.push({
        id: 'hundred_games',
        title: 'Century Club',
        description: 'Completed 100 brain training games',
        icon: '💯',
        color: PALETTE.orange,
        date: now,
        type: 'milestone',
      });
    }

    if (bestScore >= 90) {
      achievements.push({
        id: 'high_scorer',
        title: 'Excellence',
        description: 'Achieved a score of 90% or higher',
        icon: '⭐',
        color: PALETTE.green,
        date: now,
        type: 'performance',
      });
    }

    if (bestScore === 100) {
      achievements.push({
        id: 'perfect',
        title: 'Perfect Score',
        description: 'Achieved a perfect 100% score',
        icon: '💎',
        color: PALETTE.teal,
        date: now,
        type: 'performance',
      });
    }

    if (stats.currentStreak >= 3) {
      achievements.push({
        id: 'streak_3',
        title: 'Consistent',
        description: '3 day training streak',
        icon: '🔥',
        color: PALETTE.red,
        date: now,
        type: 'streak',
      });
    }

    if (stats.currentStreak >= 7) {
      achievements.push({
        id: 'streak_7',
        title: 'Week Warrior',
        description: '7 day training streak',
        icon: '🌈',
        color: PALETTE.purple,
        date: now,
        type: 'streak',
      });
    }

    if (stats.currentStreak >= 30) {
      achievements.push({
        id: 'streak_30',
        title: 'Monthly Master',
        description: '30 day training streak',
        icon: '👑',
        color: PALETTE.orange,
        date: now,
        type: 'streak',
      });
    }

    return achievements.slice(0, 6); // Return top 6 achievements
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...weeklyData.map(d => d.games), 1);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Activity</Text>
        <View style={styles.barChart}>
          {weeklyData.map((data, index) => {
            const height = maxValue > 0 ? (data.games / maxValue) * 120 : 0;
            const isToday = index === weeklyData.length - 1;
            const hasActivity = data.games > 0;
            
            return (
              <TouchableOpacity
                key={data.day}
                style={styles.barColumn}
                onPress={() => {
                  // Could show detail modal here
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.barValue}>{data.games > 0 ? data.games : ''}</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 3),
                        backgroundColor: isToday
                          ? PALETTE.purple
                          : hasActivity
                          ? PALETTE.lightTeal
                          : '#E5E7EB',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, isToday && styles.todayLabel]}>
                  {data.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCognitiveScores = () => {
    return (
      <View style={styles.cognitiveContainer}>
        <Text style={styles.sectionTitle}>Cognitive Health Score</Text>
        <View style={styles.cognitiveGrid}>
          {cognitiveScores.map((score, index) => (
            <View key={index} style={styles.cognitiveCard}>
              <Text style={styles.cognitiveIcon}>{score.icon}</Text>
              <Text style={styles.cognitiveCategory}>{score.category}</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.cognitiveScore, { color: score.color }]}>
                  {score.score}%
                </Text>
                {score.trend !== 'stable' && (
                  <Text style={[styles.trendIndicator, { color: score.trend === 'up' ? PALETTE.green : PALETTE.red }]}>
                    {score.trend === 'up' ? '↑' : '↓'}
                  </Text>
                )}
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${score.score}%`,
                      backgroundColor: score.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProgress();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PALETTE.purple} />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PALETTE.lightTeal }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Progress</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={onRefresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh data"
        >
          <Text style={styles.headerButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PALETTE.purple]} />
        }
      >
        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <View style={[styles.overviewCard, { backgroundColor: PALETTE.yellow }]}>
            <Text style={styles.overviewEmoji}>🎮</Text>
            <Text style={styles.overviewLabel}>Total Games</Text>
            <Text style={[styles.overviewValue, { color: PALETTE.purple }]}>
              {stats.totalGames}
            </Text>
          </View>

          <View style={[styles.overviewCard, { backgroundColor: PALETTE.lightPink }]}>
            <Text style={styles.overviewEmoji}>🔥</Text>
            <Text style={styles.overviewLabel}>Current Streak</Text>
            <Text style={[styles.overviewValue, { color: PALETTE.orange }]}>
              {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>

          <View style={[styles.overviewCard, { backgroundColor: '#E0E7FF' }]}>
            <Text style={styles.overviewEmoji}>📊</Text>
            <Text style={styles.overviewLabel}>Average Score</Text>
            <Text style={[styles.overviewValue, { color: PALETTE.indigo }]}>
              {stats.averageScore}%
            </Text>
          </View>

          <View style={[styles.overviewCard, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.overviewEmoji}>⏱️</Text>
            <Text style={styles.overviewLabel}>Time Trained</Text>
            <Text style={[styles.overviewValue, { color: PALETTE.green }]}>
              {formatTime(stats.totalTimeSpent)}
            </Text>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        {renderBarChart()}

        {/* Cognitive Scores */}
        {renderCognitiveScores()}

        {/* Game Distribution */}
        <View style={styles.distributionCard}>
          <Text style={styles.sectionTitle}>Activity Distribution</Text>
          <View style={styles.distributionContainer}>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: PALETTE.purple }]}>
                <Text style={styles.distributionEmoji}>🧮</Text>
              </View>
              <View style={styles.distributionDetails}>
                <Text style={styles.distributionLabel}>Math Games</Text>
                <Text style={styles.distributionValue}>{stats.mathGames} played</Text>
              </View>
            </View>

            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: PALETTE.blue }]}>
                <Text style={styles.distributionEmoji}>🧠</Text>
              </View>
              <View style={styles.distributionDetails}>
                <Text style={styles.distributionLabel}>Memory Games</Text>
                <Text style={styles.distributionValue}>{stats.memoryGames} played</Text>
              </View>
            </View>

            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: PALETTE.orange }]}>
                <Text style={styles.distributionEmoji}>🎯</Text>
              </View>
              <View style={styles.distributionDetails}>
                <Text style={styles.distributionLabel}>Attention Games</Text>
                <Text style={styles.distributionValue}>{stats.attentionGames} played</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>{achievements.length} earned</Text>
          </View>
          <View style={styles.achievementsList}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[styles.achievementItem, { borderLeftColor: achievement.color }]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              </View>
            ))}
            {achievements.length === 0 && (
              <View style={styles.emptyAchievements}>
                <Text style={styles.emptyIcon}>🏆</Text>
                <Text style={styles.emptyText}>Start playing to earn achievements!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Motivational Footer */}
        <View style={styles.motivationalCard}>
          <Text style={styles.motivationalEmoji}>💪</Text>
          <Text style={styles.motivationalText}>
            {stats.currentStreak > 0
              ? `Great job! Keep your ${stats.currentStreak} day streak going!`
              : 'Start your brain training journey today!'}
          </Text>
          {stats.lastPlayedDate && (
            <Text style={styles.lastPlayedText}>
              Last played: {stats.lastPlayedDate.toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PALETTE.neutralMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerButtonText: {
    fontSize: 24,
    color: PALETTE.neutralDark,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  overviewCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  overviewEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  overviewLabel: {
    fontSize: 14,
    color: PALETTE.neutralDark,
    fontWeight: '500',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.neutralDark,
    marginBottom: 20,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 8,
    minHeight: 3,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.neutralDark,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 12,
    color: PALETTE.neutralMuted,
    marginTop: 8,
    fontWeight: '500',
  },
  todayLabel: {
    color: PALETTE.purple,
    fontWeight: '700',
  },
  cognitiveContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.neutralDark,
    marginBottom: 16,
  },
  cognitiveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cognitiveCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cognitiveIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cognitiveCategory: {
    fontSize: 13,
    color: PALETTE.neutralMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cognitiveScore: {
    fontSize: 28,
    fontWeight: '800',
  },
  trendIndicator: {
    fontSize: 20,
    marginLeft: 8,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  distributionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  distributionContainer: {
    marginTop: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  distributionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  distributionEmoji: {
    fontSize: 28,
  },
  distributionDetails: {
    flex: 1,
  },
  distributionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.neutralDark,
    marginBottom: 4,
  },
  distributionValue: {
    fontSize: 14,
    color: PALETTE.neutralMuted,
  },
  achievementsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementCount: {
    fontSize: 14,
    color: PALETTE.neutralMuted,
    fontWeight: '500',
  },
  achievementsList: {
    marginTop: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.neutralDark,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: PALETTE.neutralMuted,
    lineHeight: 20,
  },
  emptyAchievements: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: PALETTE.neutralMuted,
    textAlign: 'center',
  },
  motivationalCard: {
    backgroundColor: PALETTE.lightTeal,
    borderRadius: 20,
    padding: 24,
    marginTop: 12,
    alignItems: 'center',
  },
  motivationalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  motivationalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 26,
  },
  lastPlayedText: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 8,
    opacity: 0.9,
  },
});


export default ProgressScreen;
export { ProgressScreen };

