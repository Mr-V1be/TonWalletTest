import type { CipherPort } from '@/core/application/ports/cipher-port';
import type { EncryptedWalletPayload } from '@/core/domain/wallet/encrypted-wallet-payload';
import {
  CorruptedWalletPayloadError,
  InvalidPasscodeError,
} from '@/core/domain/wallet/wallet-errors';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const DEFAULT_KDF = {
  hash: 'SHA-256' as const,
  iterations: 250_000,
  name: 'PBKDF2' as const,
};

export class WebCryptoCipher implements CipherPort {
  async decrypt(
    payload: EncryptedWalletPayload,
    passcode: string,
  ): Promise<string> {
    try {
      const normalizedPayload =
        normalizePayload(payload);
      const key = await deriveKey(
        passcode,
        base64ToBytes(normalizedPayload.kdf.salt),
        normalizedPayload.kdf.iterations,
      );
      const decrypted = await crypto.subtle.decrypt(
        {
          name: normalizedPayload.algorithm,
          iv: toArrayBuffer(
            base64ToBytes(normalizedPayload.iv),
          ),
        },
        key,
        toArrayBuffer(
          base64ToBytes(normalizedPayload.cipherText),
        ),
      );

      return decoder.decode(decrypted);
    } catch (error) {
      if (isOperationError(error)) {
        throw new InvalidPasscodeError();
      }

      if (
        error instanceof CorruptedWalletPayloadError
      ) {
        throw error;
      }

      throw new CorruptedWalletPayloadError();
    }
  }

  async encrypt(
    plaintext: string,
    passcode: string,
  ): Promise<EncryptedWalletPayload> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const kdfSalt = crypto.getRandomValues(
      new Uint8Array(16),
    );
    const key = await deriveKey(
      passcode,
      kdfSalt,
      DEFAULT_KDF.iterations,
    );
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: toArrayBuffer(iv),
      },
      key,
      toArrayBuffer(encoder.encode(plaintext)),
    );

    return {
      algorithm: 'AES-GCM',
      cipherText: bytesToBase64(new Uint8Array(encrypted)),
      kdf: {
        ...DEFAULT_KDF,
        salt: bytesToBase64(kdfSalt),
      },
      iv: bytesToBase64(iv),
      version: 2,
    };
  }
}

async function deriveKey(
  passcode: string,
  salt: Uint8Array,
  iterations: number,
) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passcode),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

function normalizePayload(
  payload: EncryptedWalletPayload,
) {
  if (payload.version === 1) {
    return {
      algorithm: 'AES-GCM' as const,
      cipherText: payload.cipherText,
      iv: payload.iv,
      kdf: {
        ...DEFAULT_KDF,
        salt: payload.kdfSalt,
      },
    };
  }

  if (payload.kdf.iterations <= 0) {
    throw new CorruptedWalletPayloadError();
  }

  return payload;
}

function base64ToBytes(value: string) {
  let normalized = '';

  try {
    normalized = atob(value);
  } catch {
    throw new CorruptedWalletPayloadError();
  }

  return Uint8Array.from(normalized, (char) =>
    char.charCodeAt(0),
  );
}

function bytesToBase64(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) =>
    String.fromCharCode(byte),
  ).join('');

  return btoa(binary);
}

function toArrayBuffer(bytes: Uint8Array) {
  if (
    bytes.buffer instanceof ArrayBuffer &&
    bytes.byteOffset === 0 &&
    bytes.byteLength === bytes.buffer.byteLength
  ) {
    return bytes.buffer;
  }

  if (bytes.buffer instanceof ArrayBuffer) {
    return bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    );
  }

  return Uint8Array.from(bytes).buffer;
}

function isOperationError(error: unknown) {
  return error instanceof Error
    ? error.name === 'OperationError'
    : false;
}
