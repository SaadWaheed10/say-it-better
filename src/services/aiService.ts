import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {initLlama, LlamaContext} from 'llama.rn';
import {TONES} from '../constants/tones';
import {
  ImproveRequest,
  ImproveResult,
  ModelState,
  ToneId,
} from '../types';
import {
  buildModelPathCandidates,
  ensureBundledModelAvailable,
  getStoredModelPathOverride,
  MODEL_FILENAME,
  toFileUri,
} from './modelPath';
import {releaseWhisperContext} from './voiceService';

const STOP_WORDS = [
  '</s>',
  '<|end|>',
  '<|eot_id|>',
  '<|end_of_text|>',
  '<|im_end|>',
  '<|im_start|>',
  '<|EOT|>',
  '<|END_OF_TURN_TOKEN|>',
  '<|end_of_turn|>',
  '<|endoftext|>',
];

type Listener = (state: ModelState) => void;

let context: LlamaContext | null = null;
let initPromise: Promise<void> | null = null;
let activeRequestId = 0;
let modelState: ModelState = {
  status: 'idle',
  message: 'Model has not been initialized yet.',
};

const listeners = new Set<Listener>();

function emit(next: ModelState) {
  modelState = next;
  listeners.forEach(listener => listener(modelState));
}

export function subscribeModelState(listener: Listener): () => void {
  listeners.add(listener);
  listener(modelState);
  return () => listeners.delete(listener);
}

export function getModelStatus(): ModelState {
  return modelState;
}

function toneLabel(tone: ToneId): string {
  return TONES.find(item => item.id === tone)?.label ?? tone;
}

type ChatMessage = {role: 'system' | 'user' | 'assistant'; content: string};

/**
 * Few-shot examples — critical for reliable phrase correction on-device.
 */
const FEW_SHOT_FIXES: Array<{bad: string; good: string}> = [
  {
    bad: 'i want meet you tommorow can you?',
    good: 'Can we meet tomorrow?',
  },
  {
    bad: 'sorry i late because traffic was much',
    good: 'Sorry I was late — the traffic was heavy.',
  },
  {
    bad: 'what time you free tomorrow for call?',
    good: 'What time are you free for a call tomorrow?',
  },
  {
    bad: 'please send me the file i not receive yet',
    good: 'Please send me the file — I have not received it yet.',
  },
  {
    bad: 'sir please give me job i have experience 2 year in marketing',
    good:
      'Sir, please consider me for the job. I have two years of experience in marketing.',
  },
  {
    bad: 'i am agree with you but need more time for finish',
    good: 'I agree with you, but I need more time to finish.',
  },
];

function buildFixMessages(
  message: string,
  tone: ToneId,
  instruction?: string,
): ChatMessage[] {
  const toneHint = toneLabel(tone);
  const extra = instruction?.trim()
    ? ` Style preference: ${instruction.trim()}.`
    : '';

  const system = [
    'You are an English phrase corrector for non-native speakers.',
    'Rewrite the user draft into clear, natural, grammatically correct English.',
    'Keep the same meaning. If the draft is a question, rewrite the question — never answer it.',
    'Output ONLY the corrected phrase. No quotes, labels, or explanations.',
    `Tone: ${toneHint}.${extra}`,
  ].join(' ');

  const shots: ChatMessage[] = FEW_SHOT_FIXES.flatMap(({bad, good}) => [
    {role: 'user', content: `Draft:\n${bad}`},
    {role: 'assistant', content: good},
  ]);

  return [
    {role: 'system', content: system},
    ...shots,
    {role: 'user', content: `Draft:\n${message}`},
  ];
}

function buildRetryMessages(message: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'Correct the English. Output only the corrected sentence. Never answer.',
    },
    {role: 'user', content: 'i want meet you tommorow can you?'},
    {role: 'assistant', content: 'Can we meet tomorrow?'},
    {role: 'user', content: 'sorry i late because traffic was much'},
    {
      role: 'assistant',
      content: 'Sorry I was late — the traffic was heavy.',
    },
    {role: 'user', content: message},
  ];
}

/** Second pass: polish / reject meta answers. */
function buildVerifyMessages(
  original: string,
  candidate: string,
  tone: ToneId,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: [
        'You polish English corrections.',
        'Given ORIGINAL draft and CANDIDATE rewrite, output the best corrected phrase.',
        'Same meaning as ORIGINAL. Correct grammar. Natural English.',
        `Tone: ${toneLabel(tone)}.`,
        'If CANDIDATE is already perfect, output it unchanged.',
        'If CANDIDATE answers a question or explains instead of rewriting, ignore it and correct ORIGINAL yourself.',
        'Output ONLY the final corrected phrase.',
      ].join(' '),
    },
    {
      role: 'user',
      content: `ORIGINAL:\n${original}\n\nCANDIDATE:\n${candidate}`,
    },
  ];
}

function cleanModelOutput(text: string): string {
  let cleaned = text.trim();
  // Take first non-empty line — models sometimes add a second explanatory line.
  const firstLine = cleaned
    .split(/\n+/)
    .map(line => line.trim())
    .find(Boolean);
  if (firstLine) {
    cleaned = firstLine;
  }
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '');
  cleaned = cleaned.replace(/^fix:\s*/i, '');
  cleaned = cleaned.replace(
    /^(improved|rewrite|rewritten|corrected|output|here(?:'s| is)(?: the)?(?: corrected| improved| fixed)?(?: version| message| phrase)?)\s*[:\-–]?\s*/i,
    '',
  );
  cleaned = cleaned.replace(/^---(?:IMPROVED|OUTPUT|RESULT)?---\s*/i, '');
  cleaned = cleaned.replace(/\s*---END.*?---\s*$/i, '');
  cleaned = cleaned.replace(/<\/?s>/gi, '').trim();
  return cleaned;
}

/** True when the model parroted the task instead of rewriting the draft. */
function looksLikeMetaOutput(text: string, original: string): boolean {
  const lower = text.toLowerCase();
  const originalLower = original.toLowerCase();

  if (!text || text.length < 2) {
    return true;
  }

  // Exact / near echo of our own instruction phrasing.
  const metaPatterns = [
    /i('ll| will) return/,
    /correct(ed)? (english )?version/,
    /same phrase/,
    /as[- ]is/,
    /do not answer/,
    /do not explain/,
    /---draft---/,
    /sayitbetter/,
    /fix broken english/,
    /output only/,
    /here is (the )?(corrected|improved|fixed)/,
    /i have corrected/,
    /the corrected (version|phrase|message) (is|would be)/,
  ];
  if (metaPatterns.some(pattern => pattern.test(lower))) {
    return true;
  }

  // Talking about the task rather than producing the message.
  if (
    /\b(return|version|phrase|draft|instruction|rule)\b/.test(lower) &&
    !originalLower.includes('return') &&
    !originalLower.includes('version')
  ) {
    // Allow short natural uses; flag longer instructional answers.
    if (text.split(/\s+/).length >= 8) {
      return true;
    }
  }

  return false;
}

type ResolvedModel = {
  path: string;
  /** When true, pass is_model_asset to llama.rn (iOS bundle primarily). */
  isAsset?: boolean;
};

async function resolveExistingModelPath(): Promise<ResolvedModel | null> {
  // 1) Extract bundled model from APK/IPA into Documents (preferred for APK sharing).
  const bundled = await ensureBundledModelAvailable();
  if (bundled) {
    return {path: bundled};
  }

  // 2) Existing Documents / override / dev paths.
  const override = await getStoredModelPathOverride();
  const candidates = buildModelPathCandidates(
    {
      documentDirectoryPath: RNFS.DocumentDirectoryPath,
      cachesDirectoryPath: RNFS.CachesDirectoryPath,
      externalDirectoryPath:
        Platform.OS === 'android' ? RNFS.ExternalDirectoryPath : null,
    },
    override,
  );

  for (const candidate of candidates) {
    try {
      const exists = await RNFS.exists(candidate);
      if (exists) {
        return {path: candidate};
      }
    } catch {
      // continue
    }
  }

  // 3) iOS: try loading directly from the app bundle via llama.rn asset flag.
  if (Platform.OS === 'ios') {
    return {path: MODEL_FILENAME, isAsset: true};
  }

  return null;
}

export async function initializeModel(): Promise<ModelState> {
  if (modelState.status === 'ready' && context) {
    return modelState;
  }

  if (initPromise) {
    await initPromise;
    return modelState;
  }

  initPromise = (async () => {
    emit({
      status: 'checking',
      message: 'Looking for the local language model…',
    });

    const resolved = await resolveExistingModelPath();

    if (!resolved) {
      emit({
        status: 'missing',
        message: 'Local model file not found.',
        detail:
          'Run npm run bundle-model before building, then rebuild the app. See docs/MODEL_SETUP.md.',
      });
      return;
    }

    emit({
      status: 'loading',
      message: 'Loading Qwen2.5 on-device model…',
      path: resolved.path,
    });

    try {
      // Free Whisper first so Android mid-range devices can load 1.5B.
      await releaseWhisperContext();

      const nextContext = await initLlama({
        model: resolved.isAsset ? resolved.path : toFileUri(resolved.path),
        is_model_asset: Boolean(resolved.isAsset),
        n_ctx: 4096,
        n_gpu_layers: Platform.OS === 'ios' ? 99 : 0,
        use_mlock: Platform.OS === 'ios',
      });

      context = nextContext;
      emit({
        status: 'ready',
        message: 'On-device model is ready for offline correction.',
        path: resolved.path,
      });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : 'Unknown model load error';
      context = null;
      emit({
        status: 'error',
        message: 'Could not initialize the local model.',
        detail,
        path: resolved.path,
      });
    }
  })();

  try {
    await initPromise;
  } finally {
    initPromise = null;
  }

  return modelState;
}

export async function improveMessage(
  input: ImproveRequest,
): Promise<ImproveResult> {
  const message = input.message.trim();
  if (!message) {
    throw new Error('Please enter a message to improve.');
  }

  // Prefer RAM for the LLM after voice use.
  await releaseWhisperContext();

  if (!context || modelState.status !== 'ready') {
    await initializeModel();
  }

  if (!context || modelState.status !== 'ready') {
    throw new Error(
      modelState.detail ||
        modelState.message ||
        'The local model is not ready yet.',
    );
  }

  const requestId = ++activeRequestId;

  const runCompletion = async (messages: ChatMessage[]) => {
    const result = await context!.completion({
      messages,
      n_predict: 128,
      temperature: 0.15,
      top_p: 0.85,
      stop: STOP_WORDS,
    });
    return cleanModelOutput(result.text || '');
  };

  try {
    let improved = await runCompletion(
      buildFixMessages(message, input.tone, input.instruction),
    );

    if (requestId !== activeRequestId) {
      throw new Error('Request was cancelled.');
    }

    if (!improved || looksLikeMetaOutput(improved, message)) {
      improved = await runCompletion(buildRetryMessages(message));
    }

    if (requestId !== activeRequestId) {
      throw new Error('Request was cancelled.');
    }

    if (!improved || looksLikeMetaOutput(improved, message)) {
      throw new Error(
        'The model did not return a corrected phrase. Please try again.',
      );
    }

    // Verify / polish pass for higher accuracy.
    const verified = await runCompletion(
      buildVerifyMessages(message, improved, input.tone),
    );

    if (requestId !== activeRequestId) {
      throw new Error('Request was cancelled.');
    }

    if (verified && !looksLikeMetaOutput(verified, message)) {
      improved = verified;
    }

    return {
      original: message,
      improved,
      alternatives: [],
      tone: input.tone,
      createdAt: Date.now(),
    };
  } catch (error) {
    if (requestId !== activeRequestId) {
      throw new Error('Request was cancelled.');
    }
    throw error instanceof Error
      ? error
      : new Error('Message improvement failed.');
  }
}

export async function cancelImprovement(): Promise<void> {
  activeRequestId += 1;
  if (context) {
    try {
      await context.stopCompletion();
    } catch {
      // ignore
    }
  }
}

export async function disposeModel(): Promise<void> {
  activeRequestId += 1;
  const current = context;
  context = null;
  if (current) {
    try {
      await current.release();
    } catch {
      // ignore
    }
  }
  emit({
    status: 'idle',
    message: 'Model resources were released.',
  });
}
