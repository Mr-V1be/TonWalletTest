import type { CipherPort } from '@/core/application/ports/cipher-port';
import type { TonWalletPort } from '@/core/application/ports/ton-wallet-port';
import type { WalletSecretStore } from '@/core/application/ports/wallet-secret-store';
import { validatePasscode } from '@/core/application/use-cases/passcode-policy';
import type { UnlockedWalletSession } from '@/core/domain/wallet/unlocked-wallet-session';

interface PersistWalletDeps {
  cipher: CipherPort;
  secretStore: WalletSecretStore;
  tonWallet: TonWalletPort;
}

export async function persistWalletSession(
  deps: PersistWalletDeps,
  mnemonic: string[],
  passcode: string,
): Promise<UnlockedWalletSession> {
  validatePasscode(passcode);

  const meta = await deps.tonWallet.createFromMnemonic(
    mnemonic,
  );
  const payload = await deps.cipher.encrypt(
    JSON.stringify({ mnemonic }),
    passcode,
  );

  await deps.secretStore.saveEncrypted(payload, meta);

  return {
    meta,
    mnemonic,
  };
}
