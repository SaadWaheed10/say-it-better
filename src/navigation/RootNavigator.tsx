import React from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAppTheme} from '../hooks/useAppTheme';
import {AboutScreen} from '../screens/AboutScreen';
import {ImproveMessageScreen} from '../screens/ImproveMessageScreen';
import {LibraryScreen} from '../screens/LibraryScreen';
import {PracticeScreen} from '../screens/PracticeScreen';
import {ResultsScreen} from '../screens/ResultsScreen';
import {SplashScreen} from '../screens/SplashScreen';
import {TestBadgesScreen} from '../screens/TestBadgesScreen';
import {TestResultsScreen} from '../screens/TestResultsScreen';
import {TestRunnerScreen} from '../screens/TestRunnerScreen';
import {RootStackParamList} from '../types';
import {MainTabNavigator} from './MainTabNavigator';
import {OnboardingNavigator} from './OnboardingNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const {colors, isDark} = useAppTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.canvas,
      card: colors.canvas,
      text: colors.primaryText,
      border: colors.borderSoft,
      primary: colors.primaryAccent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="ImproveMessage" component={ImproveMessageScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Practice" component={PracticeScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="TestRunner" component={TestRunnerScreen} />
        <Stack.Screen name="TestResults" component={TestResultsScreen} />
        <Stack.Screen name="TestBadges" component={TestBadgesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
