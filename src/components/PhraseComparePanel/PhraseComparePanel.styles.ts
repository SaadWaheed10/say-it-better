import {useScaledStyles, rp, rm, rf, rr, rl} from '../../theme/useScaledStyles';

export function usePhraseComparePanelStyles() {
  return useScaledStyles(() => ({
    wrap: {
      gap: rm(4),
    },
    panel: {
      borderWidth: 1,
      borderRadius: rr(22),
      padding: rp(16),
    },
    draftPanel: {
      borderStyle: 'dashed' as const,
    },
    resultPanel: {
      borderWidth: 1.5,
    },
    panelHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: rp(10),
      marginBottom: rm(12),
    },
    panelHeaderText: {
      flex: 1,
    },
    stepBadge: {
      width: rp(28),
      height: rp(28),
      borderRadius: rr(14),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    stepBadgeText: {
      fontSize: rf(13),
      fontWeight: '700' as const,
      lineHeight: rl(18),
    },
    eyebrow: {
      fontSize: rf(11),
      fontWeight: '700' as const,
      letterSpacing: 0.8,
      lineHeight: rl(14),
      marginBottom: rm(2),
    },
    panelTitle: {
      fontSize: rf(16),
      fontWeight: '600' as const,
      lineHeight: rl(22),
    },
    draftBody: {
      fontSize: rf(16),
      lineHeight: rl(24),
      fontStyle: 'italic' as const,
    },
    resultBody: {
      fontSize: rf(18),
      fontWeight: '500' as const,
      lineHeight: rl(28),
    },
    ghostCopy: {
      alignSelf: 'flex-start' as const,
      marginTop: rm(14),
      borderWidth: 1,
      borderRadius: rr(999),
      paddingHorizontal: rp(14),
      paddingVertical: rp(8),
    },
    ghostCopyLabel: {
      fontSize: rf(13),
      fontWeight: '600' as const,
      lineHeight: rl(18),
    },
    primaryCopy: {
      alignSelf: 'stretch' as const,
      marginTop: rm(16),
      borderRadius: rr(16),
      overflow: 'hidden' as const,
    },
    primaryCopyGradient: {
      paddingVertical: rp(14),
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: rr(16),
    },
    primaryCopyLabel: {
      fontSize: rf(15),
      fontWeight: '700' as const,
      lineHeight: rl(20),
    },
    connector: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: rp(6),
      paddingVertical: rp(12),
    },
    connectorBadge: {
      width: rp(40),
      height: rp(40),
      borderRadius: rr(20),
      borderWidth: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    connectorLabel: {
      fontSize: rf(12),
      fontWeight: '700' as const,
      lineHeight: rl(16),
      textAlign: 'center' as const,
    },
    toneChip: {
      paddingHorizontal: rp(10),
      paddingVertical: rp(6),
      borderRadius: rr(999),
    },
    toneChipText: {
      fontSize: rf(12),
      fontWeight: '600' as const,
      lineHeight: rl(16),
    },
  }));
}
