import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useImproveMessageScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    flex: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
    },
    scrollContent: {
      paddingBottom: rp(48),
      flexGrow: 1,
    },
    hint: {
      fontSize: rf(14),
      lineHeight: rl(20),
      marginBottom: rm(14),
    },
    sectionTitle: {
      fontSize: rf(18),
      fontWeight: '600' as const,
      lineHeight: rl(24),
      marginTop: rm(20),
      marginBottom: rm(12),
    },
    instructionLabel: {
      fontSize: rf(14),
      fontWeight: '600' as const,
      lineHeight: rl(20),
      marginTop: rm(20),
      marginBottom: rm(8),
    },
    instruction: {
      borderWidth: 1,
      minHeight: rp(48),
      borderRadius: rr(18),
      padding: rp(12),
      fontSize: rf(16),
      lineHeight: rl(24),
    },
    error: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginTop: rm(12),
    },
    submit: {
      marginTop: rm(24),
    },
  }));
}
