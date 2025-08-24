import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import HomeScreen from '../screens/Main/HomeScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  Signup: undefined;
  Home: undefined;
  Progress: undefined;
  BrainGames: undefined;
  Assessment: undefined;
  MathQuiz: undefined;
  MathPlay: undefined;
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
    </Stack.Navigator>
  );
};

export default AppNavigator;
