// app/src/screens/Games/Attention/AttentionQuiz.tsx
import { PALETTE } from '@/app/design/colors';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '@/app/contexts/SettingsContext';

type AttentionQuizScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AttentionQuiz'
>;

type AttentionPlayRoute =
  | 'AttentionPlayEasy'
  | 'AttentionPlayMedium'
  | 'AttentionPlayHard';

const AttentionQuiz: React.FC = () => {
  const navigation = useNavigation<AttentionQuizScreenNavigationProp>();
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Dynamic colors
  const bgColor = isDark ? '#1a1a1a' : PALETTE.lightPink;
  const textColor = isDark ? '#fff' : PALETTE.teal;
  const cardBg = isDark ? '#2a2a2a' : '#FFFFFF';

  const attentionGames = [
    {
      id: 1,
      name: 'Symbol Search',
      description: 'Find target symbols quickly',
      difficulty: 'Easy',
      color: isDark ? '#2a4a4a' : PALETTE.lightTeal,
      borderColor: PALETTE.teal,
      textColor: PALETTE.teal,
      selectedBackground: PALETTE.teal,
      selectedBorder: PALETTE.teal,
      selectedTextColor: '#FFFFFF',
      route: 'AttentionPlayEasy' as AttentionPlayRoute,
      icon: '🔍',
      details: '10 rounds • Large targets • 3 minutes',
      description2: 'Perfect for beginners - find simple shapes and symbols on screen.'
    },
    {
      id: 2,
      name: 'Color Focus',
      description: 'Spot colors while ignoring distractors',
      difficulty: 'Medium',
      color: isDark ? '#4a3a2a' : '#FFEDCC',
      borderColor: PALETTE.orange,
      textColor: PALETTE.orange,
      selectedBackground: PALETTE.orange,
      selectedBorder: PALETTE.orange,
      selectedTextColor: '#FFFFFF',
      route: 'AttentionPlayMedium' as AttentionPlayRoute,
      icon: '🎨',
      details: '12 rounds • Mixed targets • 4 minutes',
      description2: 'Find specific colored shapes while ignoring similar distractors.'
    },
    {
      id: 3,
      name: 'Speed Challenge',
      description: 'Fast-paced target detection',
      difficulty: 'Hard',
      color: isDark ? '#4a2a2a' : '#FFE0E0',
      borderColor: PALETTE.red,
      textColor: PALETTE.red,
      selectedBackground: PALETTE.red,
      selectedBorder: PALETTE.red,
      selectedTextColor: '#FFFFFF',
      route: 'AttentionPlayHard' as AttentionPlayRoute,
      icon: '⚡',
      details: '15 rounds • Quick responses • 5 minutes',
      description2: 'Advanced challenge with time pressure and complex patterns.'
    },
  ];

  const onStart = () => {
    if (selectedId == null) {
      Alert.alert('Choose Game', 'Please select an attention game before starting.');
      return;
    }

    const selected = attentionGames.find((g) => g.id === selectedId);
    if (!selected) return;

    navigation.navigate(selected.route);
  };

  const selectedGame = attentionGames.find(g => g.id === selectedId);

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pt-12 pb-6"
        style={{ backgroundColor: isDark ? '#2a2a2a' : PALETTE.teal }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="items-center justify-center w-14 h-14 rounded-xl"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <Text style={{ fontSize: 30 * fontScale, color: PALETTE.teal }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 30 * fontScale, fontWeight: 'bold', color: '#fff' }}>
          Attention Games
        </Text>
        <View className="w-14" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="items-center my-8">
          <View
            className="items-center justify-center w-40 h-40 mb-6 rounded-full"
            style={{ backgroundColor: PALETTE.teal }}
          >
            <Text className="text-7xl">👁️</Text>
          </View>
          <Text style={{ fontSize: 32 * fontScale, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
            Attention Training
          </Text>
          <Text style={{ fontSize: 20 * fontScale, textAlign: 'center', color: textColor, marginBottom: 32 }}>
            Sharpen your focus & concentration
          </Text>
        </View>

        <View
          className="p-6 mb-8 rounded-3xl"
          style={{ 
            backgroundColor: cardBg, 
            elevation: 5, 
            shadowColor: '#000', 
            shadowOpacity: 0.1, 
            shadowRadius: 10 
          }}
        >
          <Text style={{ 
            fontSize: 28 * fontScale, 
            fontWeight: 'bold', 
            textAlign: 'center', 
            color: PALETTE.teal,
            marginBottom: 24
          }}>
            Choose Your Challenge
          </Text>

          <View className="space-y-5">
            {attentionGames.map((game) => {
              const isSelected = game.id === selectedId;
              return (
                <TouchableOpacity
                  key={game.id}
                  className="py-5 pl-5 pr-3 rounded-2xl"
                  style={{
                    backgroundColor: isSelected ? game.selectedBackground : game.color,
                    borderWidth: 3,
                    borderColor: isSelected ? game.selectedBorder : game.borderColor,
                    marginBottom: 20
                  }}
                  onPress={() => setSelectedId(game.id)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Text style={{ fontSize: 30 * fontScale, marginRight: 16 }}>{game.icon}</Text>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text
                            style={{ 
                              fontSize: 22 * fontScale, 
                              fontWeight: 'bold',
                              color: isSelected ? game.selectedTextColor : game.textColor 
                            }}
                          >
                            {game.name}
                          </Text>
                          <View
                            className="px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' 
                            }}
                          >
                            <Text
                              style={{ 
                                fontSize: 11 * fontScale, 
                                fontWeight: '600',
                                color: isSelected ? game.selectedTextColor : game.textColor 
                              }}
                            >
                              {game.difficulty}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{ 
                            fontSize: 16 * fontScale, 
                            marginBottom: 4,
                            color: isSelected ? game.selectedTextColor : game.textColor 
                          }}
                        >
                          {game.description}
                        </Text>
                        <Text
                          style={{ 
                            fontSize: 13 * fontScale,
                            color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' 
                          }}
                        >
                          {game.details}
                        </Text>
                      </View>
                    </View>
                    
                    {isSelected && (
                      <View
                        className="items-center justify-center w-8 h-8 rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                      >
                        <Text style={{ fontSize: 18 * fontScale, color: '#fff' }}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Game Preview */}
          {selectedGame && (
            <View 
              className="p-4 mt-6 rounded-2xl"
              style={{ backgroundColor: isDark ? '#3a3a3a' : 'rgba(0,0,0,0.05)' }}
            >
              <Text style={{ 
                fontSize: 17 * fontScale, 
                fontWeight: '600', 
                color: PALETTE.teal,
                marginBottom: 8
              }}>
                About {selectedGame.name}:
              </Text>
              <View className="flex-row items-start gap-2">
                <Text style={{ fontSize: 15 * fontScale, color: isDark ? '#ccc' : '#374151' }}>•</Text>
                <Text style={{ 
                  flex: 1, 
                  fontSize: 15 * fontScale, 
                  color: isDark ? '#ccc' : '#374151' 
                }}>
                  {selectedGame.description2}
                </Text>
              </View>
            </View>
          )}

          {/* Helpful Tips Section */}
          <View 
            className="p-4 mt-6 rounded-2xl"
            style={{ backgroundColor: isDark ? '#2a3a4a' : '#F0F9FF' }}
          >
            <Text style={{ 
              fontSize: 17 * fontScale, 
              fontWeight: '600', 
              color: PALETTE.teal,
              marginBottom: 8
            }}>
              💡 Attention Training Tips:
            </Text>
            <View className="space-y-2">
              {[
                'Focus on accuracy first, speed will come naturally',
                'Take a moment to understand the target before starting',
                'Practice regularly - consistency improves concentration',
                'Don\'t worry about mistakes - learning from them helps focus'
              ].map((tip, index) => (
                <View key={index} className="flex-row items-start gap-2" style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 13 * fontScale, color: isDark ? '#ccc' : '#374151' }}>•</Text>
                  <Text style={{ 
                    flex: 1, 
                    fontSize: 13 * fontScale, 
                    color: isDark ? '#ccc' : '#374151' 
                  }}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-6 mb-10 rounded-3xl"
          style={{ 
            backgroundColor: selectedId ? PALETTE.teal : '#CCCCCC',
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 5
          }}
          onPress={onStart}
          disabled={!selectedId}
        >
          <Text style={{ fontSize: 28 * fontScale, marginRight: 12 }}>👁️</Text>
          <Text style={{ fontSize: 22 * fontScale, fontWeight: '600', color: '#fff' }}>
            Start Training
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AttentionQuiz;