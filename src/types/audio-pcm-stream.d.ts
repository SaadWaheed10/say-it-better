declare module '@fugood/react-native-audio-pcm-stream' {
  type LiveAudioStreamOptions = {
    sampleRate?: number;
    channels?: number;
    bitsPerSample?: number;
    audioSource?: number;
    bufferSize?: number;
    wavFile?: string;
  };

  type LiveAudioStreamModule = {
    init: (options: LiveAudioStreamOptions) => void;
    start: () => void;
    stop: () => Promise<void> | void;
    on: (event: 'data', listener: (data: string) => void) => void;
  };

  const LiveAudioStream: LiveAudioStreamModule;
  export default LiveAudioStream;
}
