import {WrittenTipTag} from '../types';

export type TipCard = {
  id: WrittenTipTag;
  title: string;
  summary: string;
  examples: string[];
  practiceHint: string;
};

export const TIP_CARDS: TipCard[] = [
  {
    id: 'tense',
    title: 'Tense',
    summary: 'Match the time of the action: past, present, or future.',
    examples: [
      'Yesterday I go → Yesterday I went',
      'I will saw you → I will see you',
    ],
    practiceHint: 'Rewrite a past-tense email about something that already happened.',
  },
  {
    id: 'word-order',
    title: 'Word order',
    summary: 'English usually follows subject → verb → object.',
    examples: [
      'She always is late → She is always late',
      'I can help you tomorrow morning',
    ],
    practiceHint: 'Put time phrases at the end: “I’ll send it by Friday.”',
  },
  {
    id: 'tone',
    title: 'Tone',
    summary: 'Softer wording often sounds more professional and polite.',
    examples: [
      'Send this now → Could you send this today?',
      'You wrong → I think there may be a mix-up',
    ],
    practiceHint: 'Turn a blunt ask into a polite request.',
  },
  {
    id: 'article',
    title: 'Articles',
    summary: 'Use a/an for one of many; the for something specific.',
    examples: [
      'I am engineer → I am an engineer',
      'Open the file I shared yesterday',
    ],
    practiceHint: 'Add a/an/the to a short workplace sentence.',
  },
  {
    id: 'agreement',
    title: 'Agreement',
    summary: 'Subjects and verbs should match in number.',
    examples: [
      'She don’t know → She doesn’t know',
      'The options is ready → The options are ready',
    ],
    practiceHint: 'Fix one he/she/it doesn’t sentence.',
  },
  {
    id: 'clarity',
    title: 'Clarity',
    summary: 'Prefer specific, short sentences over vague filler.',
    examples: [
      'ASAP somehow → by 3pm today',
      'Do the needful → Please review the draft',
    ],
    practiceHint: 'Replace one vague phrase with a concrete detail.',
  },
  {
    id: 'word-choice',
    title: 'Word choice',
    summary: 'Common collocations sound more natural (make a decision, not do).',
    examples: [
      'Do a decision → Make a decision',
      'I did a mistake → I made a mistake',
    ],
    practiceHint: 'Swap one “do” for the natural verb (make/take/get).',
  },
];

export function getTipCard(id: WrittenTipTag): TipCard | undefined {
  return TIP_CARDS.find(card => card.id === id);
}
