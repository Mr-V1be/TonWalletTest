import type { EncryptedWalletPayload } from '@/core/domain/wallet/encrypted-wallet-payload';
import type { WalletMeta } from '@/core/domain/wallet/wallet-meta';

export interface WalletSecretStore {
  saveEncrypted(
    payload: EncryptedWalletPayload,
    meta: WalletMeta,
  ): Promise<void>;
  loadEncrypted(): Promise<{
    payload: EncryptedWalletPayload;
    meta: WalletMeta;
  } | null>;
  clear(): Promise<void>;
}
