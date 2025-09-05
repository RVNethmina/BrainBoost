import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import AttentionPlayEasy from '../screens/Games/Attention/AttentionPlayEasy';
import AttentionPlayHard from '../screens/Games/Attention/AttentionPlayHard';
import AttentionPlayMedium from '../screens/Games/Attention/AttentionPlayMedium';
import AttentionQuiz from '../screens/Games/Attention/AttentionQuiz';
import AttentionResultsScreen from '../screens/Games/Attention/AttentionResults';
import MathPlayAddition from '../screens/Games/Math/MathPlayAddition';
import MathPlayMixed from '../screens/Games/Math/MathPlayMixed';
import MathPlayMultiplication from '../screens/Games/Math/MathPlayMultiplication';
import MathQuiz from '../screens/Games/Math/MathQuiz';
import MathResults from '../screens/Games/Math/MathResults';
import MemoryPlayCards from '../screens/Games/MemoryMatch/MemoryPlayCards';
import MemoryPlayNumbers from '../screens/Games/MemoryMatch/MemoryPlayNumbers';
import MemoryPlayPattern from '../screens/Games/MemoryMatch/MemoryPlayPattern';
import MemoryPlayPictures from '../screens/Games/MemoryMatch/MemoryPlayPictures';
import MemoryQuiz from '../screens/Games/MemoryMatch/MemoryQuiz';
import MemoryResultsScreen from '../screens/Games/MemoryMatch/MemoryResultsScreen';
import AssessmentTest from '../screens/Main/AssessmentTest';
import BrainGames from '../screens/Main/BrainGames';
import HomeScreen from '../screens/Main/HomeScreen';
import InsightsScreen from '../screens/Main/InsightsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import ProgressScreen from '../screens/Main/ProgressScreen';
import ReminderScreen from '../screens/Main/RemainderScreen';
import SettingsScreen from '../screens/Main/SettingsScreen';
// Existing Puzzle set
import ArrowPlay from '../screens/Games/Puzzle/ArrowPlay';
import CompPlay from '../screens/Games/Puzzle/CompPlay';
import OddPlay from '../screens/Games/Puzzle/OddPlay';
import PuzzleQuiz from '../screens/Games/Puzzle/PuzzleQuiz';
import SeqPlay from '../screens/Games/Puzzle/SeqPlay';

// NEW: Senior-friendly Puzzle set
import JigsawPlay from '../screens/Games/Puzzle/JigsawPlay';
import OrderTapPlay from '../screens/Games/Puzzle/OrderTapPlay';
import SudokuPlay from '../screens/Games/Puzzle/SudokuPlay';
import TargetNumberPlay from '../screens/Games/Puzzle/TargetNumberPlay';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  Signup: undefined;
  Home: undefined;
  Insights: undefined;
  Progress: undefined;

  BrainGames: undefined;
  Assessment: undefined;

  MathQuiz: undefined;
  MathPlayAddition: undefined;
  MathPlayMultiplication: undefined;
  MathPlayMixed: undefined;
  MathResults: {
    score: number;
    totalQuestions: number;
    timeTaken: number;
    endedBy: string;
    gameType: string;



  };

  MemoryQuiz: undefined;
  MemoryPlayLevel1: undefined; // Pattern Memory
  MemoryPlayLevel2: undefined; // Memory Cards
  MemoryPlayLevel3: undefined; // Number Memory
  MemoryPlayLevel4: undefined; // Picture Memory
  MemoryResults: {
    score: number;
    totalQuestions: number;
    timeTaken: number;
    endedBy: string;
    gameType: 'pattern' | 'cards' | 'numbers' | 'pictures';
    level: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  };
    
  // Puzzles – existing
  PuzzleQuiz: undefined;
  OddPlay:   { difficulty: 'easy' | 'medium' | 'hard' };
  SeqPlay:   { difficulty: 'easy' | 'medium' | 'hard' };
  ArrowPlay: { difficulty: 'easy' | 'medium' | 'hard' };
  CompPlay:  { difficulty: 'easy' | 'medium' | 'hard' };

  // Puzzles – NEW
  SudokuPlay:        { difficulty: 'easy' | 'medium' | 'hard' };
  JigsawPlay:        { difficulty: 'easy' | 'medium' | 'hard' };
  TargetNumberPlay:  { difficulty: 'easy' | 'medium' | 'hard' };
  OrderTapPlay:      { difficulty: 'easy' | 'medium' | 'hard' };

  AttentionGame: undefined;
  PuzzleGame: undefined;
  MemoryTest: undefined;
  AttentionTest: undefined;
  MathAssessment: undefined;
  FullAssessment: undefined;
  GameResults: undefined;
  Reminder: undefined;
  Settings: undefined;
  Profile: undefined;
  AttentionQuiz: undefined;
  AttentionPlayEasy: undefined;
  AttentionPlayMedium: undefined;
  AttentionPlayHard: undefined;
  AttentionResults: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BrainGames" component={BrainGames} />
      <Stack.Screen name="Assessment" component={AssessmentTest} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      
      {/* Math Games */}
      <Stack.Screen name="MathQuiz" component={MathQuiz} />
      <Stack.Screen name="MathPlayAddition" component={MathPlayAddition} />
      <Stack.Screen name="MathPlayMultiplication" component={MathPlayMultiplication} />
      <Stack.Screen name="MathPlayMixed" component={MathPlayMixed} />
      <Stack.Screen name="MathResults" component={MathResults} />

      {/* Memory Games */}
      <Stack.Screen name="MemoryQuiz" component={MemoryQuiz} />
      <Stack.Screen name="MemoryPlayLevel1" component={MemoryPlayPattern} />
      <Stack.Screen name="MemoryPlayLevel2" component={MemoryPlayCards} />
      <Stack.Screen name="MemoryPlayLevel3" component={MemoryPlayNumbers} />
      <Stack.Screen name="MemoryPlayLevel4" component={MemoryPlayPictures} />
      <Stack.Screen name="MemoryResults" component={MemoryResultsScreen} />

      <Stack.Screen name="Reminder" component={ReminderScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AttentionGame" component={AttentionQuiz} />
      <Stack.Screen name="AttentionPlayEasy" component={AttentionPlayEasy} />
      <Stack.Screen name="AttentionPlayMedium" component={AttentionPlayMedium} />
      <Stack.Screen name="AttentionPlayHard" component={AttentionPlayHard} />
      <Stack.Screen name="AttentionResults" component={AttentionResultsScreen} /> 

       {/* Puzzles – existing */}
      <Stack.Screen name="PuzzleQuiz" component={PuzzleQuiz} />
      <Stack.Screen name="OddPlay" component={OddPlay} />
      <Stack.Screen name="SeqPlay" component={SeqPlay} />
      <Stack.Screen name="ArrowPlay" component={ArrowPlay} />
      <Stack.Screen name="CompPlay" component={CompPlay} />

      {/* Puzzles – NEW */}
      <Stack.Screen name="SudokuPlay" component={SudokuPlay} />
      <Stack.Screen name="JigsawPlay" component={JigsawPlay} />
      <Stack.Screen name="TargetNumberPlay" component={TargetNumberPlay} />
      <Stack.Screen name="OrderTapPlay" component={OrderTapPlay} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
