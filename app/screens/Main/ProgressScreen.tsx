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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
  mathAssessments: number;
  totalGames: number;
  totalAssessments: number;
  averageScore: number;
  averageAssessmentScore: number;
  bestScore: number;
  bestAssessmentScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: Date | null;
  cognitiveImprovement: number;
}

interface WeeklyData {
  day: string;
  games: number;
  assessments: number;
  score: number;
  assessmentScore: number;
  time: number;
  date: Date;
}

interface MonthlyData {
  month: string;
  games: number;
  assessments: number;
  avgScore: number;
  avgAssessmentScore: number;
  totalTime: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  date: Date;
  type: 'milestone' | 'streak' | 'performance' | 'improvement' | 'assessment';
  progress?: number;
  maxProgress?: number;
}

interface CognitiveScore {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: string;
  change: number;
  description: string;
}

interface AssessmentBreakdown {
  cognitiveLevel: string;
  count: number;
  percentage: number;
  averageScore: number;
  color: string;
}

const { width: screenWidth } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<ProgressScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedChart, setSelectedChart] = useState<'activity' | 'performance' | 'cognitive'>('activity');
  const [animatedValue] = useState(new Animated.Value(0));

  const [stats, setStats] = useState<GameStats>({
    mathGames: 0,
    memoryGames: 0,
    attentionGames: 0,
    mathAssessments: 0,
    totalGames: 0,
    totalAssessments: 0,
    averageScore: 0,
    averageAssessmentScore: 0,
    bestScore: 0,
    bestAssessmentScore: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    cognitiveImprovement: 0,
  });

  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [cognitiveScores, setCognitiveScores] = useState<CognitiveScore[]>([]);
  const [assessmentBreakdown, setAssessmentBreakdown] = useState<AssessmentBreakdown[]>([]);

  useEffect(() => {
    fetchUserProgress();
    const unsubscribe = setupRealtimeListeners();
    
    // Animate in
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const setupRealtimeListeners = useCallback(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
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

      const unsubscribeAssessments = onSnapshot(
        query(collection(firestore, 'users', user.uid, 'mathAssessments'), orderBy('createdAt', 'desc'), limit(50)),
        () => fetchUserProgress(),
        (error) => console.error('Assessment results listener error:', error)
      );

      return () => {
        unsubscribeMath();
        unsubscribeMemory();
        unsubscribeAttention();
        unsubscribeAssessments();
      };
    } catch (error) {
      console.error('Error setting up listeners:', error);
      setLoading(false);
      return undefined;
    }
  }, []);

  const fetchUserProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const [mathResults, memoryResults, attentionResults, assessmentResults] = await Promise.all([
        getDocs(query(collection(firestore, 'users', user.uid, 'mathResults'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(firestore, 'users', user.uid, 'memoryResults'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(firestore, 'users', user.uid, 'attentionResults'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(firestore, 'users', user.uid, 'mathAssessments'), orderBy('createdAt', 'desc'), limit(50))),
      ]);

      // Process all data
      const processedStats = calculateEnhancedStats(mathResults, memoryResults, attentionResults, assessmentResults);
      const weekData = calculateEnhancedWeeklyData(mathResults, memoryResults, attentionResults, assessmentResults);
      const monthData = calculateMonthlyData(mathResults, memoryResults, attentionResults, assessmentResults);
      const cogScores = calculateEnhancedCognitiveScores(mathResults, memoryResults, attentionResults, assessmentResults);
      const streak = calculateStreak(mathResults, memoryResults, attentionResults, assessmentResults);
      const assessmentData = calculateAssessmentBreakdown(assessmentResults);

      const finalStats = {
        ...processedStats,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        lastPlayedDate: streak.lastDate,
      };

      const achievementsList = generateEnhancedAchievements(finalStats);

      setStats(finalStats);
      setWeeklyData(weekData);
      setMonthlyData(monthData);
      setCognitiveScores(cogScores);
      setAchievements(achievementsList);
      setAssessmentBreakdown(assessmentData);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateEnhancedStats = (mathResults: any, memoryResults: any, attentionResults: any, assessmentResults: any) => {
    let totalScore = 0;
    let totalAssessmentScore = 0;
    let totalTime = 0;
    let bestScore = 0;
    let bestAssessmentScore = 0;
    let gameCount = 0;
    let assessmentCount = 0;

    const processGameResults = (results: any) => {
      results.forEach((doc: any) => {
        const data = doc.data();
        gameCount++;
        const score = data.percentage || data.score || 0;
        totalScore += score;
        totalTime += data.timeTaken || 0;
        bestScore = Math.max(bestScore, score);
      });
    };

    const processAssessmentResults = (results: any) => {
      results.forEach((doc: any) => {
        const data = doc.data();
        assessmentCount++;
        const score = data.score || 0;
        totalAssessmentScore += score;
        bestAssessmentScore = Math.max(bestAssessmentScore, score);
      });
    };

    processGameResults(mathResults);
    processGameResults(memoryResults);
    processGameResults(attentionResults);
    processAssessmentResults(assessmentResults);

    // Calculate cognitive improvement trend
    const cognitiveImprovement = calculateCognitiveImprovement(mathResults, memoryResults, attentionResults);

    return {
      mathGames: mathResults.size,
      memoryGames: memoryResults.size,
      attentionGames: attentionResults.size,
      mathAssessments: assessmentResults.size,
      totalGames: gameCount,
      totalAssessments: assessmentCount,
      averageScore: gameCount > 0 ? Math.round(totalScore / gameCount) : 0,
      averageAssessmentScore: assessmentCount > 0 ? Math.round(totalAssessmentScore / assessmentCount) : 0,
      bestScore: Math.round(bestScore),
      bestAssessmentScore: Math.round(bestAssessmentScore),
      totalTimeSpent: totalTime,
      cognitiveImprovement,
    };
  };

  const calculateCognitiveImprovement = (mathResults: any, memoryResults: any, attentionResults: any) => {
    const allResults: any[] = [];
    [mathResults, memoryResults, attentionResults].forEach(results => {
      results.forEach((doc: any) => {
        const data = doc.data();
        const date = data.createdAt?.toDate() || new Date(data.timestamp);
        allResults.push({
          score: data.percentage || data.score || 0,
          date: date
        });
      });
    });

    if (allResults.length < 4) return 0;

    allResults.sort((a, b) => a.date.getTime() - b.date.getTime());

    const firstQuarter = allResults.slice(0, Math.floor(allResults.length / 4));
    const lastQuarter = allResults.slice(-Math.floor(allResults.length / 4));

    const firstAvg = firstQuarter.reduce((sum, item) => sum + item.score, 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((sum, item) => sum + item.score, 0) / lastQuarter.length;

    return Math.round(((lastAvg - firstAvg) / firstAvg) * 100) || 0;
  };

  const calculateEnhancedWeeklyData = (mathResults: any, memoryResults: any, attentionResults: any, assessmentResults: any): WeeklyData[] => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekData: WeeklyData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

      let dayGames = 0;
      let dayAssessments = 0;
      let dayScore = 0;
      let dayAssessmentScore = 0;
      let dayTime = 0;

      const checkDate = (doc: any) => {
        const data = doc.data();
        const docDate = data.createdAt?.toDate() || new Date(data.timestamp);
        return docDate.toDateString() === date.toDateString();
      };

      // Process game results
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

      // Process assessment results
      assessmentResults.forEach((doc: any) => {
        if (checkDate(doc)) {
          const data = doc.data();
          dayAssessments++;
          dayAssessmentScore += data.score || 0;
        }
      });

      weekData.push({
        day: daysOfWeek[dayIndex],
        games: dayGames,
        assessments: dayAssessments,
        score: dayGames > 0 ? Math.round(dayScore / dayGames) : 0,
        assessmentScore: dayAssessments > 0 ? Math.round(dayAssessmentScore / dayAssessments) : 0,
        time: Math.round(dayTime / 60),
        date: new Date(date),
      });
    }

    return weekData;
  };

  const calculateMonthlyData = (mathResults: any, memoryResults: any, attentionResults: any, assessmentResults: any): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthData: MonthlyData[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = new Date().getFullYear() - (currentMonth - i < 0 ? 1 : 0);
      
      let monthGames = 0;
      let monthAssessments = 0;
      let monthScore = 0;
      let monthAssessmentScore = 0;
      let monthTime = 0;

      const checkMonth = (doc: any) => {
        const data = doc.data();
        const docDate = data.createdAt?.toDate() || new Date(data.timestamp);
        return docDate.getMonth() === monthIndex && docDate.getFullYear() === year;
      };

      [mathResults, memoryResults, attentionResults].forEach(results => {
        results.forEach((doc: any) => {
          if (checkMonth(doc)) {
            const data = doc.data();
            monthGames++;
            monthScore += data.percentage || data.score || 0;
            monthTime += data.timeTaken || 0;
          }
        });
      });

      assessmentResults.forEach((doc: any) => {
        if (checkMonth(doc)) {
          const data = doc.data();
          monthAssessments++;
          monthAssessmentScore += data.score || 0;
        }
      });

      monthData.push({
        month: months[monthIndex],
        games: monthGames,
        assessments: monthAssessments,
        avgScore: monthGames > 0 ? Math.round(monthScore / monthGames) : 0,
        avgAssessmentScore: monthAssessments > 0 ? Math.round(monthAssessmentScore / monthAssessments) : 0,
        totalTime: monthTime,
      });
    }

    return monthData;
  };

  const calculateEnhancedCognitiveScores = (mathResults: any, memoryResults: any, attentionResults: any, assessmentResults: any): CognitiveScore[] => {
    const calculateAverage = (results: any) => {
      if (results.size === 0) return 0;
      let total = 0;
      results.forEach((doc: any) => {
        const data = doc.data();
        total += data.percentage || data.score || 0;
      });
      return Math.round(total / results.size);
    };

    const calculateTrendAndChange = (results: any): { trend: 'up' | 'down' | 'stable', change: number } => {
      if (results.size < 4) return { trend: 'stable', change: 0 };
      
      const docs = Array.from(results.docs);
      const recent = docs.slice(0, Math.floor(docs.length / 2));
      const older = docs.slice(Math.floor(docs.length / 2));
      
      const recentAvg = recent.reduce((acc: number, doc: any) => {
        return acc + (doc.data().percentage || doc.data().score || 0);
      }, 0) / recent.length;
      
      const olderAvg = older.reduce((acc: number, doc: any) => {
        return acc + (doc.data().percentage || doc.data().score || 0);
      }, 0) / older.length;
      
      if (olderAvg === 0) return { trend: 'stable', change: 0 };
      
      const change = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (change > 5) trend = 'up';
      else if (change < -5) trend = 'down';
      
      return { trend, change };
    };

    const mathTrend = calculateTrendAndChange(mathResults);
    const memoryTrend = calculateTrendAndChange(memoryResults);
    const attentionTrend = calculateTrendAndChange(attentionResults);

    // Calculate assessment cognitive level
    const assessmentAvg = assessmentResults.size > 0 
      ? Array.from(assessmentResults.docs).reduce((acc: number, doc: any) => {
          return acc + (doc.data().score || 0);
        }, 0) / assessmentResults.size
      : 0;

    return [
      {
        category: 'Problem Solving',
        score: calculateAverage(mathResults),
        trend: mathTrend.trend,
        change: mathTrend.change,
        color: PALETTE.purple,
        icon: '🧮',
        description: mathTrend.change > 0 ? `+${mathTrend.change}% improvement` : mathTrend.change < 0 ? `${mathTrend.change}% decline` : 'Stable performance',
      },
      {
        category: 'Memory',
        score: calculateAverage(memoryResults),
        trend: memoryTrend.trend,
        change: memoryTrend.change,
        color: PALETTE.blue,
        icon: '🧠',
        description: memoryTrend.change > 0 ? `+${memoryTrend.change}% improvement` : memoryTrend.change < 0 ? `${memoryTrend.change}% decline` : 'Stable performance',
      },
      {
        category: 'Focus',
        score: calculateAverage(attentionResults),
        trend: attentionTrend.trend,
        change: attentionTrend.change,
        color: PALETTE.orange,
        icon: '🎯',
        description: attentionTrend.change > 0 ? `+${attentionTrend.change}% improvement` : attentionTrend.change < 0 ? `${attentionTrend.change}% decline` : 'Stable performance',
      },
      {
        category: 'Assessment Health',
        score: Math.round(assessmentAvg),
        trend: 'stable',
        change: 0,
        color: PALETTE.green,
        icon: '📋',
        description: `Based on ${assessmentResults.size} assessments`,
      },
      {
        category: 'Overall Health',
        score: Math.round((calculateAverage(mathResults) + calculateAverage(memoryResults) + calculateAverage(attentionResults)) / 3),
        trend: 'stable',
        change: stats.cognitiveImprovement,
        color: PALETTE.teal,
        icon: '❤️',
        description: stats.cognitiveImprovement > 0 ? `+${stats.cognitiveImprovement}% overall improvement` : 'Comprehensive cognitive health',
      },
    ];
  };

  const calculateAssessmentBreakdown = (assessmentResults: any): AssessmentBreakdown[] => {
    if (assessmentResults.size === 0) return [];

    const breakdown: { [key: string]: { count: number; totalScore: number } } = {};
    
    assessmentResults.forEach((doc: any) => {
      const data = doc.data();
      const level = data.cognitiveLevel || 'unknown';
      const score = data.score || 0;
      
      if (!breakdown[level]) {
        breakdown[level] = { count: 0, totalScore: 0 };
      }
      breakdown[level].count++;
      breakdown[level].totalScore += score;
    });

    const total = assessmentResults.size;
    const colors = {
      excellent: PALETTE.green,
      good: PALETTE.blue,
      fair: PALETTE.orange,
      needs_attention: PALETTE.red,
      unknown: PALETTE.neutralMuted,
    };

    return Object.entries(breakdown).map(([level, data]) => ({
      cognitiveLevel: level.replace('_', ' ').toUpperCase(),
      count: data.count,
      percentage: Math.round((data.count / total) * 100),
      averageScore: Math.round(data.totalScore / data.count),
      color: colors[level as keyof typeof colors] || PALETTE.neutralMuted,
    }));
  };

  const calculateStreak = (mathResults: any, memoryResults: any, attentionResults: any, assessmentResults: any) => {
    const allDates: Date[] = [];
    
    [mathResults, memoryResults, attentionResults, assessmentResults].forEach(results => {
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
        if (dayDiff <= 1 && i < 20) {
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

  const generateEnhancedAchievements = (stats: GameStats): Achievement[] => {
    const achievements: Achievement[] = [];
    const now = new Date();

    // Game milestones
    if (stats.totalGames >= 1) {
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

    if (stats.totalGames >= 25) {
      achievements.push({
        id: 'quarter_century',
        title: 'Quarter Century',
        description: 'Completed 25 brain training games',
        icon: '🎯',
        color: PALETTE.blue,
        date: now,
        type: 'milestone',
      });
    }

    if (stats.totalGames >= 100) {
      achievements.push({
        id: 'century_club',
        title: 'Century Club',
        description: 'Completed 100 brain training games',
        icon: '💯',
        color: PALETTE.purple,
        date: now,
        type: 'milestone',
      });
    }

    // Assessment achievements
    if (stats.totalAssessments >= 1) {
      achievements.push({
        id: 'first_assessment',
        title: 'Assessment Pioneer',
        description: 'Completed your first cognitive assessment',
        icon: '📋',
        color: PALETTE.teal,
        date: now,
        type: 'assessment',
      });
    }

    if (stats.totalAssessments >= 10) {
      achievements.push({
        id: 'assessment_master',
        title: 'Assessment Master',
        description: 'Completed 10 cognitive assessments',
        icon: '🔬',
        color: PALETTE.indigo,
        date: now,
        type: 'assessment',
      });
    }

    // Performance achievements
    if (stats.bestScore >= 95) {
      achievements.push({
        id: 'near_perfect',
        title: 'Near Perfect',
        description: 'Achieved 95%+ score in games',
        icon: '⭐',
        color: PALETTE.green,
        date: now,
        type: 'performance',
      });
    }

    if (stats.bestAssessmentScore >= 90) {
      achievements.push({
        id: 'assessment_excellence',
        title: 'Assessment Excellence',
        description: 'Scored 90%+ on cognitive assessment',
        icon: '🏆',
        color: PALETTE.orange,
        date: now,
        type: 'assessment',
      });
    }

    // Improvement achievements
    if (stats.cognitiveImprovement >= 20) {
      achievements.push({
        id: 'rapid_improvement',
        title: 'Rapid Improvement',
        description: '20%+ cognitive improvement detected',
        icon: '📈',
        color: PALETTE.green,
        date: now,
        type: 'improvement',
      });
    }

    // Streak achievements
    if (stats.currentStreak >= 7) {
      achievements.push({
        id: 'week_warrior',
        title: 'Week Warrior',
        description: '7 day training streak',
        icon: '🔥',
        color: PALETTE.red,
        date: now,
        type: 'streak',
        progress: stats.currentStreak,
        maxProgress: 30,
      });
    }

    if (stats.currentStreak >= 30) {
      achievements.push({
        id: 'monthly_master',
        title: 'Monthly Master',
        description: '30 day training streak',
        icon: '👑',
        color: PALETTE.purple,
        date: now,
        type: 'streak',
      });
    }

    return achievements.slice(0, 8);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period && styles.periodButtonTextActive
          ]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChartSelector = () => (
    <View style={styles.chartSelector}>
      {([
        { key: 'activity', label: 'Activity', icon: '📊' },
        { key: 'performance', label: 'Performance', icon: '🎯' },
        { key: 'cognitive', label: 'Cognitive', icon: '🧠' }
      ] as const).map((chart) => (
        <TouchableOpacity
          key={chart.key}
          style={[
            styles.chartButton,
            selectedChart === chart.key && styles.chartButtonActive
          ]}
          onPress={() => setSelectedChart(chart.key)}
        >
          <Text style={styles.chartIcon}>{chart.icon}</Text>
          <Text style={[
            styles.chartButtonText,
            selectedChart === chart.key && styles.chartButtonTextActive
          ]}>
            {chart.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEnhancedBarChart = () => {
    const data = selectedPeriod === 'week' ? weeklyData : monthlyData;
    const maxValue = selectedPeriod === 'week' 
      ? Math.max(...weeklyData.map(d => Math.max(d.games, d.assessments)), 1)
      : Math.max(...monthlyData.map(d => Math.max(d.games, d.assessments)), 1);
    
    return (
      <Animated.View style={[
        styles.chartContainer,
        { opacity: animatedValue }
      ]}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>
            {selectedChart === 'activity' ? 'Activity Overview' : 
             selectedChart === 'performance' ? 'Performance Trends' : 
             'Cognitive Progress'}
          </Text>
          {renderChartSelector()}
        </View>
        
        {renderPeriodSelector()}

        <View style={styles.enhancedBarChart}>
          {selectedPeriod === 'week' ? weeklyData.map((data, index) => {
            const gameHeight = maxValue > 0 ? (data.games / maxValue) * 120 : 0;
            const assessmentHeight = maxValue > 0 ? (data.assessments / maxValue) * 120 : 0;
            const isToday = index === weeklyData.length - 1;
            
            return (
              <TouchableOpacity
                key={data.day}
                style={styles.barColumn}
                onPress={() => {
                  // Could show detail modal
                }}
                activeOpacity={0.7}
              >
                <View style={styles.barValues}>
                  {data.games > 0 && (
                    <Text style={styles.barValueText}>{data.games}</Text>
                  )}
                  {data.assessments > 0 && (
                    <Text style={[styles.barValueText, { color: PALETTE.purple }]}>
                      {data.assessments}A
                    </Text>
                  )}
                </View>
                
                <View style={styles.barContainer}>
                  {/* Games bar */}
                  {gameHeight > 0 && (
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(gameHeight, 3),
                          backgroundColor: isToday ? PALETTE.purple : PALETTE.lightTeal,
                          marginBottom: 2,
                        },
                      ]}
                    />
                  )}
                  
                  {/* Assessments bar */}
                  {assessmentHeight > 0 && (
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(assessmentHeight, 3),
                          backgroundColor: PALETTE.orange,
                        },
                      ]}
                    />
                  )}
                </View>
                
                <Text style={[styles.barLabel, isToday && styles.todayLabel]}>
                  {data.day}
                </Text>
              </TouchableOpacity>
            );
          }) : monthlyData.map((data, index) => {
            const gameHeight = maxValue > 0 ? (data.games / maxValue) * 120 : 0;
            const assessmentHeight = maxValue > 0 ? (data.assessments / maxValue) * 120 : 0;
            const isCurrentMonth = index === monthlyData.length - 1;
            
            return (
              <View key={data.month} style={styles.barColumn}>
                <View style={styles.barValues}>
                  {data.games > 0 && (
                    <Text style={styles.barValueText}>{data.games}</Text>
                  )}
                  {data.assessments > 0 && (
                    <Text style={[styles.barValueText, { color: PALETTE.purple }]}>
                      {data.assessments}A
                    </Text>
                  )}
                </View>
                
                <View style={styles.barContainer}>
                  {gameHeight > 0 && (
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(gameHeight, 3),
                          backgroundColor: isCurrentMonth ? PALETTE.purple : PALETTE.lightTeal,
                          marginBottom: 2,
                        },
                      ]}
                    />
                  )}
                  
                  {assessmentHeight > 0 && (
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(assessmentHeight, 3),
                          backgroundColor: PALETTE.orange,
                        },
                      ]}
                    />
                  )}
                </View>
                
                <Text style={[styles.barLabel, isCurrentMonth && styles.todayLabel]}>
                  {data.month}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: PALETTE.lightTeal }]} />
            <Text style={styles.legendText}>Games</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: PALETTE.orange }]} />
            <Text style={styles.legendText}>Assessments</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderCognitiveScores = () => {
    return (
      <Animated.View style={[
        styles.cognitiveContainer,
        { opacity: animatedValue }
      ]}>
        <Text style={styles.sectionTitle}>Cognitive Health Dashboard</Text>
        <View style={styles.cognitiveGrid}>
          {cognitiveScores.map((score, index) => (
            <View key={index} style={styles.enhancedCognitiveCard}>
              <View style={styles.cognitiveHeader}>
                <Text style={styles.cognitiveIcon}>{score.icon}</Text>
                <View style={styles.cognitiveInfo}>
                  <Text style={styles.cognitiveCategory}>{score.category}</Text>
                  <Text style={styles.cognitiveDescription}>{score.description}</Text>
                </View>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={[styles.cognitiveScore, { color: score.color }]}>
                  {score.score}%
                </Text>
                {score.trend !== 'stable' && (
                  <View style={styles.trendContainer}>
                    <Text style={[
                      styles.trendIndicator, 
                      { color: score.trend === 'up' ? PALETTE.green : PALETTE.red }
                    ]}>
                      {score.trend === 'up' ? '↗' : '↘'}
                    </Text>
                    <Text style={[
                      styles.trendText,
                      { color: score.trend === 'up' ? PALETTE.green : PALETTE.red }
                    ]}>
                      {Math.abs(score.change)}%
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.progressBarBackground}>
                <Animated.View
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
      </Animated.View>
    );
  };

  const renderAssessmentBreakdown = () => {
    if (assessmentBreakdown.length === 0) return null;

    return (
      <Animated.View style={[
        styles.assessmentCard,
        { opacity: animatedValue }
      ]}>
        <Text style={styles.sectionTitle}>Assessment Results Breakdown</Text>
        <Text style={styles.assessmentSubtitle}>
          Based on {stats.totalAssessments} cognitive assessments
        </Text>
        
        <View style={styles.assessmentBreakdownContainer}>
          {assessmentBreakdown.map((item, index) => (
            <View key={index} style={styles.assessmentBreakdownItem}>
              <View style={styles.assessmentBreakdownHeader}>
                <View style={[
                  styles.assessmentLevelIndicator,
                  { backgroundColor: item.color }
                ]} />
                <Text style={styles.assessmentLevelText}>{item.cognitiveLevel}</Text>
                <Text style={styles.assessmentPercentage}>{item.percentage}%</Text>
              </View>
              
              <View style={styles.assessmentDetails}>
                <Text style={styles.assessmentCount}>{item.count} assessments</Text>
                <Text style={styles.assessmentAverage}>Avg: {item.averageScore}%</Text>
              </View>
              
              <View style={styles.assessmentProgressBackground}>
                <View
                  style={[
                    styles.assessmentProgressFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.viewAssessmentsButton}
          onPress={() => navigation.navigate('AssessmentTest' as any)}
        >
          <Text style={styles.viewAssessmentsText}>Take New Assessment</Text>
          <Text style={styles.viewAssessmentsArrow}>→</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserProgress();
  }, []);

  const memoizedOverviewCards = useMemo(() => (
    <Animated.View style={[
      styles.overviewGrid,
      { opacity: animatedValue }
    ]}>
      <View style={[styles.overviewCard, { backgroundColor: PALETTE.yellow }]}>
        <Text style={styles.overviewEmoji}>🎮</Text>
        <Text style={styles.overviewLabel}>Total Games</Text>
        <Text style={[styles.overviewValue, { color: PALETTE.purple }]}>
          {stats.totalGames}
        </Text>
        <Text style={styles.overviewSubValue}>
          +{stats.totalAssessments} assessments
        </Text>
      </View>

      <View style={[styles.overviewCard, { backgroundColor: PALETTE.lightPink }]}>
        <Text style={styles.overviewEmoji}>🔥</Text>
        <Text style={styles.overviewLabel}>Current Streak</Text>
        <Text style={[styles.overviewValue, { color: PALETTE.orange }]}>
          {stats.currentStreak}
        </Text>
        <Text style={styles.overviewSubValue}>
          Best: {stats.longestStreak} days
        </Text>
      </View>

      <View style={[styles.overviewCard, { backgroundColor: '#E0E7FF' }]}>
        <Text style={styles.overviewEmoji}>📊</Text>
        <Text style={styles.overviewLabel}>Game Average</Text>
        <Text style={[styles.overviewValue, { color: PALETTE.indigo }]}>
          {stats.averageScore}%
        </Text>
        <Text style={styles.overviewSubValue}>
          Best: {stats.bestScore}%
        </Text>
      </View>

      <View style={[styles.overviewCard, { backgroundColor: '#DCFCE7' }]}>
        <Text style={styles.overviewEmoji}>🧠</Text>
        <Text style={styles.overviewLabel}>Assessment Avg</Text>
        <Text style={[styles.overviewValue, { color: PALETTE.green }]}>
          {stats.averageAssessmentScore || 0}%
        </Text>
        <Text style={styles.overviewSubValue}>
          Best: {stats.bestAssessmentScore || 0}%
        </Text>
      </View>

      <View style={[styles.overviewCard, { backgroundColor: PALETTE.lightTeal }]}>
        <Text style={styles.overviewEmoji}>⏱️</Text>
        <Text style={styles.overviewLabel}>Time Trained</Text>
        <Text style={[styles.overviewValue, { color: PALETTE.teal }]}>
          {formatTime(stats.totalTimeSpent)}
        </Text>
        <Text style={styles.overviewSubValue}>
          Total practice
        </Text>
      </View>

      <View style={[styles.overviewCard, { backgroundColor: '#FEF3E2' }]}>
        <Text style={styles.overviewEmoji}>📈</Text>
        <Text style={styles.overviewLabel}>Improvement</Text>
        <Text style={[
          styles.overviewValue, 
          { color: stats.cognitiveImprovement >= 0 ? PALETTE.green : PALETTE.red }
        ]}>
          {stats.cognitiveImprovement >= 0 ? '+' : ''}{stats.cognitiveImprovement}%
        </Text>
        <Text style={styles.overviewSubValue}>
          Overall progress
        </Text>
      </View>
    </Animated.View>
  ), [stats, animatedValue]);

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
      {/* Enhanced Header */}
      <Animated.View style={[
        styles.header, 
        { backgroundColor: PALETTE.lightTeal, opacity: animatedValue }
      ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Progress</Text>
          <Text style={styles.headerSubtitle}>
            {stats.totalGames + stats.totalAssessments} activities completed
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={onRefresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh data"
        >
          <Text style={styles.headerButtonText}>↻</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[PALETTE.purple]}
            tintColor={PALETTE.purple}
          />
        }
      >
        {/* Enhanced Overview Cards */}
        {memoizedOverviewCards}

        {/* Enhanced Activity Chart */}
        {renderEnhancedBarChart()}

        {/* Cognitive Scores */}
        {renderCognitiveScores()}

        {/* Assessment Breakdown */}
        {renderAssessmentBreakdown()}

        {/* Enhanced Game Distribution */}
        <Animated.View style={[
          styles.distributionCard,
          { opacity: animatedValue }
        ]}>
          <Text style={styles.sectionTitle}>Activity Distribution</Text>
          <View style={styles.distributionContainer}>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: PALETTE.purple }]}>
                <Text style={styles.distributionEmoji}>🧮</Text>
              </View>
              <View style={styles.distributionDetails}>
                <Text style={styles.distributionLabel}>Math Games</Text>
                <Text style={styles.distributionValue}>
                  {stats.mathGames} played ({((stats.mathGames / (stats.totalGames || 1)) * 100).toFixed(0)}%)
                </Text>
              </View>
            </View>

            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: PALETTE.blue }]}>
                <Text style={styles.distributionEmoji}>🧠</Text>
              </View>
              <View style={styles.distributionDetails}>
                <Text style={styles.distributionLabel}>Memory Games</Text>
                <Text style={styles.distributionValue}>
                  {stats.memoryGames} played ({((stats.memoryGames / (stats.totalGames || 1)) * 100).toFixed(0)}%)
                </Text>
              </View>
            </View>

            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: PALETTE.orange }]}>
                <Text style={styles.distributionEmoji}>🎯</Text>
              </View>
              <View style={styles.distributionDetails}>
                <Text style={styles.distributionLabel}>Attention Games</Text>
                <Text style={styles.distributionValue}>
                  {stats.attentionGames} played ({((stats.attentionGames / (stats.totalGames || 1)) * 100).toFixed(0)}%)
                </Text>
              </View>
            </View>

            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: PALETTE.green }]}>
                <Text style={styles.distributionEmoji}>📋</Text>
              </View>
              <View style={styles.distributionDetails}>
                <Text style={styles.distributionLabel}>Assessments</Text>
                <Text style={styles.distributionValue}>
                  {stats.mathAssessments} completed (Avg: {stats.averageAssessmentScore}%)
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Achievements */}
        <Animated.View style={[
          styles.achievementsCard,
          { opacity: animatedValue }
        ]}>
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
                  <Text style={styles.achievementType}>
                    {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)} Achievement
                  </Text>
                  {achievement.progress && achievement.maxProgress && (
                    <View style={styles.achievementProgress}>
                      <View style={styles.achievementProgressBar}>
                        <View
                          style={[
                            styles.achievementProgressFill,
                            {
                              width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                              backgroundColor: achievement.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.achievementProgressText}>
                        {achievement.progress}/{achievement.maxProgress}
                      </Text>
                    </View>
                  )}
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
        </Animated.View>

        {/* Enhanced Motivational Footer */}
        <Animated.View style={[
          styles.motivationalCard,
          { opacity: animatedValue }
        ]}>
          <Text style={styles.motivationalEmoji}>💪</Text>
          <Text style={styles.motivationalText}>
            {stats.currentStreak > 0
              ? `Amazing! Keep your ${stats.currentStreak} day streak going!`
              : stats.totalGames > 0 
                ? 'Ready for your next brain training session?'
                : 'Start your cognitive fitness journey today!'}
          </Text>
          {stats.lastPlayedDate && (
            <Text style={styles.lastPlayedText}>
              Last active: {stats.lastPlayedDate.toLocaleDateString()}
            </Text>
          )}
          {stats.cognitiveImprovement > 0 && (
            <Text style={styles.improvementText}>
              You've improved by {stats.cognitiveImprovement}% overall! 🎉
            </Text>
          )}
        </Animated.View>

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
    paddingBottom: 20,
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 2,
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
  overviewSubValue: {
    fontSize: 12,
    color: PALETTE.neutralMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    color: PALETTE.neutralMuted,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: PALETTE.neutralDark,
    fontWeight: '700',
  },
  chartSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  chartButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chartButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chartIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  chartButtonText: {
    fontSize: 12,
    color: PALETTE.neutralMuted,
    fontWeight: '500',
  },
  chartButtonTextActive: {
    color: PALETTE.neutralDark,
    fontWeight: '700',
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.neutralDark,
    flex: 1,
  },
  enhancedBarChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    marginBottom: 16,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barValues: {
    minHeight: 32,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  barValueText: {
    fontSize: 10,
    fontWeight: '600',
    color: PALETTE.neutralDark,
    lineHeight: 12,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    borderRadius: 6,
    minHeight: 3,
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
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: PALETTE.neutralMuted,
    fontWeight: '500',
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
    gap: 12,
  },
  enhancedCognitiveCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cognitiveHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cognitiveIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cognitiveInfo: {
    flex: 1,
  },
  cognitiveCategory: {
    fontSize: 14,
    color: PALETTE.neutralDark,
    fontWeight: '600',
    marginBottom: 2,
  },
  cognitiveDescription: {
    fontSize: 12,
    color: PALETTE.neutralMuted,
    lineHeight: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cognitiveScore: {
    fontSize: 32,
    fontWeight: '800',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIndicator: {
    fontSize: 18,
    marginRight: 4,
    fontWeight: '700',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  assessmentCard: {
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
  assessmentSubtitle: {
    fontSize: 14,
    color: PALETTE.neutralMuted,
    marginBottom: 20,
  },
  assessmentBreakdownContainer: {
    gap: 16,
  },
  assessmentBreakdownItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  assessmentBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assessmentLevelIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  assessmentLevelText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.neutralDark,
  },
  assessmentPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.neutralDark,
  },
  assessmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  assessmentCount: {
    fontSize: 14,
    color: PALETTE.neutralMuted,
  },
  assessmentAverage: {
    fontSize: 14,
    color: PALETTE.neutralMuted,
    fontWeight: '500',
  },
  assessmentProgressBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  assessmentProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  viewAssessmentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.lightTeal,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  viewAssessmentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 8,
  },
  viewAssessmentsArrow: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
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
    paddingVertical: 16,
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
    lineHeight: 20,
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
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
    marginTop: 4,
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
    marginBottom: 4,
  },
  achievementType: {
    fontSize: 12,
    color: PALETTE.neutralMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementProgress: {
    marginTop: 12,
  },
  achievementProgressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 12,
    color: PALETTE.neutralMuted,
    textAlign: 'right',
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
    marginBottom: 8,
  },
  lastPlayedText: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  improvementText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
});

export default ProgressScreen;