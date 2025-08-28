import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import MathPlayAddition from '../screens/Games/Math/MathPlayAddition';
import MathPlayMixed from '../screens/Games/Math/MathPlayMixed';
import MathPlayMultiplication from '../screens/Games/Math/MathPlayMultiplication';
import MathQuiz from '../screens/Games/Math/MathQuiz';
import MathResults from '../screens/Games/Math/MathResults';
import MemoryQuiz from '../screens/Games/MemoryMatch/MemoryQuiz';
import MemoryPlayPattern from '../screens/Games/MemoryMatch/MemoryPlayPattern';
import MemoryPlayCards from '../screens/Games/MemoryMatch/MemoryPlayCards';
import MemoryPlayNumbers from '../screens/Games/MemoryMatch/MemoryPlayNumbers';
import MemoryPlayPictures from '../screens/Games/MemoryMatch/MemoryPlayPictures';
import MemoryResultsScreen from '../screens/Games/MemoryMatch/MemoryResultsScreen';
import AssessmentTest from '../screens/Main/AssessmentTest';
import BrainGames from '../screens/Main/BrainGames';
import HomeScreen from '../screens/Main/HomeScreen';
import InsightsScreen from '../screens/Main/InsightsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import ProgressScreen from '../screens/Main/ProgressScreen';
import ReminderScreen from '../screens/Main/RemainderScreen';
import SettingsScreen from '../screens/Main/SettingsScreen';

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
    </Stack.Navigator>
  );
};

export default AppNavigator;