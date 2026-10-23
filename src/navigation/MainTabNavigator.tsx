import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppTheme} from '../hooks/useAppTheme';
import {HistoryScreen} from '../screens/HistoryScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {TemplatesScreen} from '../screens/TemplatesScreen';
import {TestsHubScreen} from '../screens/TestsHubScreen';
import {MainTabParamList} from '../types';
import {rp} from '../theme/useScaledStyles';
import {
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_GAP,
  FLOATING_TAB_SIDE,
  FloatingTabBar,
} from './FloatingTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Extra scroll padding so content clears the floating pill. */
export function useFloatingTabClearance() {
  const insets = useSafeAreaInsets();
  return (
    rp(FLOATING_TAB_BAR_HEIGHT) +
    rp(FLOATING_TAB_GAP) +
    Math.max(insets.bottom, rp(8)) +
    rp(16)
  );
}

export {FLOATING_TAB_BAR_HEIGHT, FLOATING_TAB_GAP, FLOATING_TAB_SIDE};

export function MainTabNavigator() {
  const {colors} = useAppTheme();

  return (
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {backgroundColor: colors.canvas},
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Templates"
        component={TemplatesScreen}
        options={{title: 'Situations'}}
      />
      <Tab.Screen name="Tests" component={TestsHubScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
