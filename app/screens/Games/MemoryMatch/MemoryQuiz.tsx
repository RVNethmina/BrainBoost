// app/src/screens/Games/MemoryMatch/MemoryQuiz.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '@/app/contexts/SettingsContext'; // Add this import

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
  // Add settings hook
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';
  
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : PALETTE.teal;
  const textColor = isDark ? '#fff' : PALETTE.darkGray;
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const headerBg = isDark ? '#2a2a2a' : PALETTE.teal;
  const secondaryTextColor = isDark ? '#ccc' : PALETTE.gray;

  const memoryGames = [
    {
      id: 1,
      name: 'Pattern Memory',
      description: 'Watch & repeat color patterns',
      difficulty: 'Easy',
      color: isDark ? '#2a4a4a' : '#E6F1F1', // Theme-aware colors
      borderColor: PALETTE.teal,
      textColor: isDark ? '#fff' : '#2C3E3E',
      selectedBackground: PALETTE.teal,
      selectedBorder: PALETTE.teal,
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
      color: isDark ? '#2a4a4a' : '#E6F1F1',
      borderColor: PALETTE.teal,
      textColor: isDark ? '#fff' : '#2C3E3E',
      selectedBackground: PALETTE.teal,
      selectedBorder: PALETTE.teal,
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
      color: isDark ? '#4a3a2a' : '#FFE6CC',
      borderColor: PALETTE.orange,
      textColor: isDark ? '#fff' : '#2C3E3E',
      selectedBackground: PALETTE.orange,
      selectedBorder: PALETTE.orange,
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
      color: isDark ? '#4a2a2a' : '#FFE6E6',
      borderColor: PALETTE.red,
      textColor: isDark ? '#fff' : '#2C3E3E',
      selectedBackground: PALETTE.red,
      selectedBorder: PALETTE.red,
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
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { 
            backgroundColor: isDark ? '#3a3a3a' : '#E6F1F1' 
          }]}
        >
          <Text style={[styles.backIcon, { color: textColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Memory Games
        </Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.brainIcon, { 
            backgroundColor: isDark ? '#3a3a3a' : '#2C3E3E' 
          }]}>
            <Text style={styles.brainEmoji}>🧠</Text>
          </View>
          <Text style={[styles.mainTitle, { color: textColor }]}>
            Memory Training
          </Text>
          <Text style={[styles.mainSubtitle, { color: textColor }]}>
            Fun & engaging brain exercises
          </Text>
        </View>

        {/* Games Container */}
        <View style={[styles.gamesContainer, { 
          backgroundColor: cardBg,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
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
                              { 
                                color: isSelected ? game.selectedTextColor : game.textColor,
                                fontSize: 16 * fontScale
                              }
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
                                { 
                                  color: isSelected ? game.selectedTextColor : game.textColor,
                                  fontSize: 10 * fontScale
                                }
                              ]}
                            >
                              {game.difficulty}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.gameDescription,
                            { 
                              color: isSelected ? game.selectedTextColor : game.textColor,
                              fontSize: 14 * fontScale
                            }
                          ]}
                        >
                          {game.description}
                        </Text>
                        <Text
                          style={[
                            styles.gameDetails,
                            { 
                              color: isSelected ? 'rgba(255,255,255,0.8)' : (isDark ? '#aaa' : 'rgba(0,0,0,0.6)'),
                              fontSize: 12 * fontScale
                            }
                          ]}
                        >
                          {game.details}
                        </Text>
                      </View>
                    </View>
                    
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={[styles.checkMark, { fontSize: 14 * fontScale }]}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Game Preview */}
          {selectedGame && (
            <View style={[styles.previewContainer, { 
              backgroundColor: isDark ? '#3a3a3a' : 'rgba(0,0,0,0.05)' 
            }]}>
              <Text style={[styles.previewTitle, { 
                color: textColor,
                fontSize: 14 * fontScale
              }]}>
                About {selectedGame.name}:
              </Text>
              <View style={styles.previewContent}>
                <Text style={[styles.bulletPoint, { 
                  color: secondaryTextColor,
                  fontSize: 12 * fontScale
                }]}>•</Text>
                <Text style={[styles.previewText, { 
                  color: secondaryTextColor,
                  fontSize: 13 * fontScale
                }]}>
                  {selectedGame.description2}
                </Text>
              </View>
            </View>
          )}

          {/* Tips Section */}
          <View style={[styles.tipsContainer, { 
            backgroundColor: isDark ? '#2a3a4a' : '#F0F9FF' 
          }]}>
            <Text style={[styles.tipsTitle, { 
              color: textColor,
              fontSize: 14 * fontScale
            }]}>
              💡 Memory Training Tips:
            </Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={[styles.bulletPoint, { 
                  color: secondaryTextColor,
                  fontSize: 12 * fontScale
                }]}>•</Text>
                <Text style={[styles.tipText, { 
                  color: secondaryTextColor,
                  fontSize: 12 * fontScale
                }]}>
                  Start with easier games and work your way up
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={[styles.bulletPoint, { 
                  color: secondaryTextColor,
                  fontSize: 12 * fontScale
                }]}>•</Text>
                <Text style={[styles.tipText, { 
                  color: secondaryTextColor,
                  fontSize: 12 * fontScale
                }]}>
                  Take breaks between rounds to stay focused
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={[styles.bulletPoint, { 
                  color: secondaryTextColor,
                  fontSize: 12 * fontScale
                }]}>•</Text>
                <Text style={[styles.tipText, { 
                  color: secondaryTextColor,
                  fontSize: 12 * fontScale
                }]}>
                  Play regularly for best results - even 10 minutes helps!
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={[styles.bulletPoint, { 
                  color: secondaryTextColor,
                  fontSize: 12 * fontScale
                }]}>•</Text>
                <Text style={[styles.tipText, { 
                  color: secondaryTextColor,
                  fontSize: 12 * fontScale
                }]}>
                  Don't worry about perfect scores - improvement is the goal
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            { 
              backgroundColor: selectedId ? PALETTE.teal : '#CCCCCC',
              shadowColor: '#000',
              shadowOpacity: isDark ? 0.4 : 0.2,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }
          ]}
          onPress={onStart}
          disabled={!selectedId}
        >
          <Text style={[styles.startButtonIcon, { fontSize: 20 * fontScale }]}>🧠</Text>
          <Text style={[styles.startButtonText, { fontSize: 18 * fontScale }]}>
            Start Training
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MemoryQuiz;

const styles = StyleSheet.create({
  container: { 
    flex: 1
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  backIcon: { 
    fontSize: 20
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700"
  },
  scroll: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  heroSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  brainIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
  },
  brainEmoji: {
    fontSize: 50,
  },
  mainTitle: {
    marginBottom: 8,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  mainSubtitle: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  gamesContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  gamesList: {
    gap: 12,
  },
  gameCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
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
    marginRight: 12,
    fontSize: 24,
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
    fontWeight: "600",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  difficultyText: {
    fontWeight: "600",
  },
  gameDescription: {
    marginBottom: 4,
  },
  gameDetails: {
  },
  selectedIndicator: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  checkMark: {
    color: 'white',
  },
  previewContainer: {
    padding: 16,
    marginTop: 20,
    borderRadius: 16,
  },
  previewTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  previewText: {
    flex: 1,
  },
  tipsContainer: {
    padding: 16,
    marginTop: 20,
    borderRadius: 16,
  },
  tipsTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipText: {
    flex: 1,
  },
  bulletPoint: {
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 30,
    borderRadius: 16,
  },
  startButtonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    fontWeight: "600",
    color: 'white',
  },
});