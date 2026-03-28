import type { CipherPort } from '@/core/application/ports/cipher-port';
import type { TonWalletPort } from '@/core/application/ports/ton-wallet-port';
import type { WalletSecretStore } from '@/core/application/ports/wallet-secret-store';
import { persistWalletSession } from '@/core/application/use-cases/persist-wallet';
import type { UnlockedWalletSession } from '@/core/domain/wallet/unlocked-wallet-session';

interface CreateWalletDeps {
  cipher: CipherPort;
  secretStore: WalletSecretStore;
  tonWallet: TonWalletPort;
}

export function createWalletUseCase({
  cipher,
  secretStore,
  tonWallet,
}: CreateWalletDeps) {
  return async function createWallet(
    passcode: string,
  ): Promise<UnlockedWalletSession> {
    const mnemonic = await tonWallet.generateMnemonic(24);

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
