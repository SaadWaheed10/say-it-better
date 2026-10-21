import {ToneOption} from '../types';

export const TONES: ToneOption[] = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Clear, polished, and workplace-ready',
    icon: 'briefcase',
  },
  {
    id: 'friendly',
    label: 'Friendly',
    description: 'Warm and approachable',
    icon: 'smile',
  },
  {
    id: 'polite',
    label: 'Polite',
    description: 'Respectful and considerate',
    icon: 'handshake',
  },
  {
    id: 'confident',
    label: 'Confident',
    description: 'Assured and decisive',
    icon: 'star',
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Relaxed and conversational',
    icon: 'coffee',
  },
  {
    id: 'concise',
    label: 'Concise',
    description: 'Short and to the point',
    icon: 'zap',
  },
];

export const DEFAULT_TONE = TONES[0].id;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_HISTORY_ITEMS = 50;
