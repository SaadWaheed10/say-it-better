import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';
import {useAppTheme} from './useAppTheme';

/** True when the user opts in or the OS Reduce Motion setting is on. */
export function useReduceMotion(): boolean {
  const {reduceMotion: preference} = useAppTheme();
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (mounted) {
          setSystemReduceMotion(Boolean(value));
        }
      })
      .catch(() => {
        // ignore
      });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystemReduceMotion,
    );
    return () => {
      mounted = false;
      // RN versions differ on subscription shape
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anySub = sub as any;
      if (typeof anySub?.remove === 'function') {
        anySub.remove();
      } else if (typeof sub === 'function') {
        (sub as unknown as () => void)();
      }
    };
  }, []);

  return Boolean(preference) || systemReduceMotion;
}
