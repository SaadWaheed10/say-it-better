import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useResultCardStyles() {
  return useScaledStyles(() => ({
    card: {
      borderWidth: 1,
      borderRadius: rr(22),
      padding: rp(16),
    },
    title: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(8),
    },
    body: {
      fontSize: rf(16),
      lineHeight: rl(24),
    },
    bodyMedium: {
      fontSize: rf(16),
      fontWeight: '500' as const,
      lineHeight: rl(24),
    },
    copyButton: {
      alignSelf: 'flex-end' as const,
      paddingHorizontal: rp(14),
      paddingVertical: rp(8),
      minHeight: rp(36),
      justifyContent: 'center' as const,
      borderRadius: rr(999),
      marginTop: rm(12),
    },
    copyLabel: {
      fontSize: rf(14),
      fontWeight: '600' as const,
      lineHeight: rl(20),
    },
  }));
}
