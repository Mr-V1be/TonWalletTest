import { describe, expect, it } from 'vitest';
import {
  CorruptedWalletPayloadError,
  InvalidPasscodeError,
} from '@/core/domain/wallet/wallet-errors';
import { WebCryptoCipher } from '@/infrastructure/crypto/web-crypto-cipher';

describe('WebCryptoCipher', () => {
  it('encrypts and decrypts payload', async () => {
    const cipher = new WebCryptoCipher();
    const encrypted = await cipher.encrypt(
      'hello-ton',
      'pass123',
    );

    expect(encrypted.version).toBe(2);
    const decrypted = await cipher.decrypt(
      encrypted,
      'pass123',
    );

    expect(decrypted).toBe('hello-ton');
  });

  it('rejects incorrect passcode', async () => {
    const cipher = new WebCryptoCipher();
    const encrypted = await cipher.encrypt(
      'hello-ton',
      'pass123',
    );

    await expect(
      cipher.decrypt(encrypted, 'wrong-pass'),
    ).rejects.toBeInstanceOf(InvalidPasscodeError);
  });

  it('rejects corrupted payload structure', async () => {
    const cipher = new WebCryptoCipher();

    await expect(
      cipher.decrypt(
        {
          algorithm: 'AES-GCM',
          cipherText: '%%%bad',
          iv: 'iv',
          kdf: {
            hash: 'SHA-256',
            iterations: 250_000,
            name: 'PBKDF2',
            salt: 'salt',
          },
          version: 2,
        },
        'pass123',
      ),
    ).rejects.toBeInstanceOf(
      CorruptedWalletPayloadError,
    );
  });
});
