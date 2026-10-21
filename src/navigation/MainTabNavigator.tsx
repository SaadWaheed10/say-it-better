import React, {useMemo} from 'react';
import {Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {useAppTheme} from '../hooks/useAppTheme';
import {HistoryScreen} from '../screens/HistoryScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {MainTabParamList} from '../types';
import {ri, rp} from '../theme/useScaledStyles';
import {useMainTabNavigatorStyles} from './MainTabNavigator.styles';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({
  name,
  color,
}: {
  name: 'home' | 'history' | 'settings';
  color: string;
}) {
  const size = ri(22);
  if (name === 'home') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M4 11.5 L12 4 l8 7.5 V20 a1 1 0 0 1-1 1 h-5 v-6 H10 v6 H5 a1 1 0 0 1-1-1 Z"
          stroke={color}
          strokeWidth={1.8}
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (name === 'history') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={1.8} fill="none" />
        <Path
          d="M12 8 v5 l3 2"
          stroke={color}
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} fill="none" />
      <Rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}

function routeIconName(routeName: string): 'home' | 'history' | 'settings' {
  if (routeName === 'History') {
    return 'history';
  }
  if (routeName === 'Settings') {
    return 'settings';
  }
  return 'home';
}

export function MainTabNavigator() {
  const {colors, typography} = useAppTheme();
  const styles = useMainTabNavigatorStyles();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, rp(8));
  const tabTopPad = rp(8);
  const tabContentHeight = rp(56);

  const screenOptions = useMemo(
    () =>
      ({route}: {route: {name: string}}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryNavy,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.canvas,
            borderTopColor: colors.borderSoft,
            height: tabContentHeight + tabTopPad + bottomInset,
            paddingTop: tabTopPad,
            paddingBottom: bottomInset,
          },
        ],
        sceneStyle: {
          backgroundColor: colors.canvas,
        },
        tabBarLabel: ({color}: {color: string}) => (
          <Text style={[typography.caption, styles.label, {color}]}>
            {route.name}
          </Text>
        ),
        tabBarIcon: ({color}: {color: string}) => (
          <View style={styles.iconWrap}>
            <TabIcon name={routeIconName(route.name)} color={color} />
          </View>
        ),
      }),
    [colors, typography, styles, bottomInset, tabTopPad, tabContentHeight],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

