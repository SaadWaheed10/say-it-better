import React from 'react';
import {Platform, Pressable, Text, View} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Circle, Path} from 'react-native-svg';
import {useAppTheme} from '../hooks/useAppTheme';
import {hapticSelection} from '../services/hapticService';
import {darkGradientTab} from '../theme/colors';
import {ri, rp} from '../theme/useScaledStyles';
import {useFloatingTabBarStyles} from './FloatingTabBar.styles';

export const FLOATING_TAB_BAR_HEIGHT = 62;
export const FLOATING_TAB_SIDE = 18;
export const FLOATING_TAB_GAP = 12;

function TabIcon({
  name,
  color,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) {
  const size = ri(focused ? 22 : 20);
  const stroke = focused ? 2 : 1.75;

  if (name === 'Templates') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M5 5 h6 v6 H5 Z M13 5 h6 v6 h-6 Z M5 13 h6 v6 H5 Z M13 13 h6 v6 h-6 Z"
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'Tests') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M8 4 h10 a2 2 0 0 1 2 2 v14 a2 2 0 0 1-2 2 H8 a2 2 0 0 1-2-2 V6 a2 2 0 0 1 2-2 Z"
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinejoin="round"
        />
        <Path
          d="M10 9 h8 M10 13 h8 M10 17 h5"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <Path
          d="M6 8 h-1.5 M6 12 h-1.5 M6 16 h-1.5"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === 'History') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle
          cx="12"
          cy="12"
          r="8"
          stroke={color}
          strokeWidth={stroke}
          fill="none"
        />
        <Path
          d="M12 8 v5 l3 2"
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (name === 'Settings') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle
          cx="12"
          cy="12"
          r="3"
          stroke={color}
          strokeWidth={stroke}
          fill="none"
        />
        <Path
          d="M12 3.5 v1.4 M12 19.1 v1.4 M3.5 12 h1.4 M19.1 12 h1.4 M5.6 5.6 l1 1 M17.4 17.4 l1 1 M18.4 5.6 l-1 1 M6.6 17.4 l-1 1"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 11.5 L12 4 l8 7.5 V20 a1 1 0 0 1-1 1 h-5 v-6 H10 v6 H5 a1 1 0 0 1-1-1 Z"
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const {colors, isDark} = useAppTheme();
  const styles = useFloatingTabBarStyles();
  const insets = useSafeAreaInsets();

  const bottom =
    Math.max(insets.bottom, Platform.OS === 'android' ? rp(8) : 0) +
    rp(FLOATING_TAB_GAP);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          paddingBottom: bottom,
          paddingHorizontal: rp(FLOATING_TAB_SIDE),
        },
      ]}>
      <View
        style={[
          styles.pill,
          {
            height: rp(FLOATING_TAB_BAR_HEIGHT),
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.5 : 0.14,
                shadowRadius: 20,
                shadowOffset: {width: 0, height: 8},
              },
              android: {elevation: 16},
            }),
          },
        ]}>
        <LinearGradient
          colors={
            isDark
              ? [...darkGradientTab]
              : [colors.surfaceSolid, colors.canvas, colors.lavenderSoft]
          }
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.pillFill}
        />
        <LinearGradient
          colors={[colors.primaryAccent, colors.accentWarm, colors.accentRose]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.accentLine}
        />

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const {options} = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;
            const color = focused
              ? colors.primaryAccent
              : colors.tabInactive;

            const onPress = () => {
              hapticSelection();
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? {selected: true} : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.item}
                hitSlop={6}>
                <View
                  style={[
                    styles.iconWrap,
                    focused && {
                      backgroundColor: colors.tabActiveBg,
                      borderColor: `${colors.primaryAccent}66`,
                    },
                  ]}>
                  <TabIcon name={route.name} color={color} focused={focused} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    {
                      color,
                      fontWeight: focused ? '700' : '600',
                      opacity: focused ? 1 : 0.8,
                    },
                  ]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
