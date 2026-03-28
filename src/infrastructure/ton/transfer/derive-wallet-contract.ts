import { Buffer } from 'buffer';
import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';
import { testnetWalletId } from '@/infrastructure/ton/testnet-wallet-id';

export function createWalletContract(
  publicKey: Uint8Array,
) {
  return WalletContractV5R1.create({
    publicKey: Buffer.from(publicKey),
    walletId: testnetWalletId,
  });
}

export async function deriveWalletContract(
  mnemonic: string[],
) {
  const keyPair = await mnemonicToWalletKey(mnemonic);

  return {
    keyPair,
    wallet: createWalletContract(keyPair.publicKey),
  };
}

export async function deriveWalletPublicKey(
  mnemonic: string[],
) {
  const keyPair = await mnemonicToWalletKey(mnemonic);

  try {
    return Uint8Array.from(keyPair.publicKey);
  } finally {
    keyPair.secretKey.fill(0);
  }
}
