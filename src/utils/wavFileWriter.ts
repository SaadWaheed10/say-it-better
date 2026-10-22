export type WavFileConfig = {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
};

export type WavFileWriterFs = {
  writeFile: (
    filePath: string,
    data: string,
    encoding: string,
  ) => Promise<void>;
  appendFile: (
    filePath: string,
    data: string,
    encoding: string,
  ) => Promise<void>;
  readFile: (filePath: string, encoding: string) => Promise<string>;
  exists: (filePath: string) => Promise<boolean>;
  unlink: (filePath: string) => Promise<void>;
};

type Base64Globals = {
  btoa: (data: string) => string;
  atob: (data: string) => string;
};

const base64Globals = globalThis as typeof globalThis & Base64Globals;

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return base64Globals.btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = base64Globals.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Minimal WAV writer for 16-bit PCM streams (used by on-device Whisper).
 */
export class WavFileWriter {
  private dataSize = 0;
  private isWriting = false;
  private writeQueue: Uint8Array[] = [];

  constructor(
    private fs: WavFileWriterFs,
    private filePath: string,
    private config: WavFileConfig,
  ) {}

  async initialize(): Promise<void> {
    if (this.isWriting) {
      return;
    }
    const header = this.createWavHeader(0);
    await this.fs.writeFile(
      this.filePath,
      uint8ArrayToBase64(header),
      'base64',
    );
    this.dataSize = 0;
    this.isWriting = true;
    this.writeQueue = [];
  }

  async appendAudioData(audioData: Uint8Array): Promise<void> {
    if (!this.isWriting) {
      throw new Error('WAV file not initialized');
    }
    this.writeQueue.push(audioData);
    await this.processWriteQueue();
  }

  private async processWriteQueue(): Promise<void> {
    if (this.writeQueue.length === 0) {
      return;
    }
    const totalLength = this.writeQueue.reduce(
      (sum, data) => sum + data.length,
      0,
    );
    const combinedData = new Uint8Array(totalLength);
    let offset = 0;
    this.writeQueue.forEach(data => {
      combinedData.set(data, offset);
      offset += data.length;
    });
    await this.fs.appendFile(
      this.filePath,
      uint8ArrayToBase64(combinedData),
      'base64',
    );
    this.dataSize += combinedData.length;
    this.writeQueue = [];
  }

  async finalize(): Promise<void> {
    if (!this.isWriting) {
      return;
    }
    await this.processWriteQueue();
    const currentData = await this.fs.readFile(this.filePath, 'base64');
    const currentBytes = base64ToUint8Array(currentData);
    const correctHeader = this.createWavHeader(this.dataSize);
    const finalData = new Uint8Array(correctHeader.length + this.dataSize);
    finalData.set(correctHeader, 0);
    finalData.set(currentBytes.slice(44), 44);
    await this.fs.writeFile(
      this.filePath,
      uint8ArrayToBase64(finalData),
      'base64',
    );
    this.isWriting = false;
  }

  async cancel(): Promise<void> {
    this.isWriting = false;
    this.writeQueue = [];
    try {
      if (await this.fs.exists(this.filePath)) {
        await this.fs.unlink(this.filePath);
      }
    } catch {
      // ignore
    }
  }

  private createWavHeader(dataSize: number): Uint8Array {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    view.setUint32(0, 0x52494646, false); // RIFF
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // WAVE
    view.setUint32(12, 0x666d7420, false); // fmt
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, this.config.channels, true);
    view.setUint32(24, this.config.sampleRate, true);
    view.setUint32(
      28,
      this.config.sampleRate *
        this.config.channels *
        (this.config.bitsPerSample / 8),
      true,
    );
    view.setUint16(
      32,
      this.config.channels * (this.config.bitsPerSample / 8),
      true,
    );
    view.setUint16(34, this.config.bitsPerSample, true);
    view.setUint32(36, 0x64617461, false); // data
    view.setUint32(40, dataSize, true);
    return new Uint8Array(header);
  }
}

export {base64ToUint8Array};
