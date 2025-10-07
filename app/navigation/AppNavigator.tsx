import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AttentionAssessmentIntro from '../screens/Assessments/AttentionAssessmentIntro';
import AttentionAssessmentResult from '../screens/Assessments/AttentionAssessmentResult';
import AttentionAssessmentRun from '../screens/Assessments/AttentionAssessmentRun';
import MathAssessment from '../screens/Assessments/MathAssessment';
import MathAssessmentResult from '../screens/Assessments/MathAssessmentResult';
import MathAssessmentStart from '../screens/Assessments/MathAssessmentStart';
import PuzzleAssessmentIntro from '../screens/Assessments/PuzzleAssessmentIntro';
import PuzzleAssessmentResult from '../screens/Assessments/PuzzleAssessmentResult';
import PuzzleAssessmentRun from '../screens/Assessments/PuzzleAssessmentRun';

import MemoryTest from '../screens/Assessments/MemoryTest';
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
import ArrowPlay from '../screens/Games/Puzzle/ArrowPlay';
import CompPlay from '../screens/Games/Puzzle/CompPlay';
import JigsawPlay from '../screens/Games/Puzzle/JigsawPlay';
import OddPlay from '../screens/Games/Puzzle/OddPlay';
import OrderTapPlay from '../screens/Games/Puzzle/OrderTapPlay';
import PuzzleQuiz from '../screens/Games/Puzzle/PuzzleQuiz';
import SeqPlay from '../screens/Games/Puzzle/SeqPlay';
import SudokuPlay from '../screens/Games/Puzzle/SudokuPlay';
import TargetNumberPlay from '../screens/Games/Puzzle/TargetNumberPlay';
import AssessmentTest from '../screens/Main/AssessmentTest';
import BrainGames from '../screens/Main/BrainGames';
import HomeScreen from '../screens/Main/HomeScreen';
import InsightsScreen from '../screens/Main/InsightsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import ProgressScreen from '../screens/Main/ProgressScreen';
import ReminderScreen from '../screens/Main/RemainderScreen';
import SettingsScreen from '../screens/Main/SettingsScreen';
import { AssessmentResultPayload } from '../types/assessment';

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
  MemoryPlayLevel1: undefined;
  MemoryPlayLevel2: undefined;
  MemoryPlayLevel3: undefined;
  MemoryPlayLevel4: undefined;
  MemoryResults: {
    score: number;
    totalQuestions: number;
    timeTaken: number;
    endedBy: string;
    gameType: 'pattern' | 'cards' | 'numbers' | 'pictures';
    level: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  };
  PuzzleQuiz: undefined;
  OddPlay: { difficulty: 'easy' | 'medium' | 'hard' };
  SeqPlay: { difficulty: 'easy' | 'medium' | 'hard' };
  ArrowPlay: { difficulty: 'easy' | 'medium' | 'hard' };
  CompPlay: { difficulty: 'easy' | 'medium' | 'hard' };
  SudokuPlay: { difficulty: 'easy' | 'medium' | 'hard' };
  JigsawPlay: { difficulty: 'easy' | 'medium' | 'hard' };
  TargetNumberPlay: { difficulty: 'easy' | 'medium' | 'hard' };
  OrderTapPlay: { difficulty: 'easy' | 'medium' | 'hard' };
  AttentionGame: undefined;
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
  MathAssessmentStart: undefined;
  MathAssessmentResult: {
    results: AssessmentResultPayload;
    savedId: string | null;
  } | undefined;


  AttentionAssessmentIntro: undefined;
  AttentionAssessmentRun: undefined;
  AttentionAssessmentResult: {
    totalTime: number;
    results: Array<{
      taskId: number;
      trialNumber: number;
      targetPresent: boolean;
      responseGiven: boolean;
      responseTime: number | null;
      accuracy: boolean;
      timestamp: number;
    }>;
    overallAccuracy: number;
    averageReactionTime: number;
    tasksCompleted: number;
  };

  // NEW Puzzle Assessment
  PuzzleAssessmentIntro: undefined;
  PuzzleAssessmentRun: undefined;
  PuzzleAssessmentResult: {
    totalTime: number;
    results: Array<{
      task: string;
      correct: boolean;
      rt: number | null;
    }>;
    overallAccuracy: number;
    averageReactionTime: number;
    tasksCompleted: number;
  };
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
      <Stack.Screen name="MathQuiz" component={MathQuiz} />
      <Stack.Screen name="MathPlayAddition" component={MathPlayAddition} />
      <Stack.Screen name="MathPlayMultiplication" component={MathPlayMultiplication} />
      <Stack.Screen name="MathPlayMixed" component={MathPlayMixed} />
      <Stack.Screen name="MathResults" component={MathResults} />
      <Stack.Screen name="MemoryQuiz" component={MemoryQuiz} />
      <Stack.Screen name="MemoryPlayLevel1" component={MemoryPlayPattern} />
      <Stack.Screen name="MemoryPlayLevel2" component={MemoryPlayCards} />
      <Stack.Screen name="MemoryPlayLevel3" component={MemoryPlayNumbers} />
      <Stack.Screen name="MemoryPlayLevel4" component={MemoryPlayPictures} />
      <Stack.Screen name="MemoryResults" component={MemoryResultsScreen} />
      <Stack.Screen name="MemoryTest" component={MemoryTest} />
      <Stack.Screen name="Reminder" component={ReminderScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AttentionGame" component={AttentionQuiz} />
      <Stack.Screen name="AttentionPlayEasy" component={AttentionPlayEasy} />
      <Stack.Screen name="AttentionPlayMedium" component={AttentionPlayMedium} />
      <Stack.Screen name="AttentionPlayHard" component={AttentionPlayHard} />
      <Stack.Screen name="AttentionResults" component={AttentionResultsScreen} />
      <Stack.Screen name="PuzzleQuiz" component={PuzzleQuiz} />
      <Stack.Screen name="OddPlay" component={OddPlay} />
      <Stack.Screen name="SeqPlay" component={SeqPlay} />
      <Stack.Screen name="ArrowPlay" component={ArrowPlay} />
      <Stack.Screen name="CompPlay" component={CompPlay} />
      <Stack.Screen name="SudokuPlay" component={SudokuPlay} />
      <Stack.Screen name="JigsawPlay" component={JigsawPlay} />
      <Stack.Screen name="TargetNumberPlay" component={TargetNumberPlay} />
      <Stack.Screen name="OrderTapPlay" component={OrderTapPlay} />
      <Stack.Screen name="MathAssessment" component={MathAssessment} />
      <Stack.Screen name="MathAssessmentStart" component={MathAssessmentStart} />
      <Stack.Screen name="MathAssessmentResult" component={MathAssessmentResult} />
       <Stack.Screen name="AttentionAssessmentIntro" component={AttentionAssessmentIntro} />
      <Stack.Screen name="AttentionAssessmentRun" component={AttentionAssessmentRun} />
      <Stack.Screen name="AttentionAssessmentResult" component={AttentionAssessmentResult} />
       <Stack.Screen name="PuzzleAssessmentIntro" component={PuzzleAssessmentIntro} />
      <Stack.Screen name="PuzzleAssessmentRun" component={PuzzleAssessmentRun} />
      <Stack.Screen name="PuzzleAssessmentResult" component={PuzzleAssessmentResult} />
      
    </Stack.Navigator>
  );
};

export default AppNavigator;
