import type { TonClient } from '@ton/ton';
import type { BlockchainGateway } from '@/core/application/ports/blockchain-gateway';
import type { RecipientBookPort } from '@/core/application/ports/recipient-book-port';
import type { WalletSessionVaultPort } from '@/core/application/ports/wallet-session-vault-port';
import { TransferBroadcastService } from '@/infrastructure/ton/transfer/transfer-broadcast-service';
import { TransferReviewService } from '@/infrastructure/ton/transfer/transfer-review-service';

interface TransferServiceDeps {
  getClient(): TonClient;
  recipientBook: RecipientBookPort;
  readGateway: BlockchainGateway;
  sessionVault: WalletSessionVaultPort;
}

export class TestnetTransferService {
  private readonly broadcastService: TransferBroadcastService;
  private readonly reviewService: TransferReviewService;

  constructor(deps: TransferServiceDeps) {
    this.broadcastService = new TransferBroadcastService(deps);
    this.reviewService = new TransferReviewService({
      readGateway: deps.readGateway,
      recipientBook: deps.recipientBook,
    });
  }

  broadcastTransfer(...args: Parameters<TransferBroadcastService['broadcastTransfer']>) {
    return this.broadcastService.broadcastTransfer(...args);
  }

  reviewTransfer(...args: Parameters<TransferReviewService['reviewTransfer']>) {
    return this.reviewService.reviewTransfer(...args);
  }

  waitForTransferConfirmation(
    ...args: Parameters<TransferBroadcastService['waitForTransferConfirmation']>
  ) {
    return this.broadcastService.waitForTransferConfirmation(...args);
  }
}
