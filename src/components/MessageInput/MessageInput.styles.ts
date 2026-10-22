import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useMessageInputStyles() {
  return useScaledStyles(() => ({
    wrap: {
      borderWidth: 1,
      borderRadius: rr(22),
      padding: rp(16),
    },
    input: {
      padding: 0,
      fontSize: rf(16),
      lineHeight: rl(24),
      minHeight: rp(140),
    },
    voiceStatus: {
      marginTop: rm(10),
      fontSize: rf(13),
      lineHeight: rl(18),
    },
    footer: {
      marginTop: rm(10),
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      gap: rp(8),
    },
    footerLeft: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: rp(12),
      flexWrap: 'wrap' as const,
    },
    footerAction: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
    counter: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
    voiceActions: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: rp(8),
    },
    micButton: {
      width: rp(40),
      height: rp(40),
      borderRadius: rr(20),
      borderWidth: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    voiceButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: rp(6),
      paddingHorizontal: rp(12),
      paddingVertical: rp(8),
      borderRadius: rr(18),
    },
    voiceButtonLabel: {
      fontSize: rf(13),
      fontWeight: '600' as const,
      lineHeight: rl(18),
    },
    processingRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: rp(8),
    },
  }));
}
