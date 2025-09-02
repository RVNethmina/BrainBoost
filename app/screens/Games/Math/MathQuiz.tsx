// app/src/screens/MathQuiz.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MathQuizScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MathQuiz'
>;

// Define a type for the valid math play routes
type MathPlayRoute = 'MathPlayAddition' | 'MathPlayMultiplication' | 'MathPlayMixed';

const MathQuiz: React.FC = () => {
  const navigation = useNavigation<MathQuizScreenNavigationProp>();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const difficulties = [
    {
      id: 1,
      name: 'Easy',
      description: 'Addition & Subtraction',
      difficulty: 'Easy',
      color: '#E6F1F1', // Memory quiz card color
      borderColor: '#96B5B5', // Memory quiz teal
      textColor: '#2C3E3E', // Memory quiz dark text
      selectedBackground: '#96B5B5', // Memory quiz teal
      selectedBorder: '#96B5B5',
      selectedTextColor: '#FFFFFF',
      route: 'MathPlayAddition' as MathPlayRoute,
      icon: '➕',
      details: '10 questions • 2 minutes • Basic operations',
      description2: 'Perfect for beginners - simple addition and subtraction problems.'
    },
    {
      id: 2,
      name: 'Medium',
      description: 'Multiplication & Division',
      difficulty: 'Medium',
      color: '#FFE6CC', // Light orange tint
      borderColor: '#FEC84D', // Memory quiz orange
      textColor: '#2C3E3E',
      selectedBackground: '#FEC84D',
      selectedBorder: '#FEC84D',
      selectedTextColor: '#FFFFFF',
      route: 'MathPlayMultiplication' as MathPlayRoute,
      icon: '✖️',
      details: '10 questions • 2 minutes • Times tables',
      description2: 'Test your multiplication and division skills with progressively harder problems.'
    },
    {
      id: 3,
      name: 'Hard',
      description: 'Mixed Operations',
      difficulty: 'Hard',
      color: '#FFE6E6', // Light red tint
      borderColor: '#D9534F', // Memory quiz red
      textColor: '#2C3E3E',
      selectedBackground: '#D9534F',
      selectedBorder: '#D9534F',
      selectedTextColor: '#FFFFFF',
      route: 'MathPlayMixed' as MathPlayRoute,
      icon: '🔀',
      details: '10 questions • 2 minutes • All operations',
      description2: 'Challenge yourself with a mix of addition, subtraction, multiplication, and division.'
    },
  ];

  const onStart = () => {
    if (selectedId == null) {
      Alert.alert('Choose difficulty', 'Please choose a difficulty before starting the quiz.');
      return;
    }

    const selected = difficulties.find((d) => d.id === selectedId);
    if (!selected) {
      // Default to Easy if something goes wrong
      navigation.navigate('MathPlayAddition');
      return;
    }

    // Use a type-safe navigation approach
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Math Quiz</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.brainIcon}>
            <Text style={styles.brainEmoji}>🧮</Text>
          </View>
          <Text style={styles.mainTitle}>Math Training</Text>
          <Text style={styles.mainSubtitle}>
            Test your math skills with timed challenges
          </Text>
        </View>

        {/* Games Container */}
        <View style={styles.gamesContainer}>
          <Text style={styles.sectionTitle}>
            Choose Your Challenge
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
                    }
                  ]}
                  onPress={() => setSelectedId(difficulty.id)}
                >
                  <View style={styles.gameCardContent}>
                    <View style={styles.gameCardLeft}>
                      <Text style={styles.gameIcon}>{difficulty.icon}</Text>
                      <View style={styles.gameInfo}>
                        <View style={styles.gameTitleRow}>
                          <Text
                            style={[
                              styles.gameTitle,
                              { color: isSelected ? difficulty.selectedTextColor : difficulty.textColor }
                            ]}
                          >
                            {difficulty.name}
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
                                { color: isSelected ? difficulty.selectedTextColor : difficulty.textColor }
                              ]}
                            >
                              {difficulty.difficulty}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.gameDescription,
                            { color: isSelected ? difficulty.selectedTextColor : difficulty.textColor }
                          ]}
                        >
                          {difficulty.description}
                        </Text>
                        <Text
                          style={[
                            styles.gameDetails,
                            { 
                              color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' 
                            }
                          ]}
                        >
                          {difficulty.details}
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
              💡 Math Quiz Tips:
            </Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.tipText}>Start with easier levels and work your way up</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.tipText}>You have 2 minutes to answer 10 questions</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.tipText}>Practice regularly to improve your speed and accuracy</Text>
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
              backgroundColor: selectedId ? '#96B5B5' : '#CCCCCC' // Memory quiz teal when active
            }
          ]}
          onPress={onStart}
          disabled={!selectedId}
        >
          <Text style={styles.startButtonIcon}>🧮</Text>
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MathQuiz;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#96B5B5" // Memory quiz background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#96B5B5", // Match background
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    backgroundColor: "#E6F1F1", // Memory quiz card color
    borderRadius: 12,
  },
  backIcon: { 
    fontSize: 20,
    color: "#2C3E3E" // Memory quiz text color
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#2C3E3E" // Memory quiz text color
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
    backgroundColor: "#2C3E3E", // Dark teal from memory quiz
  },
  brainEmoji: {
    fontSize: 50,
  },
  mainTitle: {
    marginBottom: 8,
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E3E", // Memory quiz text color
    textAlign: "center",
  },
  mainSubtitle: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#2C3E3E", // Memory quiz text color
    opacity: 0.8,
  },
  gamesContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#2C3E3E", // Memory quiz text color
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
    fontSize: 16,
    fontWeight: "600", // Match memory quiz weight
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "600",
  },
  gameDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  gameDetails: {
    fontSize: 12,
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
    fontSize: 14,
    color: 'white',
  },
  previewContainer: {
    padding: 16,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  previewTitle: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E3E", // Memory quiz text color
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  tipsContainer: {
    padding: 16,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
  },
  tipsTitle: {
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E3E", // Memory quiz text color
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
    fontSize: 12,
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
    paddingVertical: 16,
    marginBottom: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  startButtonIcon: {
    marginRight: 8,
    fontSize: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: 'white',
  },
});