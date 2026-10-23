import {TemplateSituation, ToneId} from '../types';

export const TEMPLATES: TemplateSituation[] = [
  {
    id: 'apology',
    title: 'Apology',
    subtitle: 'Own a mistake without over-explaining',
    example:
      'sorry i late for meeting yesterday network problem and i not tell you',
    instruction: 'Make it a sincere, concise apology.',
    tone: 'polite',
    accent: 'rose',
  },
  {
    id: 'follow-up',
    title: 'Follow-up',
    subtitle: 'Nudge politely after no reply',
    example:
      'hi just checking my last email did you see it i need answer soon thanks',
    instruction: 'Make it a polite professional follow-up.',
    tone: 'professional',
    accent: 'teal',
  },
  {
    id: 'decline',
    title: 'Decline politely',
    subtitle: 'Say no without burning bridges',
    example:
      'i cannot join the call tomorrow i have other work maybe next time',
    instruction: 'Decline politely and leave the door open.',
    tone: 'polite',
    accent: 'amber',
  },
  {
    id: 'ask-raise',
    title: 'Ask for a raise',
    subtitle: 'Confident, respectful, specific',
    example:
      'i want talk about salary i work hard this year and want more money',
    instruction: 'Make it confident and professional, ready to send to a manager.',
    tone: 'confident',
    accent: 'teal',
  },
  {
    id: 'thank-you',
    title: 'Thank you',
    subtitle: 'Warm gratitude that still sounds natural',
    example: 'thanks for help today you save me lots of time really',
    instruction: 'Make it warm and genuine.',
    tone: 'friendly',
    accent: 'amber',
  },
  {
    id: 'request-help',
    title: 'Ask for help',
    subtitle: 'Clear ask with context',
    example:
      'can you help me with the report i stuck on the numbers part please',
    instruction: 'Make it a clear, respectful request for help.',
    tone: 'polite',
    accent: 'rose',
  },
  {
    id: 'meeting-invite',
    title: 'Meeting invite',
    subtitle: 'Propose time without sounding pushy',
    example: 'we should meet about the project are you free thursday afternoon',
    instruction: 'Make it a concise professional meeting invite.',
    tone: 'professional',
    accent: 'teal',
  },
  {
    id: 'status-update',
    title: 'Status update',
    subtitle: 'Short progress note for teammates',
    example:
      'i finish the design today tomorrow i start coding the login page',
    instruction: 'Make it a clear concise status update.',
    tone: 'concise',
    accent: 'amber',
  },
];

export function getTemplate(id: string): TemplateSituation | undefined {
  return TEMPLATES.find(item => item.id === id);
}

export function accentColorKey(
  accent: TemplateSituation['accent'],
): 'primaryAccent' | 'accentWarm' | 'accentRose' {
  if (accent === 'amber') {
    return 'accentWarm';
  }
  if (accent === 'rose') {
    return 'accentRose';
  }
  return 'primaryAccent';
}

export type {ToneId};
