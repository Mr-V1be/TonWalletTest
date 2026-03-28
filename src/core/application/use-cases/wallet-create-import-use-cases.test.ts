import { describe, expect, it, vi } from 'vitest';
import { createWalletUseCase } from '@/core/application/use-cases/create-wallet';
import { importWalletUseCase } from '@/core/application/use-cases/import-wallet';

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
      encrypt: vi.fn(),
    },
    secretStore: {
      saveEncrypted: vi.fn(),
    },
    tonWallet: {
      createFromMnemonic: vi.fn(),
      generateMnemonic: vi.fn(),
      normalizeMnemonic: vi.fn(),
      validateMnemonic: vi.fn(),
    },
  } satisfies Parameters<
    typeof createWalletUseCase
  >[0] &
    Parameters<typeof importWalletUseCase>[0];
}

describe('create/import wallet use cases', () => {
  it('creates wallet and saves encrypted payload', async () => {
    const deps = createDeps();

    deps.tonWallet.generateMnemonic.mockResolvedValue([
      'one',
      'two',
    ]);
    deps.tonWallet.createFromMnemonic.mockResolvedValue(meta);
    deps.cipher.encrypt.mockResolvedValue(payload);
    const run = createWalletUseCase(deps);

    const session = await run('  secret1234  ');

    expect(deps.cipher.encrypt).toHaveBeenCalledWith(
      JSON.stringify({ mnemonic: ['one', 'two'] }),
      '  secret1234  ',
    );
    expect(deps.secretStore.saveEncrypted).toHaveBeenCalledWith(
      payload,
      meta,
    );
    expect(session.meta).toEqual(meta);
    expect(session.mnemonic).toEqual(['one', 'two']);
  });

  it('rejects invalid passcode during create', async () => {
    const run = createWalletUseCase(createDeps());

    await expect(run('1234567')).rejects.toThrow(
      'Passcode must contain at least 8 characters.',
    );
  });

  it('imports wallet only when mnemonic is valid', async () => {
    const deps = createDeps();

    deps.tonWallet.normalizeMnemonic.mockReturnValue(
      Array.from({ length: 12 }, (_, index) => `word-${index}`),
    );
    deps.tonWallet.validateMnemonic.mockResolvedValue(true);
    deps.tonWallet.createFromMnemonic.mockResolvedValue(meta);
    deps.cipher.encrypt.mockResolvedValue(payload);
    const run = importWalletUseCase(deps);

    const session = await run(
      'seed words',
      ' pass1234 ',
    );

    expect(deps.tonWallet.validateMnemonic).toHaveBeenCalled();
    expect(deps.secretStore.saveEncrypted).toHaveBeenCalled();
    expect(session.meta.address).toBe(meta.address);
  });

  it('rejects invalid mnemonic during import', async () => {
    const deps = createDeps();

    deps.tonWallet.normalizeMnemonic.mockReturnValue(
      Array.from({ length: 12 }, (_, index) => `word-${index}`),
    );
    deps.tonWallet.validateMnemonic.mockResolvedValue(false);
    const run = importWalletUseCase(deps);

    await expect(
      run('seed words', 'pass1234'),
    ).rejects.toThrow(
      'Seed phrase is not valid.',
    );
  });
});
