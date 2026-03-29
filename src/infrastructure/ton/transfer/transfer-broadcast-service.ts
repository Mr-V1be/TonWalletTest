import {
  SendMode,
  TonClient,
  internal,
  toNano,
} from '@ton/ton';
import type { BlockchainGateway } from '@/core/application/ports/blockchain-gateway';
import type { RecipientBookPort } from '@/core/application/ports/recipient-book-port';
import type { WalletSessionVaultPort } from '@/core/application/ports/wallet-session-vault-port';
import type { ActiveWalletSession } from '@/core/domain/wallet/active-wallet-session';
import { waitForTransferConfirmation } from '@/infrastructure/ton/testnet-transfer-confirmation';
import { deriveWalletContract } from '@/infrastructure/ton/transfer/derive-wallet-contract';
import {
  isToncenterRateLimitError,
  retryOnToncenterRateLimit,
} from '@/shared/lib/toncenter-rate-limit';
import type { TransferReview } from '@/shared/lib/transfer-review';

interface TransferBroadcastDeps {
  getClient(): TonClient;
  readGateway: BlockchainGateway;
  recipientBook: RecipientBookPort;
  sessionVault: WalletSessionVaultPort;
}

export class TransferBroadcastService {
  constructor(private readonly deps: TransferBroadcastDeps) {}

  async broadcastTransfer(
    session: ActiveWalletSession,
    review: TransferReview,
  ) {
    if (!review.normalizedAddress || !review.amountTon) {
      throw new Error('Transfer review is incomplete.');
    }
    const mnemonic = await this.deps.sessionVault.read(session.sessionId);

    if (!mnemonic) {
      throw new Error(
        'Unlocked wallet secret is no longer available. Unlock the wallet again.',
      );
    }

    const previousTopTransaction =
      await this.readPreviousTopTransaction(
        session.meta.address,
      );
    const recipientAddress = review.normalizedAddress;
    const amountTon = review.amountTon;
    const { keyPair, wallet } = await deriveWalletContract(mnemonic);

    try {
      const client = this.deps.getClient();
      const openedWallet = client.open(wallet);
      const state = await retryOnToncenterRateLimit(() =>
        client.getContractState(wallet.address),
      );
      const seqno =
        state.state === 'uninitialized'
          ? 0
          : await retryOnToncenterRateLimit(() =>
              openedWallet.getSeqno(),
            );

      await retryOnToncenterRateLimit(() =>
        openedWallet.sendTransfer({
          messages: [
            internal({
              bounce: review.bounce,
              to: recipientAddress,
              value: toNano(amountTon),
            }),
          ],
          secretKey: keyPair.secretKey,
          sendMode: SendMode.PAY_GAS_SEPARATELY,
          seqno,
        }),
      );
      await this.deps.recipientBook.appendRecentRecipient(
        recipientAddress,
      );

      return {
        expectedSeqno: seqno + 1,
        previousTopTransactionId:
          previousTopTransaction[0]?.id ?? null,
        walletPublicKey: Uint8Array.from(keyPair.publicKey),
      };
    } finally {
      keyPair.secretKey.fill(0);
    }
  }

  private async readPreviousTopTransaction(
    address: string,
  ) {
    try {
      return await this.deps.readGateway.getTransactions(
        address,
        1,
      );
    } catch (error) {
      if (isToncenterRateLimitError(error)) {
        return [];
      }

      throw error;
    }
  }

  async waitForTransferConfirmation(input: {
    expectedSeqno: number;
    previousTopTransactionId: string | null;
    session: ActiveWalletSession;
    signal?: AbortSignal;
    walletPublicKey?: Uint8Array;
  }) {
    return waitForTransferConfirmation(
      this.deps.getClient(),
      this.deps.readGateway,
      this.deps.sessionVault,
      input,
    );
  }
}
