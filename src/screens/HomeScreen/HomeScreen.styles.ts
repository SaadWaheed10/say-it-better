import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useHomeScreenStyles() {
  return useScaledStyles(() => ({
    safe: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: rp(20),
      // Floating tab bar clearance (pill + gap + home indicator)
      paddingBottom: rp(130),
    },
    topRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      minHeight: rp(44),
      marginBottom: rm(12),
    },
    livePill: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: rp(12),
      paddingVertical: rp(6),
      borderRadius: rr(20),
      borderWidth: 1,
      gap: rp(6),
    },
    liveDot: {
      width: rp(7),
      height: rp(7),
      borderRadius: rr(4),
    },
    liveText: {
      fontSize: rf(12),
      fontWeight: '700' as const,
      letterSpacing: 0.4,
    },
    settingsHit: {
      width: rp(44),
      height: rp(44),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: rr(22),
      borderWidth: 1,
    },
    brand: {
      fontSize: rf(38),
      fontWeight: '800' as const,
      letterSpacing: -1,
    },
    brandUnderline: {
      width: rp(72),
      height: rp(3),
      borderRadius: rr(2),
      marginTop: rm(8),
    },
    headline: {
      fontSize: rf(22),
      fontWeight: '700' as const,
      letterSpacing: -0.2,
      lineHeight: rl(30),
      marginTop: rm(16),
    },
    subtitle: {
      fontSize: rf(16),
      fontWeight: '400' as const,
      lineHeight: rl(24),
      marginTop: rm(8),
    },
    heroOuter: {
      marginTop: rm(28),
    },
    heroBorder: {
      borderRadius: rr(24),
      padding: 1.5,
    },
    heroInner: {
      borderRadius: rr(22.5),
      padding: rp(18),
    },
    heroAccentRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: rp(6),
      marginBottom: rm(14),
    },
    heroAccentBar: {
      width: rp(28),
      height: rp(4),
      borderRadius: rr(2),
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
      fontWeight: '700' as const,
      lineHeight: rl(24),
      marginTop: rm(28),
      marginBottom: rm(14),
      letterSpacing: -0.2,
    },
    toolsRow: {
      flexDirection: 'row' as const,
      gap: rp(12),
    },
    toolCard: {
      flex: 1,
      borderWidth: 1,
      borderRadius: rr(18),
      padding: rp(14),
      minHeight: rp(96),
    },
    toolTitle: {
      fontSize: rf(15),
      fontWeight: '700' as const,
      lineHeight: rl(20),
    },
    toolCopy: {
      fontSize: rf(12),
      lineHeight: rl(16),
      marginTop: rm(6),
    },
    toneGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: rp(12),
    },
    toneCard: {
      width: '47%' as const,
      borderWidth: 1,
      minHeight: rp(100),
      justifyContent: 'center' as const,
      padding: rp(16),
      borderRadius: rr(20),
    },
    toneIconWrap: {
      width: rp(40),
      height: rp(40),
      borderRadius: rr(12),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    toneLabel: {
      fontSize: rf(14),
      fontWeight: '600' as const,
      lineHeight: rl(20),
      marginTop: rm(10),
    },
  }));
}
