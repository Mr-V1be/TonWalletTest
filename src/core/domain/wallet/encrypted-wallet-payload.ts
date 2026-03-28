export interface LegacyEncryptedWalletPayload {
  cipherText: string;
  iv: string;
  kdfSalt: string;
  version: 1;
}

export interface EncryptedWalletPayloadV2 {
  algorithm: 'AES-GCM';
  cipherText: string;
  iv: string;
  kdf: {
    hash: 'SHA-256';
    iterations: number;
    name: 'PBKDF2';
    salt: string;
  };
  version: 2;
}

export type EncryptedWalletPayload =
  | LegacyEncryptedWalletPayload
  | EncryptedWalletPayloadV2;
