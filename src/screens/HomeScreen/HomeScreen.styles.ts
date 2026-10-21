import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useHomeScreenStyles() {
  return useScaledStyles(() => ({
    safe: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rp(20),
      paddingBottom: rp(32),
    },
    topRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      minHeight: rp(44),
      marginBottom: rm(8),
    },
    settingsHit: {
      width: rp(44),
      height: rp(44),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: rr(22),
    },
    brand: {
      fontSize: rf(34),
      fontWeight: '800' as const,
      letterSpacing: -0.8,
    },
    headline: {
      fontSize: rf(22),
      fontWeight: '700' as const,
      letterSpacing: -0.2,
      lineHeight: rl(30),
      marginTop: rm(12),
    },
    subtitle: {
      fontSize: rf(16),
      fontWeight: '400' as const,
      lineHeight: rl(24),
      marginTop: rm(8),
    },
    heroPanel: {
      marginTop: rm(28),
      paddingTop: rp(8),
      paddingBottom: rp(8),
    },
    heroAccentBar: {
      width: rp(40),
      height: rp(4),
      borderRadius: rr(2),
      marginBottom: rm(16),
    },
    heroCopy: {
      fontSize: rf(16),
      fontWeight: '500' as const,
      lineHeight: rl(24),
      marginBottom: rm(16),
    },
    statusBanner: {
      borderWidth: 1,
      marginTop: rm(16),
      padding: rp(12),
      borderRadius: rr(14),
    },
    statusText: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
    sectionTitle: {
      fontSize: rf(18),
      fontWeight: '600' as const,
      lineHeight: rl(24),
      marginTop: rm(24),
      marginBottom: rm(12),
    },
    toneGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: rp(12),
    },
    toneCard: {
      width: '47%' as const,
      borderWidth: 1,
      minHeight: rp(92),
      justifyContent: 'center' as const,
      padding: rp(16),
      borderRadius: rr(18),
    },
    toneLabel: {
      fontSize: rf(14),
      fontWeight: '600' as const,
      lineHeight: rl(20),
      marginTop: rm(8),
    },
  }));
}
