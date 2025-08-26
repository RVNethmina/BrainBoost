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
import MemoryGameScreen from '../screens/Games/MemoryMatch/MemoryGameScreen';
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
  Insights:undefined;
  Progress: undefined;

  BrainGames: undefined;
  Assessment: undefined;

  MathQuiz: undefined;
  MathPlayAddition: undefined;
  MathPlayMultiplication:undefined;
  MathPlayMixed:undefined;
  MathResults:undefined;

  MemoryMatch: undefined;
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
  MemoryGame: undefined;
  
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
      <Stack.Screen name="MemoryMatch" component={MemoryGameScreen} />
      <Stack.Screen name="MathQuiz" component={MathQuiz} />
      <Stack.Screen name="MathPlayAddition" component={MathPlayAddition} />
      <Stack.Screen name="MathPlayMultiplication" component={MathPlayMultiplication} />
      <Stack.Screen name="MathPlayMixed" component={MathPlayMixed} />
      <Stack.Screen name="MathResults" component={MathResults} />
      <Stack.Screen name="Reminder" component={ReminderScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
