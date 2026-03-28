import { z } from 'zod';
import type { WalletMeta } from '@/core/domain/wallet/wallet-meta';
import type { WalletPersistence } from '@/core/domain/wallet/wallet-persistence';
import { CorruptedWalletRecordError } from '@/core/domain/wallet/wallet-errors';

const STORAGE_KEY = 'ton-wallet:record:v1';
let writeQueue: Promise<void> = Promise.resolve();

const encryptedPayloadSchema = z.union([
  z.object({
    cipherText: z.string().min(1),
    iv: z.string().min(1),
    kdfSalt: z.string().min(1),
    version: z.literal(1),
  }),
  z.object({
    algorithm: z.literal('AES-GCM'),
    cipherText: z.string().min(1),
    iv: z.string().min(1),
    kdf: z.object({
      hash: z.literal('SHA-256'),
      iterations: z.number().int().positive(),
      name: z.literal('PBKDF2'),
      salt: z.string().min(1),
    }),
    version: z.literal(2),
  }),
]);

const walletRecordSchema = z.object({
  encryptedPayload: encryptedPayloadSchema,
  meta: z.object({
    address: z.string().min(1),
    network: z.literal('testnet'),
    walletVersion: z.literal('v5r1'),
    createdAt: z.string().min(1),
  }),
  recentRecipients: z.array(z.string()),
  trustedAddresses: z.array(z.string()),
  txCache: z.array(
    z.object({
      amountTon: z.string(),
      comment: z.string().optional(),
      counterparty: z.string(),
      createdAt: z.string(),
      direction: z.enum(['incoming', 'outgoing']),
      id: z.string(),
      status: z.enum(['confirmed', 'pending', 'failed']),
    }),
  ),
  uiPreferences: z.object({
    hasSeenSeedWarning: z.boolean(),
    lastVisitedRoute: z.string().optional(),
  }),
});

export function readWalletBootstrapState(): {
  meta: WalletMeta | null;
  status: 'corrupted' | 'missing' | 'ready';
} {
  try {
    const record = readWalletRecordStrict();

    return {
      meta: record?.meta ?? null,
      status: record ? 'ready' : 'missing',
    };
  } catch {
    return {
      meta: null,
      status: 'corrupted',
    };
  }
}

export function readWalletRecordStrict() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return walletRecordSchema.parse(
      JSON.parse(rawValue),
    ) as WalletPersistence;
  } catch {
    throw new CorruptedWalletRecordError();
  }
}

export function replaceWalletRecord(
  record: WalletPersistence,
) {
  return queueWrite(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(record),
    );
  });
}

export function updateWalletRecord(
  updater: (
    record: WalletPersistence,
  ) => WalletPersistence,
) {
  return queueWrite(() => {
    const record = readWalletRecordStrict();

    if (!record) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updater(record)),
    );
  });
}

export function clearWalletRecord() {
  return queueWrite(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  });
}

function queueWrite(operation: () => void) {
  const pendingWrite = writeQueue.then(() => {
    if (typeof window === 'undefined') {
      return;
    }

    operation();
  });

  writeQueue = pendingWrite.catch((error) => {
    console.error(
      'Wallet record write failed.',
      error,
    );
  });

  return pendingWrite;
}
