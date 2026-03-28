import { describe, expect, it } from 'vitest';
import { CorruptedWalletRecordError } from '@/core/domain/wallet/wallet-errors';
import {
  BrowserWalletStore,
  readStoredWalletBootstrapState,
} from '@/infrastructure/storage/browser-wallet-store';

const store = new BrowserWalletStore();
const meta = {
  address: '0QTESTADDRESS',
  createdAt: '2026-03-27T00:00:00.000Z',
  network: 'testnet' as const,
  walletVersion: 'v5r1' as const,
};

describe('BrowserWalletStore', () => {
  it('reports ready bootstrap state for a valid record', async () => {
    window.localStorage.clear();
    await store.saveEncrypted(
      {
        algorithm: 'AES-GCM',
        cipherText: 'cipher',
        iv: 'iv',
        kdf: {
          hash: 'SHA-256',
          iterations: 250_000,
          name: 'PBKDF2',
          salt: 'salt',
        },
        version: 2,
      },
      meta,
    );

    expect(readStoredWalletBootstrapState()).toEqual({
      meta,
      status: 'ready',
    });
  });

  it('surfaces corrupted storage explicitly', async () => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'ton-wallet:record:v1',
      '{bad-json',
    );

    expect(readStoredWalletBootstrapState()).toEqual({
      meta: null,
      status: 'corrupted',
    });
    await expect(store.loadEncrypted()).rejects.toBeInstanceOf(
      CorruptedWalletRecordError,
    );
  });
});
