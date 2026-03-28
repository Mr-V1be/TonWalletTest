import {
  mnemonicNew,
  mnemonicValidate,
} from '@ton/crypto';
import type { TonWalletPort } from '@/core/application/ports/ton-wallet-port';
import type { WalletMeta } from '@/core/domain/wallet/wallet-meta';
import { deriveWalletContract } from '@/infrastructure/ton/transfer/derive-wallet-contract';

export class TestnetWalletService
  implements TonWalletPort
{
  async createFromMnemonic(
    mnemonic: string[],
  ): Promise<WalletMeta> {
    const normalizedMnemonic =
      mnemonic.map(normalizeWord);
    const { keyPair, wallet } =
      await deriveWalletContract(
        normalizedMnemonic,
      );

    try {
      return {
        address: wallet.address.toString({
          bounceable: false,
          testOnly: true,
        }),
        createdAt: new Date().toISOString(),
        network: 'testnet',
        walletVersion: 'v5r1',
      };
    } finally {
      keyPair.secretKey.fill(0);
    }
  }

  generateMnemonic(words = 24) {
    return mnemonicNew(words);
  }

  normalizeMnemonic(input: string) {
    return input
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(normalizeWord);
  }

  validateMnemonic(mnemonic: string[]) {
    return mnemonicValidate(mnemonic.map(normalizeWord));
  }
}

function normalizeWord(word: string) {
  return word.trim().toLowerCase();
}
