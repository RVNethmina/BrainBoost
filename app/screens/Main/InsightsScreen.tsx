// app/src/screens/InsightsScreen.tsx
import { PALETTE } from "@/app/design/colors";
import { auth, firestore } from '@/config/firebaseConfig';
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query
} from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CognitiveMetric {
  label: string;
  emoji: string;
  score: number;
  color: string;
  trend: 'improving' | 'declining' | 'stable';
  gamesPlayed: number;
  note: string;
}

interface PersonalizedInsight {
  type: 'strength' | 'needsWork' | 'recommendation';
  emoji: string;
  title: string;
  message: string;
  color: string;
}

const InsightsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<CognitiveMetric[]>([]);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [brainAge, setBrainAge] = useState<number>(65);
  const [actualAge, setActualAge] = useState<number>(70);

  useEffect(() => {
    fetchUserInsights();
  }, []);

  const fetchUserInsights = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch all game results including puzzle
      const [mathResults, memoryResults, attentionResults, puzzleResults] = await Promise.all([
        getDocs(query(collection(firestore, 'users', user.uid, 'mathResults'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(firestore, 'users', user.uid, 'memoryResults'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(firestore, 'users', user.uid, 'attentionResults'), orderBy('createdAt', 'desc'), limit(100))),
        getDocs(query(collection(firestore, 'users', user.uid, 'puzzleResults'), orderBy('createdAt', 'desc'), limit(100))),
      ]);

      // Calculate metrics for each category
      const mathMetric = calculateMetric(mathResults, 'Math Skills', '🧮', PALETTE.orange);
      const memoryMetric = calculateMetric(memoryResults, 'Memory Score', '🧠', PALETTE.purple);
      const attentionMetric = calculateMetric(attentionResults, 'Attention', '⚡', PALETTE.blue);
      const puzzleMetric = calculateMetric(puzzleResults, 'Puzzle Solving', '🧩', PALETTE.green);

      // Calculate derived metrics
      const avgScore = (mathMetric.score + memoryMetric.score + attentionMetric.score + puzzleMetric.score) / 4;
      const languageScore = Math.round(avgScore * 0.95 + Math.random() * 10); // Simulated
      const visualScore = Math.round(avgScore * 0.85 + Math.random() * 15); // Simulated
      const speedScore = Math.round(avgScore * 0.90 + Math.random() * 12); // Simulated

      const allMetrics = [
        memoryMetric,
        attentionMetric,
        mathMetric,
        puzzleMetric,
        {
          label: 'Language',
          emoji: '🔤',
          score: languageScore,
          color: PALETTE.purple,
          trend: 'stable' as const,
          gamesPlayed: mathResults.size + memoryResults.size,
          note: languageScore > 85 ? 'Strong vocabulary skills' : 'Practice word games to improve',
        },
        {
          label: 'Visual Processing',
          emoji: '🎨',
          score: visualScore,
          color: PALETTE.indigo,
          trend: visualScore > attentionMetric.score ? 'improving' as const : 'stable' as const,
          gamesPlayed: attentionResults.size + puzzleResults.size,
          note: visualScore > 75 ? 'Good pattern recognition' : 'Try pattern games to improve',
        },
        {
          label: 'Processing Speed',
          emoji: '⏱️',
          score: speedScore,
          color: PALETTE.teal,
          trend: 'stable' as const,
          gamesPlayed: mathResults.size + attentionResults.size + puzzleResults.size,
          note: speedScore > 80 ? 'Good reaction time' : 'Speed exercises recommended',
        },
      ];

      setMetrics(allMetrics);

      // Generate personalized insights
      const personalizedInsights = generateInsights(allMetrics);
      setInsights(personalizedInsights);

      // Calculate brain age (lower is better)
      const calculatedBrainAge = calculateBrainAge(avgScore);
      setBrainAge(calculatedBrainAge);
      setActualAge(calculatedBrainAge + 5); // Simulated actual age

    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetric = (
    results: any,
    label: string,
    emoji: string,
    color: string
  ): CognitiveMetric => {
    if (results.size === 0) {
      return {
        label,
        emoji,
        score: 0,
        color,
        trend: 'stable',
        gamesPlayed: 0,
        note: 'Start playing to see your score',
      };
    }

    // Calculate average score
    let totalScore = 0;
    results.forEach((doc: any) => {
      const data = doc.data();
      const score = data.percentage || data.score || 0;
      // Cap individual scores at 100
      totalScore += Math.min(score, 100);
    });
    const avgScore = Math.min(100, Math.round(totalScore / results.size));

    // Calculate trend (compare recent vs older games)
    const docs = results.docs;
    const recentCount = Math.min(5, docs.length);
    const recentScore = docs.slice(0, recentCount).reduce((acc: number, doc: any) => {
      const score = doc.data().percentage || doc.data().score || 0;
      return acc + Math.min(score, 100); // Cap at 100
    }, 0) / recentCount;

    const olderCount = Math.min(5, Math.max(0, docs.length - 5));
    const olderScore = olderCount > 0
      ? docs.slice(-olderCount).reduce((acc: number, doc: any) => {
          const score = doc.data().percentage || doc.data().score || 0;
          return acc + Math.min(score, 100); // Cap at 100
        }, 0) / olderCount
      : recentScore;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (olderScore > 0) {
      const change = ((recentScore - olderScore) / olderScore) * 100;
      if (change > 8) trend = 'improving';
      else if (change < -8) trend = 'declining';
    }

    // Generate note based on score and trend
    let note = '';
    if (avgScore >= 90) {
      note = trend === 'improving' ? 'Excellent! Keep it up!' : 'Outstanding performance!';
    } else if (avgScore >= 75) {
      note = trend === 'improving' ? `Improved by ${Math.round(recentScore - olderScore)}% recently` : 'Good progress, keep practicing';
    } else if (avgScore >= 60) {
      note = trend === 'declining' ? 'Focus needed - practice more' : 'Room for improvement';
    } else {
      note = 'More practice recommended';
    }

    return {
      label,
      emoji,
      score: avgScore,
      color,
      trend,
      gamesPlayed: results.size,
      note,
    };
  };

  const calculateBrainAge = (avgScore: number): number => {
    // Simple formula: higher scores = younger brain age
    // Average score of 100 = 20 years younger
    // Average score of 50 = actual age
    // Average score of 0 = 20 years older
    const baseAge = 70; // Assumed base age
    const ageDifference = ((avgScore - 50) / 50) * 20;
    return Math.round(Math.max(30, Math.min(90, baseAge - ageDifference)));
  };

  const generateInsights = (metrics: CognitiveMetric[]): PersonalizedInsight[] => {
    const insights: PersonalizedInsight[] = [];

    // Find strengths (top scoring areas)
    const sortedByScore = [...metrics].sort((a, b) => b.score - a.score);
    const topMetric = sortedByScore[0];
    if (topMetric.score >= 80) {
      insights.push({
        type: 'strength',
        emoji: '💪',
        title: 'Your Strength',
        message: `Your ${topMetric.label.toLowerCase()} is excellent at ${topMetric.score}%! This is your strongest cognitive area.`,
        color: PALETTE.green,
      });
    }

    // Find areas needing work (lowest scoring)
    const lowestMetric = sortedByScore[sortedByScore.length - 1];
    if (lowestMetric.score < 70) {
      insights.push({
        type: 'needsWork',
        emoji: '🎯',
        title: 'Focus Area',
        message: `Your ${lowestMetric.label.toLowerCase()} score is ${lowestMetric.score}%. Focus on this area to see improvement.`,
        color: PALETTE.orange,
      });
    }

    // Check for improving trends
    const improvingMetrics = metrics.filter(m => m.trend === 'improving');
    if (improvingMetrics.length > 0) {
      insights.push({
        type: 'strength',
        emoji: '📈',
        title: 'Great Progress',
        message: `Your ${improvingMetrics[0].label.toLowerCase()} is improving steadily. Keep up the excellent work!`,
        color: PALETTE.blue,
      });
    }

    // Check for declining trends
    const decliningMetrics = metrics.filter(m => m.trend === 'declining');
    if (decliningMetrics.length > 0) {
      insights.push({
        type: 'needsWork',
        emoji: '⚠️',
        title: 'Needs Attention',
        message: `Your ${decliningMetrics[0].label.toLowerCase()} scores are declining. Try playing more ${decliningMetrics[0].label.toLowerCase()} games.`,
        color: PALETTE.red,
      });
    }

    // Generate personalized recommendation
    const lowScoreMetrics = metrics.filter(m => m.score < 75);
    if (lowScoreMetrics.length > 0) {
      const areas = lowScoreMetrics.map(m => m.label.toLowerCase()).join(' and ');
      insights.push({
        type: 'recommendation',
        emoji: '💡',
        title: 'Personalized Recommendation',
        message: `Focus on ${areas} games this week. Your other skills are excellent!`,
        color: PALETTE.lightTeal,
      });
    } else {
      insights.push({
        type: 'recommendation',
        emoji: '🌟',
        title: 'Keep It Up',
        message: 'All your cognitive skills are strong! Maintain your routine for best results.',
        color: PALETTE.yellow,
      });
    }

    // Weekly trend insight
    const avgScore = metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;
    insights.push({
      type: 'recommendation',
      emoji: avgScore >= 75 ? '🎉' : '💪',
      title: 'Overall Performance',
      message: avgScore >= 75
        ? `Overall cognitive performance at ${Math.round(avgScore)}%. Excellent brain health!`
        : `Overall performance at ${Math.round(avgScore)}%. Keep training to improve!`,
      color: PALETTE.lightPink,
    });

    return insights;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.flex}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PALETTE.purple} />
          <Text style={styles.loadingText}>Analyzing your brain health...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PALETTE.lightPink }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Insights</Text>

        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Brain Age Card */}
        <View style={[styles.centerCard, { backgroundColor: PALETTE.yellow }]}>
          <Text style={styles.emoji}>🧠</Text>
          <Text style={styles.cardTitle}>Brain Age</Text>
          <Text style={[styles.bigStat, { color: PALETTE.purple }]}>
            {brainAge} years
          </Text>
          <Text style={styles.cardNote}>
            {brainAge < actualAge
              ? `${actualAge - brainAge} years younger than actual!`
              : 'Keep training to improve!'}
          </Text>
        </View>

        {/* Personalized Insights */}
        {insights.map((insight, index) => (
          <View
            key={index}
            style={[styles.infoCard, { backgroundColor: insight.color }]}
          >
            <Text style={styles.infoEmoji}>{insight.emoji}</Text>
            <View style={styles.infoBody}>
              <Text style={styles.infoTitle}>{insight.title}</Text>
              <Text style={styles.infoText}>{insight.message}</Text>
            </View>
          </View>
        ))}

        {/* Detailed Metrics */}
        {metrics.map((metric) => renderMetric(metric))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default InsightsScreen;

/* ---------- helpers ---------- */

function renderMetric(metric: CognitiveMetric) {
  const trendIcon = metric.trend === 'improving' ? '↗️' : metric.trend === 'declining' ? '↘️' : '➡️';
  const trendColor = metric.trend === 'improving' ? PALETTE.green : metric.trend === 'declining' ? PALETTE.red : PALETTE.neutralMuted;

  return (
    <View style={styles.metricCard} key={metric.label}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricEmoji}>{metric.emoji}</Text>
        <Text style={styles.metricTitle}>{metric.label}</Text>
        <View style={styles.metricValueContainer}>
          <Text style={[styles.metricValue, { color: metric.color }]}>
            {metric.score}%
          </Text>
          <Text style={[styles.trendIcon, { color: trendColor }]}>
            {trendIcon}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(metric.score, 100)}%`, backgroundColor: metric.color },
            ]}
          />
        </View>
      </View>

      <View style={styles.metricFooter}>
        <Text style={styles.metricNote}>{metric.note}</Text>
        <Text style={styles.gamesPlayed}>
          {metric.gamesPlayed} game{metric.gamesPlayed !== 1 ? 's' : ''} played
        </Text>
      </View>
    </View>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FFF" },
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
  },
  headerButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  headerButtonText: { fontSize: 20 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  content: { flex: 1, paddingHorizontal: 20 },

  centerCard: {
    alignItems: "center",
    padding: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emoji: { fontSize: 36, marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6, color: "#111827" },
  bigStat: { fontSize: 28, fontWeight: "800" },
  cardNote: { marginTop: 6, color: PALETTE.neutralMuted },

  metricCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricEmoji: { fontSize: 22, marginRight: 8 },
  metricTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#111827" },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: { fontSize: 18, fontWeight: "700" },
  trendIcon: { fontSize: 16 },

  progressContainer: { marginBottom: 8 },
  progressTrack: {
    width: "100%",
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },

  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricNote: { color: PALETTE.neutralMuted, fontSize: 13, flex: 1 },
  gamesPlayed: { color: PALETTE.neutralMuted, fontSize: 12, fontStyle: 'italic' },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  infoEmoji: { fontSize: 22, marginRight: 10 },
  infoBody: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  infoText: { color: PALETTE.neutralMuted, marginTop: 4, lineHeight: 20 },
});