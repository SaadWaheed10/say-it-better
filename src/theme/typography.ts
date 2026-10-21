import {TextStyle} from 'react-native';

export const typography = {
  brand: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
  } satisfies TextStyle,
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 36,
  } satisfies TextStyle,
  h2: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 30,
  } satisfies TextStyle,
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } satisfies TextStyle,
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  } satisfies TextStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } satisfies TextStyle,
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  } satisfies TextStyle,
} as const;
