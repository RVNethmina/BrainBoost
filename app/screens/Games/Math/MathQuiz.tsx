// app/src/screens/MathQuiz.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '@/app/contexts/SettingsContext';

type MathQuizScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MathQuiz'
>;

type MathPlayRoute = 'MathPlayAddition' | 'MathPlayMultiplication' | 'MathPlayMixed';

const MathQuiz: React.FC = () => {
  const navigation = useNavigation<MathQuizScreenNavigationProp>();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#FFFFFF';
  const textColor = isDark ? '#fff' : '#1F2937';
  const secondaryTextColor = isDark ? '#ccc' : '#6B7280';
  const cardBg = isDark ? '#2a2a2a' : '#FFFFFF';
  const headerBg = isDark ? '#2a2a2a' : PALETTE.lightPink;
  const featuresBg = isDark ? '#3a3a3a' : '#F9FAFB';
  const borderColor = isDark ? '#444' : '#F3F4F6';

  const difficulties = [
    {
      id: 1,
      name: 'Easy',
      description: 'Addition & Subtraction',
      difficulty: 'Easy',
      color: isDark ? '#2a4a4a' : '#E8F4F8',
      borderColor: PALETTE.lightTeal,
      textColor: PALETTE.teal,
      selectedBackground: isDark ? '#3a5a5a' : PALETTE.lightTeal,
      selectedBorder: PALETTE.lightTeal,
      selectedTextColor: PALETTE.teal,
      route: 'MathPlayAddition' as MathPlayRoute,
      icon: '➕',
      details: '10 questions • 2 minutes',
      description2: 'Perfect for beginners - simple addition and subtraction problems to warm up your brain.'
    },
    {
      id: 2,
      name: 'Medium',
      description: 'Multiplication Tables',
      difficulty: 'Medium',
      color: isDark ? '#4a3a2a' : '#FFF4E6',
      borderColor: isDark ? '#5a4a3a' : '#FFE7C8',
      textColor: PALETTE.orange,
      selectedBackground: isDark ? '#5a4a3a' : '#FFE7C8',
      selectedBorder: PALETTE.orange,
      selectedTextColor: PALETTE.orange,
      route: 'MathPlayMultiplication' as MathPlayRoute,
      icon: '✖️',
      details: '10 questions • 2 minutes',
      description2: 'Test your multiplication skills with times tables from 1 to 12.'
    },
    {
      id: 3,
      name: 'Hard',
      description: 'Mixed Operations',
      difficulty: 'Hard',
      color: isDark ? '#4a2a2a' : '#FFF0F0',
      borderColor: isDark ? '#5a3a3a' : '#FFE0E0',
      textColor: PALETTE.red,
      selectedBackground: isDark ? '#5a3a3a' : '#FFE0E0',
      selectedBorder: PALETTE.red,
      selectedTextColor: PALETTE.red,
      route: 'MathPlayMixed' as MathPlayRoute,
      icon: '🔀',
      details: '10 questions • 2 minutes',
      description2: 'Challenge yourself with a mix of addition, subtraction, and multiplication.'
    },
  ];

  const onStart = () => {
    if (selectedId == null) {
      Alert.alert(
        'Choose Difficulty Level', 
        'Please select a difficulty level before starting the quiz.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    const selected = difficulties.find((d) => d.id === selectedId);
    if (!selected) {
      navigation.navigate('MathPlayAddition');
      return;
    }

    switch(selected.route) {
      case 'MathPlayAddition':
        navigation.navigate('MathPlayAddition');
        break;
      case 'MathPlayMultiplication':
        navigation.navigate('MathPlayMultiplication');
        break;
      case 'MathPlayMixed':
        navigation.navigate('MathPlayMixed');
        break;
      default:
        navigation.navigate('MathPlayAddition');
    }
  };

  const selectedGame = difficulties.find(d => d.id === selectedId);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: isDark ? '#3a3a3a' : '#FFFFFF' }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { color: PALETTE.orange }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: PALETTE.orange }]}>Math Practice</Text>
        <View style={{ width: 56 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? '#3a3a3a' : PALETTE.lightPink }]}>
            <Text style={styles.heroIcon}>🧮</Text>
          </View>
          <Text style={[styles.mainTitle, { color: PALETTE.orange }]}>
            Math Training
          </Text>
          <Text style={[styles.mainSubtitle, { color: textColor }]}>
            Keep your mind sharp with fun math challenges
          </Text>
        </View>

        {/* Games Container */}
        <View style={[styles.gamesContainer, { 
          backgroundColor: cardBg, 
          borderColor: borderColor 
        }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Choose Your Level
          </Text>

          <View style={styles.gamesList}>
            {difficulties.map((difficulty) => {
              const isSelected = difficulty.id === selectedId;
              return (
                <TouchableOpacity
                  key={difficulty.id}
                  style={[
                    styles.gameCard,
                    {
                      backgroundColor: isSelected ? difficulty.selectedBackground : difficulty.color,
                      borderColor: isSelected ? difficulty.selectedBorder : difficulty.borderColor,
                      borderWidth: isSelected ? 3 : 2,
                    }
                  ]}
                  onPress={() => setSelectedId(difficulty.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.gameCardContent}>
                    <View style={styles.gameCardHeader}>
                      <Text style={styles.gameIcon}>{difficulty.icon}</Text>
                      <View style={styles.gameInfo}>
                        <Text
                          style={[
                            styles.gameTitle,
                            { 
                              fontSize: 22 * fontScale,
                              color: difficulty.textColor 
                            }
                          ]}
                        >
                          {difficulty.name}
                        </Text>
                        <Text
                          style={[
                            styles.gameDescription,
                            { 
                              fontSize: 16 * fontScale,
                              color: difficulty.textColor,
                              opacity: 0.8 
                            }
                          ]}
                        >
                          {difficulty.description}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.gameDetails,
                        { 
                          fontSize: 15 * fontScale,
                          color: difficulty.textColor,
                          opacity: 0.7
                        }
                      ]}
                    >
                      {difficulty.details}
                    </Text>
                    
                    {isSelected && (
                      <View style={[
                        styles.selectedIndicator,
                        { backgroundColor: difficulty.textColor }
                      ]}>
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
            <View style={[
              styles.previewContainer,
              { 
                backgroundColor: selectedGame.color,
                borderColor: selectedGame.borderColor,
              }
            ]}>
              <Text style={[
                styles.previewTitle,
                { 
                  fontSize: 18 * fontScale,
                  color: selectedGame.textColor 
                }
              ]}>
                💡 About {selectedGame.name} Level
              </Text>
              <Text style={[
                styles.previewText,
                { 
                  fontSize: 16 * fontScale,
                  color: selectedGame.textColor 
                }
              ]}>
                {selectedGame.description2}
              </Text>
            </View>
          )}

          {/* Features Section */}
          <View style={[styles.featuresContainer, { backgroundColor: featuresBg }]}>
            <Text style={[styles.featuresTitle, { 
              fontSize: 18 * fontScale,
              color: textColor 
            }]}>
              ✨ Practice Features
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: isDark ? '#4a4a4a' : '#FFFFFF' }]}>
                  <Text style={styles.featureIcon}>🔊</Text>
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={[styles.featureTitle, { 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }]}>
                    Voice Support
                  </Text>
                  <Text style={[styles.featureText, { 
                    fontSize: 15 * fontScale,
                    color: secondaryTextColor 
                  }]}>
                    Hear questions read aloud & speak your answers
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: isDark ? '#4a4a4a' : '#FFFFFF' }]}>
                  <Text style={styles.featureIcon}>⏱️</Text>
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={[styles.featureTitle, { 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }]}>
                    Flexible Timing
                  </Text>
                  <Text style={[styles.featureText, { 
                    fontSize: 15 * fontScale,
                    color: secondaryTextColor 
                  }]}>
                    Take your time - pause anytime you need
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: isDark ? '#4a4a4a' : '#FFFFFF' }]}>
                  <Text style={styles.featureIcon}>✅</Text>
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={[styles.featureTitle, { 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }]}>
                    Instant Feedback
                  </Text>
                  <Text style={[styles.featureText, { 
                    fontSize: 15 * fontScale,
                    color: secondaryTextColor 
                  }]}>
                    See if your answer is correct right away
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBox, { backgroundColor: isDark ? '#4a4a4a' : '#FFFFFF' }]}>
                  <Text style={styles.featureIcon}>📊</Text>
                </View>
                <View style={styles.featureTextBox}>
                  <Text style={[styles.featureTitle, { 
                    fontSize: 16 * fontScale,
                    color: textColor 
                  }]}>
                    Track Progress
                  </Text>
                  <Text style={[styles.featureText, { 
                    fontSize: 15 * fontScale,
                    color: secondaryTextColor 
                  }]}>
                    View your score and improvement over time
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            { 
              backgroundColor: selectedId 
                ? difficulties.find(d => d.id === selectedId)?.textColor || PALETTE.lightTeal
                : '#CCCCCC',
              opacity: selectedId ? 1 : 0.5,
            }
          ]}
          onPress={onStart}
          disabled={!selectedId}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonIcon}>🚀</Text>
          <Text style={[styles.startButtonText, { fontSize: 22 * fontScale }]}>
            Start Practice
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default MathQuiz;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: { 
    fontSize: 28,
    fontWeight: '600',
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "700",
  },
  scroll: { 
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 28,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heroIcon: {
    fontSize: 56,
  },
  mainTitle: {
    marginBottom: 12,
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  mainSubtitle: {
    marginBottom: 8,
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  gamesContainer: {
    padding: 24,
    marginBottom: 20,
    borderRadius: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  gamesList: {
    gap: 16,
  },
  gameCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gameCardContent: {
    gap: 12,
  },
  gameCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  gameIcon: {
    fontSize: 36,
  },
  gameInfo: {
    flex: 1,
    gap: 4,
  },
  gameTitle: {
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  gameDescription: {
    fontWeight: "500",
  },
  gameDetails: {
    fontWeight: "500",
    marginTop: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkMark: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  previewContainer: {
    padding: 20,
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  previewTitle: {
    marginBottom: 12,
    fontWeight: "700",
  },
  previewText: {
    lineHeight: 24,
    fontWeight: "500",
  },
  featuresContainer: {
    padding: 20,
    marginTop: 20,
    borderRadius: 16,
  },
  featuresTitle: {
    marginBottom: 16,
    fontWeight: "700",
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  featureIconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextBox: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontWeight: "600",
  },
  featureText: {
    lineHeight: 21,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginTop: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  startButtonIcon: {
    marginRight: 12,
    fontSize: 24,
  },
  startButtonText: {
    fontWeight: "700",
    color: 'white',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 40,
  },
});