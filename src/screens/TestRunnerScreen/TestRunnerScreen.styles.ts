import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function useTestRunnerScreenStyles() {
  return useScaledStyles(() => ({
    safe: {flex: 1},
    flex: {flex: 1},
    body: {
      paddingHorizontal: rp(20),
      flex: 1,
    },
    loadingWrap: {
      flex: 1,
    },
    progressTrack: {
      height: rp(6),
      borderRadius: rr(3),
      overflow: 'hidden' as const,
      marginBottom: rm(8),
    },
    progressFill: {
      height: '100%' as const,
      borderRadius: rr(3),
    },
    metaRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: rm(14),
    },
    progressLabel: {
      fontSize: rf(12),
      fontWeight: '600' as const,
    },
    timer: {
      fontSize: rf(14),
      fontWeight: '800' as const,
      letterSpacing: 0.5,
    },
    voiceRow: {
      flexDirection: 'row' as const,
      gap: rp(10),
      marginBottom: rm(12),
    },
    voiceBtn: {
      flex: 1,
    },
    audioStack: {
      width: '100%' as const,
      gap: rp(6),
      marginTop: rm(2),
      marginBottom: rm(10),
    },
    audioBtn: {
      width: '100%' as const,
      borderWidth: 1,
      borderRadius: rr(14),
      overflow: 'hidden' as const,
    },
    audioBtnInner: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: rp(11),
      paddingHorizontal: rp(12),
      gap: rp(10),
      minHeight: rp(48),
      width: '100%' as const,
    },
    audioIconWrap: {
      width: rp(28),
      height: rp(28),
      borderRadius: rr(9),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    audioChipLabel: {
      fontSize: rf(13),
      fontWeight: '700' as const,
      letterSpacing: -0.1,
      lineHeight: rl(17),
    },
    audioChipSub: {
      fontSize: rf(11),
      fontWeight: '500' as const,
      marginTop: rm(1),
      lineHeight: rl(14),
    },
    audioChipTextCol: {
      flexShrink: 1,
      flexGrow: 1,
    },
    audioPair: {
      flexDirection: 'row' as const,
      width: '100%' as const,
      gap: rp(6),
    },
    audioPairBtn: {
      flex: 1,
      borderWidth: 1,
      borderRadius: rr(14),
      overflow: 'hidden' as const,
    },
    audioRow: {
      flexDirection: 'row' as const,
      width: '100%' as const,
      gap: rp(6),
    },
    audioRowMain: {
      flex: 1,
      borderWidth: 1,
      borderRadius: rr(14),
      overflow: 'hidden' as const,
    },
    audioRowSide: {
      borderWidth: 1,
      borderRadius: rr(14),
      overflow: 'hidden' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: rp(14),
      minWidth: rp(96),
      minHeight: rp(48),
    },
    audioRowSideInner: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: rp(6),
      minHeight: rp(48),
      paddingVertical: rp(11),
    },
    audioRowSideLabel: {
      fontSize: rf(13),
      fontWeight: '700' as const,
    },
    feedbackBox: {
      borderWidth: 1,
      borderRadius: rr(14),
      padding: rp(12),
      marginTop: rm(8),
      marginBottom: rm(8),
    },
    feedbackTitle: {
      fontSize: rf(14),
      fontWeight: '800' as const,
      marginBottom: rm(4),
    },
    feedbackBody: {
      fontSize: rf(13),
      lineHeight: rl(18),
    },
    skillChip: {
      alignSelf: 'flex-start' as const,
      paddingHorizontal: rp(10),
      paddingVertical: rp(5),
      borderRadius: rr(999),
      marginBottom: rm(10),
    },
    skillChipText: {
      fontSize: rf(11),
      fontWeight: '700' as const,
      letterSpacing: 0.3,
      textTransform: 'uppercase' as const,
    },
    prompt: {
      fontSize: rf(18),
      fontWeight: '700' as const,
      lineHeight: rl(26),
      marginBottom: rm(14),
    },
    rough: {
      borderWidth: 1,
      borderRadius: rr(16),
      padding: rp(14),
      marginBottom: rm(12),
      fontStyle: 'italic' as const,
      fontSize: rf(15),
      lineHeight: rl(22),
    },
    hint: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(12),
    },
    option: {
      borderWidth: 1,
      borderRadius: rr(16),
      padding: rp(14),
      marginBottom: rm(10),
    },
    optionText: {
      fontSize: rf(15),
      lineHeight: rl(22),
    },
    writtenInput: {
      borderWidth: 1,
      minHeight: rp(110),
      borderRadius: rr(16),
      padding: rp(14),
      fontSize: rf(16),
      lineHeight: rl(24),
      textAlignVertical: 'top' as const,
      marginBottom: rm(16),
    },
    footer: {
      marginTop: rm(12),
      paddingBottom: rp(28),
    },
    error: {
      fontSize: rf(13),
      lineHeight: rl(18),
      marginBottom: rm(8),
    },
    scrollContent: {
      paddingBottom: rp(48),
      flexGrow: 1,
    },
  }));
}
