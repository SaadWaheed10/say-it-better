import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

type Props = {
  name: string;
  color: string;
  size?: number;
};

export function ToneIcon({name, color, size = 18}: Props) {
  const stroke = color;
  const common = {
    stroke,
    strokeWidth: 1.8,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'briefcase':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="7" width="18" height="13" rx="2" {...common} />
          <Path d="M8 7 V5 a2 2 0 0 1 2-2 h4 a2 2 0 0 1 2 2 v2" {...common} />
          <Path d="M3 12 h18" {...common} />
        </Svg>
      );
    case 'smile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M8 14 s1.5 2.5 4 2.5 4-2.5 4-2.5" {...common} />
          <Path d="M9 10 h.01 M15 10 h.01" {...common} />
        </Svg>
      );
    case 'handshake':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M3 12 l4-3 4 3 3-2 4 3 3-2"
            {...common}
          />
          <Path d="M8 15 l2 2 3-2" {...common} />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 3 l2.5 6.5 L21 10 l-5 4.2 L17.5 21 12 17.2 6.5 21 8 14.2 3 10 l6.5-.5 Z"
            {...common}
          />
        </Svg>
      );
    case 'coffee':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 9 h12 v7 a3 3 0 0 1-3 3 H7 a3 3 0 0 1-3-3 Z" {...common} />
          <Path d="M16 11 h2 a2.5 2.5 0 0 1 0 5 h-2" {...common} />
          <Path d="M7 3 v2 M10 2 v3 M13 3 v2" {...common} />
        </Svg>
      );
    case 'zap':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M13 2 L4 14 h7 l-1 8 10-14 h-7 Z" {...common} />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8" {...common} />
        </Svg>
      );
  }
}
