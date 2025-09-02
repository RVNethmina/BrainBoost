// app/src/screens/Games/MemoryMatch/MemoryQuiz.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MemoryQuizScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MemoryQuiz'
>;

type MemoryPlayRoute =
  | 'MemoryPlayLevel1'
  | 'MemoryPlayLevel2'
  | 'MemoryPlayLevel3'
  | 'MemoryPlayLevel4';

const MemoryQuiz: React.FC = () => {
  const navigation = useNavigation<MemoryQuizScreenNavigationProp>();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const memoryGames = [
    {
      id: 1,
      name: 'Pattern Memory',
      description: 'Watch & repeat color patterns',
      difficulty: 'Easy',
      color: '#E6F1F1', // Home page card color
      borderColor: '#96B5B5', // Home page teal
      textColor: '#2C3E3E', // Home page dark text
      selectedBackground: '#96B5B5', // Home page teal
      selectedBorder: '#96B5B5',
      selectedTextColor: '#FFFFFF',
      route: 'MemoryPlayLevel1' as MemoryPlayRoute,
      icon: '🎨',
      details: 'Progressive patterns • 8 rounds • 3 minutes',
      description2: 'Perfect for beginners - watch colorful patterns and repeat them back.'
    },
    {
      id: 2,
      name: 'Memory Cards',
      description: 'Find matching card pairs',
      difficulty: 'Easy',
      color: '#E6F1F1',
      borderColor: '#96B5B5',
      textColor: '#2C3E3E',
      selectedBackground: '#96B5B5',
      selectedBorder: '#96B5B5',
      selectedTextColor: '#FFFFFF',
      route: 'MemoryPlayLevel2' as MemoryPlayRoute,
      icon: '🃏',
      details: '3 rounds • Growing difficulty • 4 minutes',
      description2: 'Classic matching game with friendly themes like fruits and animals.'
    },
    {
      id: 3,
      name: 'Number Memory',
      description: 'Remember number sequences',
      difficulty: 'Medium',
      color: '#FFE6CC', // Light orange tint
      borderColor: '#FEC84D', // Home page orange
      textColor: '#2C3E3E',
      selectedBackground: '#FEC84D',
      selectedBorder: '#FEC84D',
      selectedTextColor: '#FFFFFF',
      route: 'MemoryPlayLevel3' as MemoryPlayRoute,
      icon: '🔢',
      details: '10 rounds • Growing sequences • 4 minutes',
      description2: 'Study numbers then type them back - great for concentration training.'
    },
    {
      id: 4,
      name: 'Picture Memory',
      description: 'Remember everyday objects',
      difficulty: 'Hard',
      color: '#FFE6E6', // Light red tint
      borderColor: '#D9534F', // Home page red
      textColor: '#2C3E3E',
      selectedBackground: '#D9534F',
      selectedBorder: '#D9534F',
      selectedTextColor: '#FFFFFF',
      route: 'MemoryPlayLevel4' as MemoryPlayRoute,
      icon: '🖼️',
      details: '8 rounds • Familiar themes • 5 minutes',
      description2: 'Study pictures of familiar items, then identify what you saw.'
    },
  ];

  const onStart = () => {
    if (selectedId == null) {
      Alert.alert('Choose Game', 'Please select a memory game before starting.');
      return;
    }

    const selected = memoryGames.find((g) => g.id === selectedId);
    if (!selected) return;

    navigation.navigate(selected.route);
  };

  const selectedGame = memoryGames.find(g => g.id === selectedId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Memory Games</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.brainIcon}>
            <Text style={styles.brainEmoji}>🧠</Text>
          </View>
          <Text style={styles.mainTitle}>Memory Training</Text>
          <Text style={styles.mainSubtitle}>
            Fun & engaging brain exercises
          </Text>
        </View>

        {/* Games Container */}
        <View style={styles.gamesContainer}>
          <Text style={styles.sectionTitle}>
            Choose Your Challenge
          </Text>

          <View style={styles.gamesList}>
            {memoryGames.map((game) => {
              const isSelected = game.id === selectedId;
              return (
                <TouchableOpacity
                  key={game.id}
                  style={[
                    styles.gameCard,
                    {
                      backgroundColor: isSelected ? game.selectedBackground : game.color,
                      borderColor: isSelected ? game.selectedBorder : game.borderColor,
                    }
                  ]}
                  onPress={() => setSelectedId(game.id)}
                >
                  <View style={styles.gameCardContent}>
                    <View style={styles.gameCardLeft}>
                      <Text style={styles.gameIcon}>{game.icon}</Text>
                      <View style={styles.gameInfo}>
                        <View style={styles.gameTitleRow}>
                          <Text
                            style={[
                              styles.gameTitle,
                              { color: isSelected ? game.selectedTextColor : game.textColor }
                            ]}
                          >
                            {game.name}
                          </Text>
                          <View
                            style={[
                              styles.difficultyBadge,
                              { 
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' 
                              }
                            ]}
                          >
                            <Text
                              style={[
                                styles.difficultyText,
                                { color: isSelected ? game.selectedTextColor : game.textColor }
                              ]}
                            >
                              {game.difficulty}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.gameDescription,
                            { color: isSelected ? game.selectedTextColor : game.textColor }
                          ]}
                        >
                          {game.description}
                        </Text>
                        <Text
                          style={[
                            styles.gameDetails,
                            { 
                              color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' 
                            }
                          ]}
                        >
                          {game.details}
                        </Text>
                      </View>
                    </View>
                    
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Game Preview */}
          {selectedGame && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>
                About {selectedGame.name}:
              </Text>
              <View style={styles.previewContent}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.previewText}>
                  {selectedGame.description2}
                </Text>
              </View>
            </View>
          )}

          {/* Tips Section */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>
              💡 Memory Training Tips:
            </Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.tipText}>Start with easier games and work your way up</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.tipText}>Take breaks between rounds to stay focused</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.tipText}>Play regularly for best results - even 10 minutes helps!</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.tipText}>Don't worry about perfect scores - improvement is the goal</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            { 
              backgroundColor: selectedId ? '#96B5B5' : '#CCCCCC' // Home page teal when active
            }
          ]}
          onPress={onStart}
          disabled={!selectedId}
        >
          <Text style={styles.startButtonIcon}>🧠</Text>
          <Text style={styles.startButtonText}>Start Training</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MemoryQuiz;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#96B5B5" // Home page background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60, // Increased for mobile spacing
    paddingBottom: 20,
    backgroundColor: "#96B5B5", // Match background
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    backgroundColor: "#E6F1F1", // Home page card color
    borderRadius: 12,
  },
  backIcon: { 
    fontSize: 20,
    color: "#2C3E3E" // Home page text color
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#2C3E3E" // Home page text color
  },
  scroll: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  heroSection: {
    alignItems: "center",
    marginVertical: 30, // Reduced from large margins
  },
  brainIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 120, // Reduced from 160
    height: 120, // Reduced from 160
    marginBottom: 20, // Reduced from 24
    borderRadius: 60,
    backgroundColor: "#2C3E3E", // Dark teal from home page
  },
  brainEmoji: {
    fontSize: 50, // Reduced from 70
  },
  mainTitle: {
    marginBottom: 8, // Reduced from 16
    fontSize: 28, // Reduced from 32
    fontWeight: "700",
    color: "#2C3E3E", // Home page text color
    textAlign: "center",
  },
  mainSubtitle: {
    marginBottom: 20, // Reduced from 32
    fontSize: 16, // Reduced from 18
    textAlign: "center",
    color: "#2C3E3E", // Home page text color
    opacity: 0.8,
  },
  gamesContainer: {
    padding: 20, // Reduced from 24
    marginBottom: 20, // Reduced from 32
    borderRadius: 20, // Reduced from 24
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 20, // Reduced from 24
    fontSize: 20, // Reduced from 24
    fontWeight: "700",
    textAlign: "center",
    color: "#2C3E3E", // Home page text color
  },
  gamesList: {
    gap: 12, // Reduced from 20
  },
  gameCard: {
    paddingVertical: 16, // Reduced from 20
    paddingHorizontal: 16,
    borderRadius: 16, // Reduced from 20
    borderWidth: 2,
  },
  gameCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gameCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  gameIcon: {
    marginRight: 12, // Reduced from 16
    fontSize: 24, // Reduced from 30
  },
  gameInfo: {
    flex: 1,
  },
  gameTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  gameTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: "600", // Changed from 700 to match home page
  },
  difficultyBadge: {
    paddingHorizontal: 8, // Reduced from 10
    paddingVertical: 3, // Reduced from 4
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10, // Reduced from 12
    fontWeight: "600",
  },
  gameDescription: {
    fontSize: 14, // Reduced from 16
    marginBottom: 4,
  },
  gameDetails: {
    fontSize: 12, // Reduced from 14
  },
  selectedIndicator: {
    alignItems: "center",
    justifyContent: "center",
    width: 24, // Reduced from 32
    height: 24, // Reduced from 32
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  checkMark: {
    fontSize: 14, // Reduced from 18
    color: 'white',
  },
  previewContainer: {
    padding: 16, // Reduced from 20
    marginTop: 20, // Reduced from 24
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  previewTitle: {
    marginBottom: 8,
    fontSize: 14, // Reduced from 16
    fontWeight: "600",
    color: "#2C3E3E", // Home page text color
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  previewText: {
    flex: 1,
    fontSize: 13, // Reduced from 14
    color: '#666',
  },
  tipsContainer: {
    padding: 16, // Reduced from 20
    marginTop: 20, // Reduced from 24
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
  },
  tipsTitle: {
    marginBottom: 12, // Reduced from 16
    fontSize: 14, // Reduced from 16
    fontWeight: "600",
    color: "#2C3E3E", // Home page text color
  },
  tipsList: {
    gap: 8, // Reduced from 12
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12, // Reduced from 13
    color: '#666',
  },
  bulletPoint: {
    fontSize: 12,
    color: '#666',
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16, // Reduced from 24
    marginBottom: 30, // Reduced from 40
    borderRadius: 16, // Reduced from 24
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  startButtonIcon: {
    marginRight: 8, // Reduced from 12
    fontSize: 20, // Reduced from 24
  },
  startButtonText: {
    fontSize: 18, // Reduced from 20
    fontWeight: "600",
    color: 'white',
  },
});