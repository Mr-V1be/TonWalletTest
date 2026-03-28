import type { WalletSecretStore } from '@/core/application/ports/wallet-secret-store';
import type { WalletMeta } from '@/core/domain/wallet/wallet-meta';
import type { WalletPersistence } from '@/core/domain/wallet/wallet-persistence';
import {
  clearWalletRecord,
  readWalletBootstrapState,
  readWalletRecordStrict,
  replaceWalletRecord,
} from '@/infrastructure/storage/wallet-record-storage';

export class BrowserWalletStore
  implements WalletSecretStore
{
  async clear() {
    await clearWalletRecord();
  }

  async loadEncrypted() {
    const record = readWalletRecordStrict();

    if (!record) {
      return null;
    }

    return {
      payload: record.encryptedPayload,
      meta: record.meta,
    };
  }

  async saveEncrypted(
    payload: WalletPersistence['encryptedPayload'],
    meta: WalletMeta,
  ) {
    const nextRecord: WalletPersistence = {
      encryptedPayload: payload,
      meta,
      recentRecipients: [],
      trustedAddresses: [],
      txCache: [],
      uiPreferences: {
        hasSeenSeedWarning: false,
      },
    };

    await replaceWalletRecord(nextRecord);
  }
}

export function readStoredWalletBootstrapState() {
  return readWalletBootstrapState();
}
