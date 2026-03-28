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
import type { TransferReview } from '@/shared/lib/transfer-review';

interface TransferBroadcastDeps {
  client: TonClient;
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

    const previousTopTransaction = await this.deps.readGateway.getTransactions(
      session.meta.address,
      1,
    );
    const { keyPair, wallet } = await deriveWalletContract(mnemonic);

    try {
      const openedWallet = this.deps.client.open(wallet);
      const state = await this.deps.client.getContractState(wallet.address);
      const seqno =
        state.state === 'uninitialized'
          ? 0
          : await openedWallet.getSeqno();

      await openedWallet.sendTransfer({
        messages: [
          internal({
            bounce: review.bounce,
            to: review.normalizedAddress,
            value: toNano(review.amountTon),
          }),
        ],
        secretKey: keyPair.secretKey,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        seqno,
      });
      await this.deps.recipientBook.appendRecentRecipient(
        review.normalizedAddress,
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

  async waitForTransferConfirmation(input: {
    expectedSeqno: number;
    previousTopTransactionId: string | null;
    session: ActiveWalletSession;
    signal?: AbortSignal;
    walletPublicKey?: Uint8Array;
  }) {
    return waitForTransferConfirmation(
      this.deps.client,
      this.deps.readGateway,
      this.deps.sessionVault,
      input,
    );
  }
}
