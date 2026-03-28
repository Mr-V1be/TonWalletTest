import type { EncryptedWalletPayload } from '@/core/domain/wallet/encrypted-wallet-payload';

export interface CipherPort {
  decrypt(
    payload: EncryptedWalletPayload,
    passcode: string,
  ): Promise<string>;
  encrypt(
    plaintext: string,
    passcode: string,
  ): Promise<EncryptedWalletPayload>;
}
