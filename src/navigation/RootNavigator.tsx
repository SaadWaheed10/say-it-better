import React from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAppTheme} from '../hooks/useAppTheme';
import {ImproveMessageScreen} from '../screens/ImproveMessageScreen';
import {ResultsScreen} from '../screens/ResultsScreen';
import {SplashScreen} from '../screens/SplashScreen';
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
      primary: colors.primaryNavy,
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
