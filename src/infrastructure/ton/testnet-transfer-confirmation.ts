import { TonClient } from '@ton/ton';
import type { BlockchainGateway } from '@/core/application/ports/blockchain-gateway';
import type { WalletSessionVaultPort } from '@/core/application/ports/wallet-session-vault-port';
import type { ActiveWalletSession } from '@/core/domain/wallet/active-wallet-session';
import { deriveWalletPublicKey, createWalletContract } from '@/infrastructure/ton/transfer/derive-wallet-contract';
import { isAbortError } from '@/shared/utils/is-abort-error';

const CONFIRMATION_POLL_INTERVAL_MS = 3_000;
const MAX_CONFIRMATION_ATTEMPTS = 10;

export interface TransferConfirmationInput {
  expectedSeqno: number;
  previousTopTransactionId: string | null;
  session: ActiveWalletSession;
  signal?: AbortSignal;
  walletPublicKey?: Uint8Array;
}

export async function waitForTransferConfirmation(
  client: TonClient,
  readGateway: BlockchainGateway,
  sessionVault: WalletSessionVaultPort,
  input: TransferConfirmationInput,
) {
  const publicKey =
    input.walletPublicKey ??
    (await readWalletPublicKey(sessionVault, input.session.sessionId));
  const wallet = createWalletContract(publicKey);
  const openedWallet = client.open(wallet);
  let lastError: Error | null = null;

  for (
    let attempt = 0;
    attempt < MAX_CONFIRMATION_ATTEMPTS;
    attempt += 1
  ) {
    throwIfAborted(input.signal);
    try {
      const state = await client.getContractState(wallet.address);
      const seqno =
        state.state === 'uninitialized'
          ? 0
          : await openedWallet.getSeqno();

      if (seqno >= input.expectedSeqno) {
        const transactions = await readGateway.getTransactions(
          input.session.meta.address,
          20,
          undefined,
          input.signal,
        );
        const confirmed = transactions.find((item) => {
          if (
            input.previousTopTransactionId &&
            item.id === input.previousTopTransactionId
          ) {
            return false;
          }

          return item.direction === 'outgoing';
        });

        if (confirmed) {
          return confirmed.id;
        }
        if (!input.previousTopTransactionId) {
          return transactions[0]?.id ?? null;
        }
      }
      lastError = null;
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }
      lastError =
        error instanceof Error
          ? error
          : new Error(
              'Transfer confirmation polling failed.',
            );
    }

    await sleep(
      CONFIRMATION_POLL_INTERVAL_MS,
      input.signal,
    );
  }

  if (lastError) {
    console.warn(
      'Transfer confirmation timed out after repeated TON polling errors.',
      lastError,
    );
  }

  return null;
}

async function readWalletPublicKey(
  sessionVault: WalletSessionVaultPort,
  sessionId: string,
) {
  const mnemonic = await sessionVault.read(sessionId);

  if (!mnemonic) {
    throw new Error(
      'Unlocked wallet secret is no longer available. Unlock the wallet again.',
    );
  }

  return deriveWalletPublicKey(mnemonic);
}

function sleep(durationMs: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve();
    }, durationMs);
    const handleAbort = () => {
      cleanup();
      reject(createAbortError());
    };
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener('abort', handleAbort);
    };

    signal?.addEventListener('abort', handleAbort, {
      once: true,
    });
  });
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

function createAbortError() {
  return new DOMException(
    'Request was cancelled.',
    'AbortError',
  );
}
