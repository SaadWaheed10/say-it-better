declare module 'whisper.rn' {
  export type TranscribeResult = {
    result: string;
    segments?: Array<{text: string; t0: number; t1: number}>;
    isAborted: boolean;
  };

  export type TranscribeOptions = {
    language?: string;
    maxThreads?: number;
    [key: string]: unknown;
  };

  export type TranscribeFileOptions = TranscribeOptions & {
    onProgress?: (progress: number) => void;
  };

  export type ContextOptions = {
    filePath: string | number;
    isBundleAsset?: boolean;
    useGpu?: boolean;
    useCoreMLIos?: boolean;
    useFlashAttn?: boolean;
  };

  export class WhisperContext {
    ptr: number;
    id: number;
    gpu: boolean;
    reasonNoGPU: string;
    transcribe(
      filePathOrBase64: string | number,
      options?: TranscribeFileOptions,
    ): {
      stop: () => Promise<void>;
      promise: Promise<TranscribeResult>;
    };
    release(): Promise<void>;
  }

  export function initWhisper(options: ContextOptions): Promise<WhisperContext>;
  export function releaseAllWhisper(): Promise<void>;
}
