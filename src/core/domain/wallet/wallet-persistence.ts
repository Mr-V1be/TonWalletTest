import type { TransactionRecord } from '@/core/domain/transaction/transaction-record';
import type { EncryptedWalletPayload } from '@/core/domain/wallet/encrypted-wallet-payload';
import type { WalletMeta } from '@/core/domain/wallet/wallet-meta';

export interface WalletUiPreferences {
  hasSeenSeedWarning: boolean;
  lastVisitedRoute?: string;
}

export interface WalletPersistence {
  encryptedPayload: EncryptedWalletPayload;
  meta: WalletMeta;
  recentRecipients: string[];
  trustedAddresses: string[];
  txCache: TransactionRecord[];
  uiPreferences: WalletUiPreferences;
}
