// app/src/screens/AttentionPlayEasy.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AttentionPlayScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AttentionPlayEasy"
>;

const GAME_DURATION = 60; // seconds
const TARGET_DISPLAY_TIME = 2000; // ms
const TARGET_SIZE = 80;
const SHAPES = ['circle', 'square', 'triangle'] as const;
const COLORS = ['red', 'blue', 'green', 'yellow'] as const;

type Shape = typeof SHAPES[number];
type Color = typeof COLORS[number];

type Target = {
  id: string;
  shape: Shape;
  color: Color;
  x: number;
  y: number;
  isTarget: boolean; // true if this is what user should tap
  timestamp: number;
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTarget(gameWidth: number, gameHeight: number, isTarget: boolean): Target {
  const shape = SHAPES[randInt(0, SHAPES.length - 1)];
  const color = isTarget ? 'red' : COLORS[randInt(0, COLORS.length - 1)];
  
  // Ensure target is red circle if isTarget is true
  const finalShape = isTarget ? 'circle' : shape;
  const finalColor = isTarget ? 'red' : (color === 'red' && shape === 'circle' ? 'blue' : color);

  return {
    id: `target_${Date.now()}_${Math.random()}`,
    shape: finalShape,
    color: finalColor,
    x: randInt(TARGET_SIZE / 2, gameWidth - TARGET_SIZE / 2),
    y: randInt(TARGET_SIZE / 2, gameHeight - TARGET_SIZE / 2),
    isTarget,
    timestamp: Date.now(),
  };
}

const AttentionPlayEasy: React.FC = () => {
  const navigation = useNavigation<AttentionPlayScreenNavigationProp>();

  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentTargets, setCurrentTargets] = useState<Target[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [totalTargetsShown, setTotalTargetsShown] = useState<number>(0);
  const [showStartHint, setShowStartHint] = useState<boolean>(true);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameAreaRef = useRef<View>(null);
  const [gameAreaSize, setGameAreaSize] = useState({ width: 300, height: 400 });

  // Timer effect
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

  // Target generation effect
  useEffect(() => {
    if (isRunning) {
      const spawnTarget = () => {
        const shouldBeTarget = Math.random() < 0.3; // 30% chance of being the target
        const newTarget = generateTarget(gameAreaSize.width, gameAreaSize.height, shouldBeTarget);
        
        setCurrentTargets([newTarget]);
        if (shouldBeTarget) {
          setTotalTargetsShown(prev => prev + 1);
        }

        // Remove target after display time
        setTimeout(() => {
          setCurrentTargets([]);
        }, TARGET_DISPLAY_TIME);
      };

      // Initial target
      spawnTarget();
      
      // Regular target spawning
      targetIntervalRef.current = setInterval(spawnTarget, TARGET_DISPLAY_TIME + 500);
    } else {
      if (targetIntervalRef.current) {
        clearInterval(targetIntervalRef.current);
        targetIntervalRef.current = null;
      }
    }

    return () => {
      if (targetIntervalRef.current) {
        clearInterval(targetIntervalRef.current);
        targetIntervalRef.current = null;
      }
    };
  }, [isRunning, gameAreaSize]);

  // Game end effect
  useEffect(() => {
    if (timeLeft <= 0) {
      endGame();
    }
  }, [timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (targetIntervalRef.current) clearInterval(targetIntervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTargetTap = (target: Target) => {
    if (!isRunning) return;

    const reactionTime = Date.now() - target.timestamp;
    
    if (target.isTarget) {
      // Correct tap on red circle
      setScore(prev => prev + 1);
      setReactionTimes(prev => [...prev, reactionTime]);
      setCurrentTargets([]); // Remove target immediately on correct tap
    } else {
      // Wrong tap - penalty could be added here if desired
      console.log('Wrong target tapped');
    }
  };

  const endGame = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (targetIntervalRef.current) {
      clearInterval(targetIntervalRef.current);
      targetIntervalRef.current = null;
    }

    const timeTaken = GAME_DURATION - Math.max(0, timeLeft);
    const averageReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const accuracy = totalTargetsShown > 0 ? (score / totalTargetsShown) * 100 : 0;

    navigation.navigate("AttentionResults", {
      score,
      totalTargets: totalTargetsShown,
      timeTaken,
      averageReactionTime: Math.round(averageReactionTime),
      accuracy: Math.round(accuracy),
      endedBy: timeLeft <= 0 ? 'time' : 'finished',
      difficulty: 'easy'
    } as any);
  };

  const handleStart = () => {
    setShowStartHint(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const renderShape = (target: Target) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: target.x - TARGET_SIZE / 2,
      top: target.y - TARGET_SIZE / 2,
      width: TARGET_SIZE,
      height: TARGET_SIZE,
      backgroundColor: target.color,
    };

    if (target.shape === 'circle') {
      return (
        <TouchableOpacity
          key={target.id}
          style={[baseStyle, { borderRadius: TARGET_SIZE / 2 }]}
          onPress={() => handleTargetTap(target)}
          activeOpacity={0.7}
        />
      );
    } else if (target.shape === 'square') {
      return (
        <TouchableOpacity
          key={target.id}
          style={[baseStyle, { borderRadius: 8 }]}
          onPress={() => handleTargetTap(target)}
          activeOpacity={0.7}
        />
      );
    } else { // triangle
      return (
        <TouchableOpacity
          key={target.id}
          style={[baseStyle, { backgroundColor: 'transparent' }]}
          onPress={() => handleTargetTap(target)}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: TARGET_SIZE / 2,
              borderRightWidth: TARGET_SIZE / 2,
              borderBottomWidth: TARGET_SIZE,
              borderStyle: 'solid',
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: target.color,
            }}
          />
        </TouchableOpacity>
      );
    }
  };

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

        <View className="flex-row items-center gap-4">
          <View className="items-center mr-4">
            <Text className="text-sm text-gray-600">Time</Text>
            <Text className="text-xl font-bold">{formatTime(timeLeft)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-sm text-gray-600">Score</Text>
            <Text className="text-xl font-bold">{score}</Text>
          </View>
        </View>

        <View style={{ width: 44 }}>
          {isRunning ? (
            <TouchableOpacity onPress={handlePause}>
              <Text className="text-2xl">⏸️</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={showStartHint ? handleStart : handleResume}>
              <Text className="text-2xl">▶️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View className="px-5 py-4" style={{ backgroundColor: PALETTE.lightTeal }}>
        <Text className="text-lg font-semibold text-center" style={{ color: PALETTE.teal }}>
          Tap only the RED CIRCLES! 🔴
        </Text>
        <Text className="text-sm text-center text-gray-600">
          Ignore other shapes and colors
        </Text>
      </View>

      {/* Game Area */}
      <View 
        className="justify-center flex-1 mx-5 my-4 border-2 border-dashed rounded-2xl"
        style={{ borderColor: PALETTE.lightTeal }}
        ref={gameAreaRef}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setGameAreaSize({ width, height });
        }}
      >
        {currentTargets.map(target => renderShape(target))}
        
        {!isRunning && showStartHint && (
          <View className="items-center justify-center">
            <Text className="text-6xl mb-4">🎯</Text>
            <Text className="text-2xl font-bold mb-2" style={{ color: PALETTE.teal }}>
              Ready to Focus?
            </Text>
            <Text className="text-lg text-center text-gray-600 mb-6 px-4">
              Tap only red circles when they appear. Ignore other shapes!
            </Text>
          </View>
        )}

        {!isRunning && !showStartHint && currentTargets.length === 0 && (
          <View className="items-center justify-center">
            <Text className="text-4xl mb-2">⏸️</Text>
            <Text className="text-xl font-semibold" style={{ color: PALETTE.teal }}>
              Paused
            </Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center px-5 pb-8">
        {!isRunning && showStartHint ? (
          <TouchableOpacity
            className="px-8 py-4 rounded-2xl"
            style={{ backgroundColor: PALETTE.teal }}
            onPress={handleStart}
          >
            <Text className="text-lg font-semibold text-white">Start Game</Text>
          </TouchableOpacity>
        ) : isRunning ? (
          <TouchableOpacity
            className="px-8 py-4 rounded-2xl"
            style={{ backgroundColor: PALETTE.lightPink }}
            onPress={handlePause}
          >
            <Text className="text-lg font-semibold text-white">Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="px-8 py-4 rounded-2xl"
            style={{ backgroundColor: PALETTE.teal }}
            onPress={handleResume}
          >
            <Text className="text-lg font-semibold text-white">Resume</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AttentionPlayEasy;