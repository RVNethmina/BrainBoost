
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AuthScreen from '../screens/Auth/AuthScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import HomeScreen from '../screens/Main/HomeScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Home: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
  );
};

export default AppNavigator;
