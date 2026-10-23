import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useOnboardingAuthIllustrationStyles() {
  return useScaledStyles(() => ({
    wrap: {
      width: '100%' as const,
      alignItems: 'center' as const,
    },
    stage: {
      width: '100%' as const,
      borderRadius: rr(24),
      padding: rp(18),
      overflow: 'hidden' as const,
    },
    device: {
      alignSelf: 'center' as const,
      width: '72%' as const,
      borderRadius: rr(20),
      borderWidth: 1,
      padding: rp(14),
    },
    deviceBar: {
      height: rp(4),
      width: rp(36),
      borderRadius: rr(2),
      alignSelf: 'center' as const,
      marginBottom: rm(14),
    },
    scoreRow: {
      flexDirection: 'row' as const,
      gap: rp(8),
      marginBottom: rm(12),
    },
    scorePill: {
      flex: 1,
      borderRadius: rr(12),
      paddingVertical: rp(10),
      paddingHorizontal: rp(8),
      alignItems: 'center' as const,
    },
    scoreValue: {
      fontSize: rf(16),
      fontWeight: '800' as const,
      lineHeight: rl(20),
    },
    scoreLabel: {
      fontSize: rf(10),
      fontWeight: '600' as const,
      marginTop: rm(2),
    },
    syncRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: rp(8),
      marginTop: rm(4),
    },
    syncDot: {
      width: rp(8),
      height: rp(8),
      borderRadius: rr(4),
    },
    syncText: {
      fontSize: rf(12),
      fontWeight: '600' as const,
      flex: 1,
    },
    cloud: {
      position: 'absolute' as const,
      right: rp(10),
      top: rp(10),
      width: rp(44),
      height: rp(44),
      borderRadius: rr(22),
      borderWidth: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  }));
}
