import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useSettingsScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    scrollContent: {
      paddingHorizontal: rp(20),
      paddingBottom: rp(40),
    },
    title: {
      fontSize: rf(22),
      fontWeight: '700' as const,
      letterSpacing: -0.2,
      lineHeight: rl(30),
    },
    sectionLabel: {
      fontSize: rf(14),
      fontWeight: '600' as const,
      lineHeight: rl(20),
      marginTop: rm(20),
      marginBottom: rm(12),
    },
    fieldLabel: {
      fontSize: rf(16),
      fontWeight: '500' as const,
      lineHeight: rl(24),
      marginBottom: rm(8),
    },
    row: {
      borderWidth: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      minHeight: rp(52),
      borderRadius: rr(18),
      paddingHorizontal: rp(16),
      paddingVertical: rp(12),
      marginBottom: rm(12),
    },
    rowAfterTone: {
      marginTop: rm(20),
    },
    rowText: {
      fontSize: rf(16),
      fontWeight: '500' as const,
      lineHeight: rl(24),
    },
    rowValue: {
      fontSize: rf(16),
      lineHeight: rl(24),
    },
    modelCard: {
      borderWidth: 1,
      borderRadius: rr(22),
      padding: rp(16),
    },
    modelTitle: {
      fontSize: rf(16),
      fontWeight: '500' as const,
      lineHeight: rl(24),
    },
    modelMeta: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(6),
    },
    modelMetaTight: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(4),
    },
    retryBtn: {
      marginTop: rm(16),
    },
    privacyText: {
      fontSize: rf(16),
      lineHeight: rl(24),
      flex: 1,
      paddingVertical: rp(8),
    },
    aboutCaption: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
    footerNote: {
      fontSize: rf(13),
      lineHeight: rl(18),
      textAlign: 'center' as const,
      marginTop: rm(24),
    },
  }));
}
