// app/src/screens/ProgressScreen.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
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

const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<ProgressScreenNavigationProp>();

  const weekHeights = [60, 80, 100, 75, 120, 40, 90]; // visual heights for Mon..Sun
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PALETTE.lightTeal }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
          accessibilityRole="button"
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Progress</Text>

        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top cards */}
        <View style={styles.topGrid}>
          <View style={[styles.metricCard, { backgroundColor: PALETTE.yellow }]}>
            <Text style={styles.metricEmoji}>🎮</Text>
            <Text style={styles.metricLabel}>Games Played</Text>
            <Text style={[styles.metricValue, { color: PALETTE.purple }]}>
              127
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: PALETTE.yellow }]}>
            <Text style={styles.metricEmoji}>🔥</Text>
            <Text style={styles.metricLabel}>Streak</Text>
            <Text style={[styles.metricValue, { color: PALETTE.orange }]}>
              12 days
            </Text>
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>

          <View style={styles.barRow}>
            {weekLabels.map((day, idx) => {
              const height = weekHeights[idx];
              // color mapping: highlight Fri (index 4) and Wed (index 2)
              const barColor =
                idx === 4 ? PALETTE.purple : idx === 2 ? PALETTE.lightPink : '#D8B4FE';
              return (
                <View key={day} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      { height, backgroundColor: barColor, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
                    ]}
                  />
                  <Text style={styles.barLabel}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>

          <View style={styles.achievementList}>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementEmoji}>🏆</Text>
              <View style={styles.achievementBody}>
                <Text style={styles.achievementTitle}>Memory Master</Text>
                <Text style={styles.achievementNote}>
                  Completed 10 memory games
                </Text>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <Text style={styles.achievementEmoji}>⭐</Text>
              <View style={styles.achievementBody}>
                <Text style={styles.achievementTitle}>Perfect Score</Text>
                <Text style={styles.achievementNote}>
                  Got 100% in math game
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgressScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  headerButtonText: { fontSize: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },

  content: { flex: 1, paddingHorizontal: 20 },

  topGrid: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    // subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  metricEmoji: { fontSize: 30, marginBottom: 8 },
  metricLabel: { fontSize: 16, color: '#111827' },
  metricValue: { fontSize: 20, fontWeight: '800', marginTop: 6 },

  sectionCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingHorizontal: 6,
  },
  barColumn: { alignItems: 'center', width: '12%' }, // 7 columns fits with spacing
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: { marginTop: 8, fontSize: 12, color: PALETTE.neutralMuted },

  achievementList: { marginTop: 8, paddingTop: 4 },
  achievementItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  achievementEmoji: { fontSize: 24, marginRight: 12 },
  achievementBody: { flex: 1 },
  achievementTitle: { fontSize: 15, fontWeight: '700' },
  achievementNote: { color: PALETTE.neutralMuted, marginTop: 4 },
});
