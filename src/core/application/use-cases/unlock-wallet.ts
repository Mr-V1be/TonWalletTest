import { z } from 'zod';
import type { CipherPort } from '@/core/application/ports/cipher-port';
import type { TonWalletPort } from '@/core/application/ports/ton-wallet-port';
import type { UnlockLockoutStore } from '@/core/application/ports/unlock-lockout-store';
import type { WalletSecretStore } from '@/core/application/ports/wallet-secret-store';
import { validatePasscode } from '@/core/application/use-cases/passcode-policy';
import type { UnlockedWalletSession } from '@/core/domain/wallet/unlocked-wallet-session';
import {
  CorruptedWalletPayloadError,
  InvalidPasscodeError,
} from '@/core/domain/wallet/wallet-errors';

const unlockedPayloadSchema = z.object({
  mnemonic: z.array(z.string().min(1)),
});

interface UnlockWalletDeps {
  cipher: CipherPort;
  lockoutStore: UnlockLockoutStore;
  secretStore: WalletSecretStore;
  tonWallet: TonWalletPort;
}

export function unlockWalletUseCase({
  cipher,
  lockoutStore,
  secretStore,
  tonWallet,
}: UnlockWalletDeps) {
  return async function unlockWallet(
    passcode: string,
  ): Promise<UnlockedWalletSession> {
    const storedWallet = await secretStore.loadEncrypted();

    if (!storedWallet) {
      throw new Error(
        'No encrypted wallet was found in this browser.',
      );
    }
    const lockoutStatus =
      await lockoutStore.getStatus();

    if (lockoutStatus.isLocked) {
      throw new Error(
        `Too many incorrect attempts. Try again in ${Math.ceil(lockoutStatus.retryAfterMs / 1000)}s.`,
      );
    }
    try {
      validatePasscode(passcode);
    } catch (error) {
      await lockoutStore.recordFailure();
      throw error;
    }

    let plaintext = '';

    try {
      plaintext = await cipher.decrypt(
        storedWallet.payload,
        passcode,
      );
    } catch (error) {
      if (error instanceof InvalidPasscodeError) {
        await lockoutStore.recordFailure();
      }

      throw error;
    }
    const parsed = unlockedPayloadSchema.safeParse(
      parsePlaintext(plaintext),
    );

    if (!parsed.success) {
      throw new CorruptedWalletPayloadError();
    }

    const derivedMeta = await tonWallet.createFromMnemonic(
      parsed.data.mnemonic,
    );

    if (derivedMeta.address !== storedWallet.meta.address) {
      throw new CorruptedWalletPayloadError();
    }

    await lockoutStore.reset();

    return {
      meta: storedWallet.meta,
      mnemonic: parsed.data.mnemonic,
    };
  };
}

function parsePlaintext(plaintext: string) {
  try {
    return JSON.parse(plaintext);
  } catch {
    throw new CorruptedWalletPayloadError();
  }
}
