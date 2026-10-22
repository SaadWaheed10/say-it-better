import {StyleSheet} from 'react-native';
import {useScaledStyles, rp, rf, rr} from '../theme/useScaledStyles';

export function useFloatingTabBarStyles() {
  return useScaledStyles(() => ({
    host: {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      bottom: 0,
    },
    pill: {
      borderRadius: rr(28),
      overflow: 'hidden' as const,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: 'rgba(255,255,255,0.10)',
    },
    pillFill: {
      ...StyleSheet.absoluteFill,
    },
    accentLine: {
      position: 'absolute' as const,
      top: 0,
      left: rr(22),
      right: rr(22),
      height: 2.5,
      borderBottomLeftRadius: rr(2),
      borderBottomRightRadius: rr(2),
      opacity: 0.95,
    },
    row: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: rp(6),
    },
    item: {
      flex: 1,
      height: '100%' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: rp(3),
    },
    iconWrap: {
      width: rp(44),
      height: rp(30),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: rr(14),
      borderWidth: 1,
      borderColor: 'transparent',
    },
    label: {
      fontSize: rf(11),
      lineHeight: rf(13),
      letterSpacing: 0.25,
      textAlign: 'center' as const,
      includeFontPadding: false,
    },
  }));
}
