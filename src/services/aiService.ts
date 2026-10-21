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
  getStoredModelPathOverride,
  toFileUri,
} from './modelPath';

const STOP_WORDS = [
  '</s>',
  '<|end|>',
  '<|eot_id|>',
  '<|end_of_text|>',
  '<|im_end|>',
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

function buildSystemPrompt(tone: ToneId, instruction?: string): string {
  const extra = instruction?.trim()
    ? `\nAdditional instruction from the user: ${instruction.trim()}`
    : '';

  return [
    'You are SayItBetter, an on-device writing assistant.',
    'Rewrite the user message with these rules:',
    '- Preserve the original meaning and intent.',
    '- Correct grammar and spelling.',
    `- Apply a ${toneLabel(tone)} tone.`,
    '- Do not invent facts, promises, or commitments.',
    '- Keep the rewrite natural and concise.',
    '- Return ONLY the rewritten message text.',
    '- Do not add quotes, labels, markdown, or explanations.',
    extra,
  ]
    .filter(Boolean)
    .join('\n');
}

function cleanModelOutput(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '');
  cleaned = cleaned.replace(/^(improved|rewrite|rewritten|output)\s*:\s*/i, '');
  cleaned = cleaned.replace(/<\/?s>/gi, '').trim();
  return cleaned;
}

async function resolveExistingModelPath(): Promise<string | null> {
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
        return candidate;
      }
    } catch {
      // continue
    }
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

    const modelPath = await resolveExistingModelPath();

    if (!modelPath) {
      emit({
        status: 'missing',
        message: 'Local model file not found.',
        detail:
          'Copy SmolLM2-360M-Instruct.Q4_K_M.gguf into the app Documents folder. See docs/MODEL_SETUP.md.',
      });
      return;
    }

    emit({
      status: 'loading',
      message: 'Loading on-device model…',
      path: modelPath,
    });

    try {
      const nextContext = await initLlama({
        model: toFileUri(modelPath),
        n_ctx: 2048,
        n_gpu_layers: Platform.OS === 'ios' ? 99 : 0,
        use_mlock: true,
      });

      context = nextContext;
      emit({
        status: 'ready',
        message: 'On-device model is ready for offline rewriting.',
        path: modelPath,
      });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : 'Unknown model load error';
      context = null;
      emit({
        status: 'error',
        message: 'Could not initialize the local model.',
        detail,
        path: modelPath,
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
  const systemPrompt = buildSystemPrompt(input.tone, input.instruction);

  try {
    const result = await context.completion({
      messages: [
        {role: 'system', content: systemPrompt},
        {role: 'user', content: message},
      ],
      n_predict: 256,
      temperature: 0.5,
      top_p: 0.9,
      stop: STOP_WORDS,
    });

    if (requestId !== activeRequestId) {
      throw new Error('Request was cancelled.');
    }

    const improved = cleanModelOutput(result.text || '');
    if (!improved) {
      throw new Error(
        'The model returned an empty response. Please try again.',
      );
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
