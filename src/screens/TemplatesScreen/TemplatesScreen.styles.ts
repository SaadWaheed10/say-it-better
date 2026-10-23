import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useTemplatesScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    scrollContent: {
      paddingHorizontal: rp(20),
      paddingBottom: rp(130),
    },
    title: {
      fontSize: rf(28),
      fontWeight: '800' as const,
      letterSpacing: -0.6,
      lineHeight: rl(34),
    },
    titleAccent: {
      height: rp(3),
      width: rp(48),
      borderRadius: rr(2),
      marginTop: rm(8),
      marginBottom: rm(8),
    },
    caption: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginBottom: rm(18),
    },
    card: {
      borderWidth: 1,
      borderRadius: rr(20),
      padding: rp(16),
      marginBottom: rm(12),
      overflow: 'hidden' as const,
    },
    cardStripe: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: rp(4),
    },
    cardBody: {
      paddingLeft: rp(10),
    },
    cardTitle: {
      fontSize: rf(17),
      fontWeight: '700' as const,
      lineHeight: rl(22),
    },
    cardSubtitle: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(4),
    },
    example: {
      fontSize: rf(13),
      lineHeight: rl(18),
      fontStyle: 'italic' as const,
      marginTop: rm(10),
    },
    toneChip: {
      alignSelf: 'flex-start' as const,
      marginTop: rm(12),
      paddingHorizontal: rp(10),
      paddingVertical: rp(5),
      borderRadius: rr(999),
    },
    toneChipText: {
      fontSize: rf(11),
      fontWeight: '700' as const,
      letterSpacing: 0.3,
    },
  }));
}
