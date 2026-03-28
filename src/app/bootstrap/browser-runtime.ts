import { Buffer } from 'buffer';

declare global {
  interface Window {
    Buffer?: typeof Buffer;
    global?: typeof globalThis;
  }
}

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

if (!globalThis.global) {
  globalThis.global = globalThis;
}
