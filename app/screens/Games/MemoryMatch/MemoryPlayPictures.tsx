// app/screens/Games/MemoryMatch/MemoryPlayPictures.tsx - COMPLETE
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { HapticFeedbackService } from "../../../services/HapticFeedbackService";
import { generateDailySeed, SeededRandom } from "../../../utils/SeededRandom";
import { auth } from '@/config/firebaseConfig';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";

type MemoryPlayPicturesNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MemoryPlayLevel4"
>;

const INITIAL_TIME = 300;
const TOTAL_ROUNDS = 8;
const STUDY_TIME = 5000;

const PICTURE_THEMES = {
  kitchen: {
    name: "Kitchen Items",
    items: [
      { emoji: "🍳", name: "Pan" },
      { emoji: "🔪", name: "Knife" },
      { emoji: "🥄", name: "Spoon" },
      { emoji: "🍽️", name: "Plate" },
      { emoji: "☕", name: "Cup" },
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
      { emoji: "💡", name: "Light" }
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
  const randomGen = useRef<SeededRandom | null>(null);

  useEffect(() => {
    const userId = auth.currentUser?.uid || 'guest';
    const seed = generateDailySeed(userId);
    randomGen.current = new SeededRandom(seed);
    console.log(`Pictures game initialized with seed for user: ${userId}`);
  }, []);

  const generateRound = (round: number) => {
    const themes = Object.keys(PICTURE_THEMES);
    const themeKey = themes[round % themes.length] as keyof typeof PICTURE_THEMES;
    const theme = PICTURE_THEMES[themeKey];
    const rng = randomGen.current!;
    
    const itemCount = Math.min(3 + Math.floor(round / 2), 6);
    
    const shuffledItems = rng.shuffle([...theme.items]);
    const itemsToStudy = shuffledItems.slice(0, itemCount).map((item, index) => ({
      ...item,
      id: `study-${index}`
    }));
    
    const remainingItems = shuffledItems.slice(itemCount);
    const distractorCount = Math.min(4, remainingItems.length);
    const distractors = remainingItems.slice(0, distractorCount).map((item, index) => ({
      ...item,
      id: `distractor-${index}`
    }));
    
    const allChoices = rng.shuffle([...itemsToStudy, ...distractors]);
    
    return {
      theme: themeKey,
      studyItems: itemsToStudy,
      allChoices
    };
  };

  useEffect(() => {
    if (currentRound < TOTAL_ROUNDS && randomGen.current) {
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
        HapticFeedbackService.levelUp();
      }
    }
  }, [currentRound]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          const newTime = t - 1;
          HapticFeedbackService.timeBasedWarning(newTime, INITIAL_TIME);
          return newTime;
        });
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
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (gameState === 'studying' && studyTimeLeft > 0 && isRunning) {
      if (studyIntervalRef.current) clearInterval(studyIntervalRef.current);
      studyIntervalRef.current = setInterval(() => {
        setStudyTimeLeft((t) => {
          if (t <= 1) {
            setGameState('recall');
            HapticFeedbackService.buttonPress();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    if ((gameState !== 'studying' || !isRunning) && studyIntervalRef.current) {
      clearInterval(studyIntervalRef.current);
      studyIntervalRef.current = null;
    }

    return () => {
      if (studyIntervalRef.current) {
        clearInterval(studyIntervalRef.current);
        studyIntervalRef.current = null;
      }
    };
  }, [gameState, studyTimeLeft, isRunning]);

  useEffect(() => {
    if (timeLeft <= 0) {
      HapticFeedbackService.gameEnd();
      endGame("time");
    }
  }, [timeLeft]);

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
      HapticFeedbackService.cancel();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleItemSelect = (itemId: string) => {
    if (gameState !== 'recall' || !isRunning) return;

    HapticFeedbackService.selection();

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

    HapticFeedbackService.buttonPress();

    const studyItemIds = studyItems.map(item => item.id);
    const correctSelections = selectedItems.filter(id => studyItemIds.includes(id));
    const incorrectSelections = selectedItems.filter(id => !studyItemIds.includes(id));

    const correctCount = correctSelections.length;
    const totalStudyItems = studyItems.length;
    const accuracy = totalStudyItems > 0 ? correctCount / totalStudyItems : 0;
    
    const basePoints = correctCount * 10;
    const accuracyBonus = accuracy >= 1 ? basePoints : Math.floor(accuracy * basePoints * 0.5);
    const roundScore = basePoints + accuracyBonus;
    
    setScore(s => s + roundScore);
    setFeedback({ correct: correctSelections, incorrect: incorrectSelections });
    setGameState('feedback');
    
    if (accuracy === 1) {
      HapticFeedbackService.correctAnswer();
    } else if (accuracy >= 0.8) {
      HapticFeedbackService.correctAnswer();
    } else if (accuracy >= 0.5) {
      HapticFeedbackService.selection();
    } else {
      HapticFeedbackService.wrongAnswer();
    }

    setTimeout(() => {
      if (currentRound + 1 >= TOTAL_ROUNDS) {
        HapticFeedbackService.gameEnd();
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
    score,                      // Raw score (variable points based on accuracy)
    totalQuestions: TOTAL_ROUNDS,  // 8 rounds total
    timeTaken,
    endedBy: reason,
    gameType: 'pictures',
    level: 4,
    difficulty: 'expert'
  } as any);
};

  const handleStart = () => {
    HapticFeedbackService.gameStart();
    setIsRunning(true);
    setGameState('studying');
    setStudyTimeLeft(STUDY_TIME / 1000);
  };

  const handlePause = () => {
    HapticFeedbackService.buttonPress();
    setIsRunning(false);
  };

  const handleResume = () => {
    HapticFeedbackService.buttonPress();
    setIsRunning(true);
  };

  const handleBack = () => {
    HapticFeedbackService.buttonPress();
    if (isRunning) {
      Alert.alert(
        'Exit Game?',
        'Your progress will be lost. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => HapticFeedbackService.buttonPress() },
          { text: 'Exit', style: 'destructive', onPress: () => {
            HapticFeedbackService.buttonPress();
            handlePause();
            navigation.goBack();
          }}
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const progressPercent = Math.min(100, ((currentRound) / TOTAL_ROUNDS) * 100);
  const currentThemeData = PICTURE_THEMES[currentTheme as keyof typeof PICTURE_THEMES];

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center justify-between px-5 pt-12 pb-5"
        style={{ backgroundColor: PALETTE.lightPink }}
      >
        <TouchableOpacity
          onPress={handleBack}
          className="items-center justify-center rounded-2xl"
          style={{ backgroundColor: PALETTE.lightTeal, width: 56, height: 56 }}
          activeOpacity={0.7}
        >
          <Text className="text-3xl">←</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-4">
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-600">Time</Text>
            <Text className="text-xl font-bold" style={{ 
              color: timeLeft < 60 ? PALETTE.red : PALETTE.teal 
            }}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-600">Score</Text>
            <Text className="text-xl font-bold" style={{ color: PALETTE.teal }}>{score}</Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-semibold text-gray-600">Round</Text>
            <Text className="text-xl font-bold" style={{ color: PALETTE.orange }}>
              {currentRound + 1}/{TOTAL_ROUNDS}
            </Text>
          </View>
        </View>

        <View style={{ width: 56, height: 56 }}>
          {gameState === 'start' ? (
            <View style={{ width: 56, height: 56 }} />
          ) : isRunning ? (
            <TouchableOpacity 
              onPress={handlePause}
              className="items-center justify-center rounded-2xl"
              style={{ backgroundColor: PALETTE.orange, width: 56, height: 56 }}
              activeOpacity={0.7}
            >
              <Text className="text-3xl">⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleResume}
              className="items-center justify-center rounded-2xl"
              style={{ backgroundColor: PALETTE.teal, width: 56, height: 56 }}
              activeOpacity={0.7}
            >
              <Text className="text-3xl">▶️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {gameState === 'start' && (
          <View
            className="p-8 mt-8 mb-8 border-2 shadow-sm rounded-3xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-4 text-4xl font-bold text-center" style={{ color: PALETTE.teal }}>
              📸 Picture Memory
            </Text>
            <Text className="mb-8 text-xl text-center text-gray-700" style={{ lineHeight: 30 }}>
              Study pictures, then identify which ones you saw. Great for visual memory!
            </Text>
            <TouchableOpacity
              className="px-10 py-5 rounded-2xl"
              style={{ backgroundColor: PALETTE.teal }}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text className="text-2xl font-bold text-white text-center">Start Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'studying' && (
          <View
            className="p-8 mt-8 mb-8 border-2 shadow-sm rounded-3xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-3 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
              👀 Study These Items
            </Text>
            <Text className="mb-3 text-xl text-center text-gray-600">
              Theme: {currentThemeData?.name}
            </Text>
            <Text className="mb-8 text-3xl font-bold text-center" style={{ color: PALETTE.orange }}>
              ⏱️ {studyTimeLeft}s
            </Text>
            
            <View className="flex-row flex-wrap justify-center gap-4 mb-6">
              {studyItems.map((item) => (
                <View
                  key={item.id}
                  className="items-center p-5 rounded-3xl"
                  style={{ backgroundColor: PALETTE.lightTeal, width: 130 }}
                >
                  <Text className="mb-3 text-5xl">{item.emoji}</Text>
                  <Text 
                    className="text-base font-bold text-center"
                    style={{ color: PALETTE.teal }}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
            
            <Text className="text-xl text-center font-semibold text-gray-700">
              Remember these {studyItems.length} items!
            </Text>
          </View>
        )}

        {gameState === 'recall' && (
          <View
            className="p-8 mt-8 mb-8 border-2 shadow-sm rounded-3xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-3 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>
              🎯 Select What You Saw
            </Text>
            <Text className="mb-8 text-xl text-center text-gray-600">
              Tap the items you remember
            </Text>
            <Text className="mb-6 text-2xl font-bold text-center" style={{ color: PALETTE.orange }}>
              {selectedItems.length} selected
            </Text>
            
            <View className="flex-row flex-wrap justify-center gap-4 mb-8">
              {allChoices.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    className="items-center p-5 rounded-3xl"
                    style={{
                      backgroundColor: isSelected ? PALETTE.teal : '#F9FAFB',
                      borderWidth: 3,
                      borderColor: isSelected ? PALETTE.teal : '#E5E7EB',
                      width: 125,
                      height: 125,
                    }}
                    onPress={() => handleItemSelect(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text className="mb-2 text-4xl">{item.emoji}</Text>
                    <Text 
                      className="text-sm font-bold text-center"
                      style={{ color: isSelected ? 'white' : PALETTE.teal }}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <View className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 items-center justify-center border-2"
                        style={{ borderColor: PALETTE.teal }}
                      >
                        <Text className="text-lg font-bold" style={{ color: PALETTE.teal }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              className="px-8 py-6 rounded-2xl"
              style={{ 
                backgroundColor: selectedItems.length > 0 ? PALETTE.teal : '#CCCCCC',
              }}
              onPress={submitAnswer}
              disabled={selectedItems.length === 0}
              activeOpacity={0.8}
            >
              <Text className="text-2xl font-bold text-white text-center">
                Submit Answer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'feedback' && (
          <View
            className="p-8 mt-8 mb-8 border-2 shadow-sm rounded-3xl"
            style={{ backgroundColor: "white", borderColor: PALETTE.lightTeal }}
          >
            <Text className="mb-5 text-3xl font-bold text-center" style={{ 
              color: feedback.correct.length === studyItems.length && feedback.incorrect.length === 0 
                ? PALETTE.teal : PALETTE.orange 
            }}>
              {feedback.correct.length === studyItems.length && feedback.incorrect.length === 0 
                ? "🎉 Perfect!" 
                : feedback.correct.length >= studyItems.length * 0.7 
                ? "👍 Good Job!" 
                : "💪 Keep Practicing!"}
            </Text>
            
            <Text className="mb-6 text-2xl text-center font-bold" style={{ color: PALETTE.teal }}>
              {feedback.correct.length} out of {studyItems.length} correct
            </Text>

            <Text className="mb-4 text-xl font-bold" style={{ color: PALETTE.teal }}>
              Items to remember:
            </Text>
            <View className="flex-row flex-wrap justify-center gap-3 mb-6">
              {studyItems.map((item) => {
                const wasSelected = selectedItems.includes(item.id);
                return (
                  <View
                    key={item.id}
                    className="items-center p-4 rounded-2xl"
                    style={{
                      backgroundColor: wasSelected ? '#D1FAE5' : '#FEE2E2',
                      borderWidth: 2,
                      borderColor: wasSelected ? '#059669' : '#DC2626',
                      width: 100,
                    }}
                  >
                    <Text className="mb-2 text-3xl">{item.emoji}</Text>
                    <Text className="text-xs text-center font-bold text-gray-700">
                      {item.name}
                    </Text>
                    <Text className="text-lg font-bold text-center mt-1">
                      {wasSelected ? '✓' : '✗'}
                    </Text>
                  </View>
                );
              })}
            </View>

            {feedback.incorrect.length > 0 && (
              <>
                <Text className="mb-4 text-xl font-bold" style={{ color: PALETTE.red }}>
                  Wrong selections:
                </Text>
                <View className="flex-row flex-wrap justify-center gap-3">
                  {feedback.incorrect.map((itemId) => {
                    const item = allChoices.find(choice => choice.id === itemId);
                    if (!item) return null;
                    return (
                      <View
                        key={itemId}
                        className="items-center p-4 rounded-2xl"
                        style={{
                          backgroundColor: '#FEE2E2',
                          borderWidth: 2,
                          borderColor: '#DC2626',
                          width: 100,
                        }}
                      >
                        <Text className="mb-2 text-3xl">{item.emoji}</Text>
                        <Text className="text-xs text-center font-bold text-gray-700">
                          {item.name}
                        </Text>
                        <Text className="text-lg font-bold text-center mt-1">✗</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        )}

        <View className="items-center mb-10">
          <Text className="mb-3 text-2xl font-bold text-gray-700">
            Round {Math.min(currentRound + 1, TOTAL_ROUNDS)} of {TOTAL_ROUNDS}
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
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
});