import type { CipherPort } from '@/core/application/ports/cipher-port';
import type { TonWalletPort } from '@/core/application/ports/ton-wallet-port';
import type { WalletSecretStore } from '@/core/application/ports/wallet-secret-store';
import { persistWalletSession } from '@/core/application/use-cases/persist-wallet';
import type { UnlockedWalletSession } from '@/core/domain/wallet/unlocked-wallet-session';

interface ImportWalletDeps {
  cipher: CipherPort;
  secretStore: WalletSecretStore;
  tonWallet: TonWalletPort;
}

export function importWalletUseCase({
  cipher,
  secretStore,
  tonWallet,
}: ImportWalletDeps) {
  return async function importWallet(
    input: string,
    passcode: string,
  ): Promise<UnlockedWalletSession> {
    const mnemonic = tonWallet.normalizeMnemonic(input);

    if (mnemonic.length !== 12 && mnemonic.length !== 24) {
      throw new Error(
        'Seed phrase must contain 12 or 24 words.',
      );
    }

    const isValid = await tonWallet.validateMnemonic(
      mnemonic,
    );

    if (!isValid) {
      throw new Error('Seed phrase is not valid.');
    }

    return persistWalletSession(
      {
        cipher,
        secretStore,
        tonWallet,
      },
      mnemonic,
      passcode,
    );
  };
}
