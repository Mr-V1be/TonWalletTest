import { Address, toNano } from '@ton/ton';
import type { BlockchainGateway } from '@/core/application/ports/blockchain-gateway';
import type { RecipientBookPort } from '@/core/application/ports/recipient-book-port';
import {
  buildKnownAddressSet,
  createWarning,
  looksSimilar,
  normalizeAmount,
  parseRecipient,
  requiredReserveNano,
  type TransferReview,
} from '@/shared/lib/transfer-review';

interface TransferReviewDeps {
  readGateway: BlockchainGateway;
  recipientBook: RecipientBookPort;
}

export class TransferReviewService {
  constructor(private readonly deps: TransferReviewDeps) {}

  async reviewTransfer(input: {
    amountInput: string;
    recipientInput: string;
    senderAddress: string;
    signal?: AbortSignal;
  }): Promise<TransferReview> {
    const recipientResult = parseRecipient(input.recipientInput);
    const senderAddress = Address.parse(input.senderAddress).toString({
      bounceable: false,
      testOnly: true,
    });
    const amountResult = normalizeAmount(input.amountInput);
    const blockingErrors = [
      ...recipientResult.blockingErrors,
      ...amountResult.blockingErrors,
    ];
    const warnings = [...recipientResult.warnings];
    const senderSnapshotPromise =
      this.deps.readGateway.getWalletSnapshot(
        senderAddress,
        input.signal,
      );

    if (!recipientResult.recipient?.canonical) {
      const senderSnapshot = await senderSnapshotPromise;
      appendReserveError(
        blockingErrors,
        senderSnapshot.balanceNano,
        amountResult.amountTon,
      );
      return buildReview(
        amountResult.amountTon,
        blockingErrors,
        true,
        null,
        warnings,
      );
    }

    const recipientAddress = recipientResult.recipient.canonical;
    const [senderSnapshot, bookSnapshot, recipientSnapshot] =
      await Promise.all([
        senderSnapshotPromise,
        this.deps.recipientBook.readSnapshot(),
        this.deps.readGateway.getWalletSnapshot(
          recipientAddress,
          input.signal,
        ),
      ]);
    const knownAddressSet = buildKnownAddressSet(bookSnapshot);
    appendReserveError(
      blockingErrors,
      senderSnapshot.balanceNano,
      amountResult.amountTon,
    );

    if (recipientAddress === senderAddress) {
      warnings.push(createWarning('self-send'));
    }
    if (!knownAddressSet.has(recipientAddress)) {
      warnings.push(createWarning('new-address'));
    }
    if (hasSimilarAddress(knownAddressSet, recipientAddress)) {
      warnings.push(createWarning('similar-address'));
    }
    if (recipientSnapshot.status !== 'active') {
      warnings.push(createWarning('uninitialized-recipient'));
    }

    return buildReview(
      amountResult.amountTon,
      blockingErrors,
      recipientSnapshot.status === 'active',
      recipientAddress,
      warnings,
    );
  }
}

function buildReview(
  amountTon: string | null,
  blockingErrors: string[],
  bounce: boolean,
  normalizedAddress: string | null,
  warnings: TransferReview['warnings'],
): TransferReview {
  return {
    amountTon,
    blockingErrors: Array.from(new Set(blockingErrors)),
    bounce,
    normalizedAddress,
    warnings,
  };
}

function appendReserveError(
  blockingErrors: string[],
  balanceNano: string,
  amountTon: string | null,
) {
  if (!amountTon) {
    return;
  }
  if (BigInt(balanceNano) - toNano(amountTon) < requiredReserveNano()) {
    blockingErrors.push(
      'Insufficient balance after the required 0.05 TON reserve.',
    );
  }
}

function hasSimilarAddress(
  knownAddresses: Set<string>,
  recipientAddress: string,
) {
  for (const address of knownAddresses) {
    if (looksSimilar(address, recipientAddress)) {
      return true;
    }
  }

  return false;
}
