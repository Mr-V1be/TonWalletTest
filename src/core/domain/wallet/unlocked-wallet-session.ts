import type { WalletMeta } from '@/core/domain/wallet/wallet-meta';

export interface UnlockedWalletSession {
  meta: WalletMeta;
  mnemonic: string[];
}
