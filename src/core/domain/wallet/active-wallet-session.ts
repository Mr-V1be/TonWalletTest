import type { WalletMeta } from '@/core/domain/wallet/wallet-meta';

export interface ActiveWalletSession {
  meta: WalletMeta;
  sessionId: string;
}
