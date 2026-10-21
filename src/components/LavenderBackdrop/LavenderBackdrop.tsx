import React from 'react';
import {
  BackdropVariant,
  ScreenBackdrop,
} from '../ScreenBackdrop';

type Props = {
  variant?: BackdropVariant | 'splash' | 'onboarding';
};

/** @deprecated Prefer ScreenBackdrop — kept for existing call sites. */
export function LavenderBackdrop({variant = 'onboarding'}: Props) {
  return <ScreenBackdrop variant={variant} />;
}
