import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnboardingToneScreen} from '../screens/OnboardingToneScreen';
import {OnboardingWelcomeScreen} from '../screens/OnboardingWelcomeScreen';
import {OnboardingStackParamList} from '../types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
      <Stack.Screen
        name="OnboardingWelcome"
        component={OnboardingWelcomeScreen}
      />
      <Stack.Screen name="OnboardingTone" component={OnboardingToneScreen} />
    </Stack.Navigator>
  );
}
