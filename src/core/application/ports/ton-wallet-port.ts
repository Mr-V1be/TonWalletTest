import type { WalletMeta } from '@/core/domain/wallet/wallet-meta';

export interface TonWalletPort {
  createFromMnemonic(
    mnemonic: string[],
  ): Promise<WalletMeta>;
  generateMnemonic(words?: number): Promise<string[]>;
  normalizeMnemonic(input: string): string[];
  validateMnemonic(
    mnemonic: string[],
  ): Promise<boolean>;
}
