// app/src/screens/AttentionPlayMedium.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AttentionPlayScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AttentionPlayMedium"
>;

const GAME_DURATION = 60; // seconds
const TARGET_DISPLAY_TIME = 1500; // ms - faster than easy
const TARGET_SIZE = 65; // smaller than easy
const SHAPES = ['circle', 'square', 'triangle'] as const;
const COLORS = ['red', 'blue', 'green', 'yellow', 'orange'] as const; // more colors

type Shape = typeof SHAPES[number];
type Color = typeof COLORS[number];

type Target = {
  id: string;
  shape: Shape;
  color: Color;
  x: number;
  y: number;
  isTarget: boolean;
  timestamp: number;
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTargets(gameWidth: number, gameHeight: number): Target[] {
  const targets: Target[] = [];
  const numTargets = randInt(2, 4); // Multiple targets at once
  const hasRealTarget = Math.random() < 0.4; // 40% chance of having the real target
  
  for (let i = 0; i < numTargets; i++) {
    const isThisTheTarget = hasRealTarget && i === 0;
    const shape = SHAPES[randInt(0, SHAPES.length - 1)];
    const color = isThisTheTarget ? 'red' : COLORS[randInt(0, COLORS.length - 1)];
    
    const finalShape = isThisTheTarget ? 'circle' : shape;
    const finalColor = isThisTheTarget ? 'red' : (color === 'red' && shape === 'circle' ? 'blue' : color);

    let x: number;
    let y: number;
    let attempts = 0;
    do {
      x = randInt(TARGET_SIZE / 2, gameWidth - TARGET_SIZE / 2);
      y = randInt(TARGET_SIZE / 2, gameHeight - TARGET_SIZE / 2);
      attempts++;
    } while (
      attempts < 10 &&
      targets.some(t => 
        Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2)) < TARGET_SIZE + 10
      )
    );

    targets.push({
      id: `target_${Date.now()}_${i}`,
      shape: finalShape,
      color: finalColor,
      x,
      y,
      isTarget: isThisTheTarget,
      timestamp: Date.now(),
    });
  }

  return targets;
}

const AttentionPlayMedium: React.FC = () => {
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
      const spawnTargets = () => {
        const newTargets = generateTargets(gameAreaSize.width, gameAreaSize.height);
        const hasTarget = newTargets.some(t => t.isTarget);
        
        setCurrentTargets(newTargets);
        if (hasTarget) {
          setTotalTargetsShown(prev => prev + 1);
        }

        // Remove targets after display time
        setTimeout(() => {
          setCurrentTargets([]);
        }, TARGET_DISPLAY_TIME);
      };

      spawnTargets();
      targetIntervalRef.current = setInterval(spawnTargets, TARGET_DISPLAY_TIME + 300);
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
      setScore(prev => prev + 1);
      setReactionTimes(prev => [...prev, reactionTime]);
      setCurrentTargets([]);
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
      difficulty: 'medium'
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
    } else {
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
      <View className="px-5 py-4" style={{ backgroundColor: '#FFEDCC' }}>
        <Text className="text-lg font-semibold text-center" style={{ color: PALETTE.orange }}>
          MEDIUM: Tap RED CIRCLES only! 🔴
        </Text>
        <Text className="text-sm text-center text-gray-600">
          Multiple targets, faster pace
        </Text>
      </View>

      {/* Game Area */}
      <View 
        className="justify-center flex-1 mx-5 my-4 border-2 border-dashed rounded-2xl"
        style={{ borderColor: PALETTE.orange }}
        ref={gameAreaRef}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setGameAreaSize({ width, height });
        }}
      >
        {currentTargets.map(target => renderShape(target))}
        
        {!isRunning && showStartHint && (
          <View className="items-center justify-center">
            <Text className="text-6xl mb-4">⚡</Text>
            <Text className="text-2xl font-bold mb-2" style={{ color: PALETTE.orange }}>
              Medium Challenge
            </Text>
            <Text className="text-lg text-center text-gray-600 mb-6 px-4">
              Faster pace with multiple targets. Find red circles among distractors!
            </Text>
          </View>
        )}

        {!isRunning && !showStartHint && currentTargets.length === 0 && (
          <View className="items-center justify-center">
            <Text className="text-4xl mb-2">⏸️</Text>
            <Text className="text-xl font-semibold" style={{ color: PALETTE.orange }}>
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
            style={{ backgroundColor: PALETTE.orange }}
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
            style={{ backgroundColor: PALETTE.orange }}
            onPress={handleResume}
          >
            <Text className="text-lg font-semibold text-white">Resume</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AttentionPlayMedium;