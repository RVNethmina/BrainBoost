// app/src/screens/Games/MemoryMatch/MemoryPlayPictures.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Vibration, ScrollView } from "react-native";

type MemoryPlayPicturesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel4"
>;

const INITIAL_TIME = 300; // 5 minutes
const TOTAL_ROUNDS = 8;
const STUDY_TIME = 5000; // 5 seconds to study

// Themed picture sets with familiar items
const PICTURE_THEMES = {
  kitchen: {
    name: "Kitchen Items",
    items: [
      { emoji: "🍳", name: "Frying Pan" },
      { emoji: "🔪", name: "Knife" },
      { emoji: "🥄", name: "Spoon" },
      { emoji: "🍽️", name: "Plate" },
      { emoji: "☕", name: "Coffee Cup" },
      { emoji: "🥛", name: "Glass" },
      { emoji: "🍴", name: "Fork" },
      { emoji: "🫖", name: "Teapot" }
    ]
  },
  nature: {
    name: "Nature",
    items: [
      { emoji: "🌸", name: "Flower" },
      { emoji: "🌳", name: "Tree" },
      { emoji: "☀️", name: "Sun" },
      { emoji: "🌙", name: "Moon" },
      { emoji: "⭐", name: "Star" },
      { emoji: "🦋", name: "Butterfly" },
      { emoji: "🌺", name: "Hibiscus" },
      { emoji: "🍃", name: "Leaf" }
    ]
  },
  home: {
    name: "Around the House",
    items: [
      { emoji: "🛏️", name: "Bed" },
      { emoji: "🪑", name: "Chair" },
      { emoji: "📺", name: "TV" },
      { emoji: "📚", name: "Books" },
      { emoji: "🕰️", name: "Clock" },
      { emoji: "🖼️", name: "Picture" },
      { emoji: "🚪", name: "Door" },
      { emoji: "💡", name: "Light Bulb" }
    ]
  }
};

type PictureItem = {
  emoji: string;
  name: string;
  id: string;
};

const MemoryPlayPictures: React.FC = () => {
  const navigation = useNavigation<MemoryPlayPicturesNavigationProp>();
  
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [gameState, setGameState] = useState<'start' | 'studying' | 'recall' | 'feedback'>('start');
  const [currentTheme, setCurrentTheme] = useState<string>('kitchen');
  const [studyItems, setStudyItems] = useState<PictureItem[]>([]);
  const [allChoices, setAllChoices] = useState<PictureItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [studyTimeLeft, setStudyTimeLeft] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ correct: string[], incorrect: string[] }>({ correct: [], incorrect: [] });
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const studyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate round content
  const generateRound = (round: number) => {
    const themes = Object.keys(PICTURE_THEMES);
    const themeKey = themes[round % themes.length] as keyof typeof PICTURE_THEMES;
    const theme = PICTURE_THEMES[themeKey];
    
    // Progressive difficulty: start with 3 items, increase by 1 every 2 rounds
    const itemCount = Math.min(3 + Math.floor(round / 2), 6);
    
    // Randomly select items to study
    const shuffledItems = [...theme.items].sort(() => Math.random() - 0.5);
    const itemsToStudy = shuffledItems.slice(0, itemCount).map((item, index) => ({
      ...item,
      id: `study-${index}`
    }));
    
    // Create all choices (study items + some distractors)
    const remainingItems = shuffledItems.slice(itemCount);
    const distractorCount = Math.min(4, remainingItems.length);
    const distractors = remainingItems.slice(0, distractorCount).map((item, index) => ({
      ...item,
      id: `distractor-${index}`
    }));
    
    const allChoices = [...itemsToStudy, ...distractors].sort(() => Math.random() - 0.5);
    
    return {
      theme: themeKey,
      studyItems: itemsToStudy,
      allChoices
    };
  };

  // Initialize round
  useEffect(() => {
    if (currentRound < TOTAL_ROUNDS) {
      const roundData = generateRound(currentRound);
      setCurrentTheme(roundData.theme);
      setStudyItems(roundData.studyItems);
      setAllChoices(roundData.allChoices);
      setSelectedItems([]);
      setFeedback({ correct: [], incorrect: [] });
      
      if (currentRound === 0) {
        setGameState('start');
      } else {
        setGameState('studying');
        setStudyTimeLeft(STUDY_TIME / 1000);
      }
    }
  }, [currentRound]);

  // Main timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }

    if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Study timer effect
  useEffect(() => {
    if (gameState === 'studying' && studyTimeLeft > 0) {
      if (studyIntervalRef.current) clearInterval(studyIntervalRef.current);
      studyIntervalRef.current = setInterval(() => {
        setStudyTimeLeft((t) => {
          if (t <= 1) {
            setGameState('recall');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    if (gameState !== 'studying' && studyIntervalRef.current) {
      clearInterval(studyIntervalRef.current);
      studyIntervalRef.current = null;
    }

    return () => {
      if (studyIntervalRef.current) {
        clearInterval(studyIntervalRef.current);
        studyIntervalRef.current = null;
      }
    };
  }, [gameState, studyTimeLeft]);

  // Time up effect
  useEffect(() => {
    if (timeLeft <= 0) {
      endGame("time");
    }
  }, [timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (studyIntervalRef.current) {
        clearInterval(studyIntervalRef.current);
        studyIntervalRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleItemSelect = (itemId: string) => {
    if (gameState !== 'recall' || !isRunning) return;

    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const submitAnswer = () => {
    if (gameState !== 'recall' || !isRunning) return;

    const studyItemIds = studyItems.map(item => item.id);
    const correctSelections = selectedItems.filter(id => studyItemIds.includes(id));
    const incorrectSelections = selectedItems.filter(id => !studyItemIds.includes(id));
    const missedItems = studyItemIds.filter(id => !selectedItems.includes(id));

    // Calculate score
    const correctCount = correctSelections.length;
    const totalStudyItems = studyItems.length;
    const accuracy = totalStudyItems > 0 ? correctCount / totalStudyItems : 0;
    
    // Award points: base points + accuracy bonus
    const basePoints = correctCount * 10;
    const accuracyBonus = accuracy >= 1 ? basePoints : Math.floor(accuracy * basePoints * 0.5);
    const roundScore = basePoints + accuracyBonus;
    
    setScore(s => s + roundScore);
    setFeedback({ correct: correctSelections, incorrect: incorrectSelections });
    setGameState('feedback');
    
    if (accuracy >= 0.8) {
      Vibration.vibrate([100, 50, 100]);
    } else {
      Vibration.vibrate([50, 100, 50]);
    }

    // Continue to next round
    setTimeout(() => {
      if (currentRound + 1 >= TOTAL_ROUNDS) {
        endGame("finished");
      } else {
        setCurrentRound(r => r + 1);
      }
    }, 3000);
  };

  const endGame = (reason: "time" | "finished") => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (studyIntervalRef.current) {
      clearInterval(studyIntervalRef.current);
      studyIntervalRef.current = null;
    }
    
    const timeTaken = INITIAL_TIME - Math.max(0, timeLeft);
    navigation.navigate("MemoryResults" as any, {
      score,
      totalQuestions: TOTAL_ROUNDS,
      timeTaken,
      endedBy: reason,
      gameType: 'pictures',
      level: 4,
      difficulty: 'expert'
    } as any);
  };

  const handleStart = () => {
    setIsRunning(true);
    setGameState('studying');
    setStudyTimeLeft(STUDY_TIME / 1000);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const progressPercent = Math.min(100, ((currentRound) / TOTAL_ROUNDS) * 100);
  const currentThemeData = PICTURE_THEMES[currentTheme as keyof typeof PICTURE_THEMES];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pt-10 pb-4"
        style={{ backgroundColor: PALETTE.lightPink }}
      >
        <TouchableOpacity
          onPress={() => {
            handlePause();
            navigation.goBack();
          }}
          className="items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: PALETTE.lightTeal }}
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-3">
          <View className="items-center">
            <Text className="text-sm text-gray-600">Time</Text>
            <Text className="text-lg font-bold">{formatTime(timeLeft)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-600">Score</Text>
            <Text className="text-lg font-bold">{score}</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-600">Round</Text>
            <Text className="text-lg font-bold">{currentRound + 1}/{TOTAL_ROUNDS}</Text>
          </View>
        </View>

        <View style={{ width: 44 }}>
          {gameState === 'start' ? (
            <TouchableOpacity onPress={handleStart}>
              <Text className="text-2xl">▶️</Text>
            </TouchableOpacity>
          ) : isRunning ? (
            <TouchableOpacity onPress={handlePause}>
              <Text className="text-2xl">⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleResume}>
              <Text className="text-2xl">▶️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Game Area */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {gameState === 'start' && (
          <View
            className="p-6 mt-8 mb-8 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
              Picture Memory
            </Text>
            <Text className="mb-6 text-lg text-center text-gray-600">
              Study a group of pictures, then identify which ones you saw from a larger selection. Great for visual memory training!
            </Text>
            <TouchableOpacity
              className="px-8 py-4 rounded-2xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={handleStart}
            >
              <Text className="text-xl font-semibold text-white text-center">Start Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'studying' && (
          <View
            className="p-6 mt-8 mb-8 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-2 text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>
              Study These Items
            </Text>
            <Text className="mb-2 text-lg text-center text-gray-600">
              Theme: {currentThemeData?.name}
            </Text>
            <Text className="mb-6 text-xl font-bold text-center" style={{ color: PALETTE.orange }}>
              Time: {studyTimeLeft}s
            </Text>
            
            {/* Study items grid */}
            <View className="flex-row flex-wrap justify-center gap-4 mb-4">
              {studyItems.map((item) => (
                <View
                  key={item.id}
                  className="items-center p-4 rounded-2xl"
                  style={{ backgroundColor: PALETTE.lightTeal, width: 120 }}
                >
                  <Text className="mb-2 text-4xl">{item.emoji}</Text>
                  <Text 
                    className="text-sm font-semibold text-center"
                    style={{ color: PALETTE.teal }}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
            
            <Text className="text-center text-gray-600">
              Remember these {studyItems.length} items!
            </Text>
          </View>
        )}

        {gameState === 'recall' && (
          <View
            className="p-6 mt-8 mb-8 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-2 text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>
              Select What You Saw
            </Text>
            <Text className="mb-6 text-lg text-center text-gray-600">
              Tap the items you remember studying ({selectedItems.length} selected)
            </Text>
            
            {/* All choices grid */}
            <View className="flex-row flex-wrap justify-center gap-3 mb-6">
              {allChoices.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    className="items-center p-4 rounded-2xl"
                    style={{
                      backgroundColor: isSelected ? PALETTE.teal : '#F9FAFB',
                      borderWidth: 2,
                      borderColor: isSelected ? PALETTE.teal : '#E5E7EB',
                      width: 110,
                    }}
                    onPress={() => handleItemSelect(item.id)}
                  >
                    <Text className="mb-2 text-3xl">{item.emoji}</Text>
                    <Text 
                      className="text-xs font-semibold text-center"
                      style={{ color: isSelected ? 'white' : PALETTE.teal }}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <View className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-sm" style={{ color: PALETTE.teal }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              className="px-6 py-4 rounded-2xl"
              style={{ 
                backgroundColor: selectedItems.length > 0 ? PALETTE.teal : '#CCCCCC',
                width: '100%'
              }}
              onPress={submitAnswer}
              disabled={selectedItems.length === 0}
            >
              <Text className="text-xl font-semibold text-white text-center">
                Submit Answer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'feedback' && (
          <View
            className="p-6 mt-8 mb-8 border shadow-sm rounded-2xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-2xl font-bold text-center" style={{ 
              color: feedback.correct.length === studyItems.length && feedback.incorrect.length === 0 
                ? PALETTE.teal : PALETTE.orange 
            }}>
              {feedback.correct.length === studyItems.length && feedback.incorrect.length === 0 
                ? "Perfect!" 
                : feedback.correct.length >= studyItems.length * 0.7 
                ? "Good Job!" 
                : "Keep Practicing!"}
            </Text>
            
            <Text className="mb-4 text-lg text-center text-gray-600">
              You got {feedback.correct.length} out of {studyItems.length} correct
            </Text>

            {/* Show correct items */}
            <Text className="mb-3 text-lg font-semibold" style={{ color: PALETTE.teal }}>
              Items you were supposed to remember:
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2 mb-4">
              {studyItems.map((item) => {
                const wasSelected = selectedItems.includes(item.id);
                return (
                  <View
                    key={item.id}
                    className="items-center p-3 rounded-xl"
                    style={{
                      backgroundColor: wasSelected ? '#D1FAE5' : '#FEE2E2',
                      borderWidth: 1,
                      borderColor: wasSelected ? '#059669' : '#DC2626',
                      width: 90,
                    }}
                  >
                    <Text className="mb-1 text-2xl">{item.emoji}</Text>
                    <Text className="text-xs text-center font-semibold text-gray-700">
                      {item.name}
                    </Text>
                    <Text className="text-xs text-center">
                      {wasSelected ? '✓' : 'Missed'}
                    </Text>
                  </View>
                );
              })}
            </View>

            {feedback.incorrect.length > 0 && (
              <>
                <Text className="mb-3 text-lg font-semibold" style={{ color: PALETTE.red }}>
                  Items you selected incorrectly:
                </Text>
                <View className="flex-row flex-wrap justify-center gap-2">
                  {feedback.incorrect.map((itemId) => {
                    const item = allChoices.find(choice => choice.id === itemId);
                    if (!item) return null;
                    return (
                      <View
                        key={itemId}
                        className="items-center p-3 rounded-xl"
                        style={{
                          backgroundColor: '#FEE2E2',
                          borderWidth: 1,
                          borderColor: '#DC2626',
                          width: 90,
                        }}
                      >
                        <Text className="mb-1 text-2xl">{item.emoji}</Text>
                        <Text className="text-xs text-center font-semibold text-gray-700">
                          {item.name}
                        </Text>
                        <Text className="text-xs text-center">Wrong</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        )}

        {/* Progress */}
        <View className="items-center mb-8">
          <Text className="mb-2 text-lg text-gray-600">
            Round: {Math.min(currentRound + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: PALETTE.teal },
              ]}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MemoryPlayPictures;

const styles = StyleSheet.create({
  progressTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
  },
});