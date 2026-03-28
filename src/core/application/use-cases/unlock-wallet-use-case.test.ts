import { describe, expect, it, vi } from 'vitest';
import { unlockWalletUseCase } from '@/core/application/use-cases/unlock-wallet';
import {
  CorruptedWalletPayloadError,
  InvalidPasscodeError,
} from '@/core/domain/wallet/wallet-errors';

const meta = {
  address: '0QTESTADDRESS',
  createdAt: '2026-03-27T00:00:00.000Z',
  network: 'testnet' as const,
  walletVersion: 'v5r1' as const,
};

const payload = {
  algorithm: 'AES-GCM' as const,
  cipherText: 'cipher',
  iv: 'iv',
  kdf: {
    hash: 'SHA-256' as const,
    iterations: 250_000,
    name: 'PBKDF2' as const,
    salt: 'salt',
  },
  version: 2 as const,
};

function createDeps() {
  return {
    cipher: {
      decrypt: vi.fn(),
    },
    lockoutStore: {
      getStatus: vi.fn(),
      recordFailure: vi.fn(),
      reset: vi.fn(),
    },
    secretStore: {
      loadEncrypted: vi.fn(),
    },
    tonWallet: {
      createFromMnemonic: vi.fn(),
    },
  } satisfies Parameters<
    typeof unlockWalletUseCase
  >[0];
}

describe('unlock wallet use case', () => {
  it('unlocks wallet only when stored payload matches derived address', async () => {
    const deps = createDeps();

    deps.lockoutStore.getStatus.mockResolvedValue({
      isLocked: false,
      retryAfterMs: 0,
    });
    deps.secretStore.loadEncrypted.mockResolvedValue({
      meta,
      payload,
    });
    deps.cipher.decrypt.mockResolvedValue(
      JSON.stringify({ mnemonic: ['one', 'two'] }),
    );
    deps.tonWallet.createFromMnemonic.mockResolvedValue(meta);
    const run = unlockWalletUseCase(deps);

    const session = await run('pass1234');

    expect(session).toEqual({
      meta,
      mnemonic: ['one', 'two'],
    });
    expect(deps.lockoutStore.reset).toHaveBeenCalled();
  });

  it('throws corruption error when decrypted data is malformed', async () => {
    const deps = createDeps();

    deps.lockoutStore.getStatus.mockResolvedValue({
      isLocked: false,
      retryAfterMs: 0,
    });
    deps.secretStore.loadEncrypted.mockResolvedValue({
      meta,
      payload,
    });
    deps.cipher.decrypt.mockResolvedValue('{broken-json');
    const run = unlockWalletUseCase(deps);

    await expect(run('pass1234')).rejects.toBeInstanceOf(
      CorruptedWalletPayloadError,
    );
  });

  it('throws corruption error when derived address mismatches stored meta', async () => {
    const deps = createDeps();

    deps.lockoutStore.getStatus.mockResolvedValue({
      isLocked: false,
      retryAfterMs: 0,
    });
    deps.secretStore.loadEncrypted.mockResolvedValue({
      meta,
      payload,
    });
    deps.cipher.decrypt.mockResolvedValue(
      JSON.stringify({ mnemonic: ['one', 'two'] }),
    );
    deps.tonWallet.createFromMnemonic.mockResolvedValue({
      ...meta,
      address: '0QOTHER',
    });
    const run = unlockWalletUseCase(deps);

    await expect(run('pass1234')).rejects.toBeInstanceOf(
      CorruptedWalletPayloadError,
    );
  });

  it('records failed unlock attempts after bad passcode', async () => {
    const deps = createDeps();

    deps.lockoutStore.getStatus.mockResolvedValue({
      isLocked: false,
      retryAfterMs: 0,
    });
    deps.secretStore.loadEncrypted.mockResolvedValue({
      meta,
      payload,
    });
    deps.cipher.decrypt.mockRejectedValue(
      new InvalidPasscodeError(),
    );
    const run = unlockWalletUseCase(deps);

    await expect(run('pass1234')).rejects.toBeInstanceOf(
      InvalidPasscodeError,
    );
    expect(
      deps.lockoutStore.recordFailure,
    ).toHaveBeenCalled();
  });

  it('blocks unlock while lockout window is active', async () => {
    const deps = createDeps();

    deps.secretStore.loadEncrypted.mockResolvedValue({
      meta,
      payload,
    });
    deps.lockoutStore.getStatus.mockResolvedValue({
      isLocked: true,
      retryAfterMs: 4_000,
    });
    const run = unlockWalletUseCase(deps);

    await expect(run('pass1234')).rejects.toThrow(
      'Too many incorrect attempts. Try again in 4s.',
    );
    expect(deps.cipher.decrypt).not.toHaveBeenCalled();
  });

  it('checks lockout before validating a short passcode', async () => {
    const deps = createDeps();

    deps.secretStore.loadEncrypted.mockResolvedValue({ meta, payload });
    deps.lockoutStore.getStatus.mockResolvedValue({
      isLocked: true,
      retryAfterMs: 4_000,
    });
    const run = unlockWalletUseCase(deps);

    await expect(run('short')).rejects.toThrow(
      'Too many incorrect attempts. Try again in 4s.',
    );
    expect(deps.lockoutStore.recordFailure).not.toHaveBeenCalled();
  });

  it('records failure when passcode format is invalid', async () => {
    const deps = createDeps();

    deps.secretStore.loadEncrypted.mockResolvedValue({ meta, payload });
    deps.lockoutStore.getStatus.mockResolvedValue({
      isLocked: false,
      retryAfterMs: 0,
    });
    const run = unlockWalletUseCase(deps);

    await expect(run('short')).rejects.toThrow(
      'Passcode must contain at least 8 characters.',
    );
    expect(deps.lockoutStore.recordFailure).toHaveBeenCalled();
    expect(deps.cipher.decrypt).not.toHaveBeenCalled();
  });
});
