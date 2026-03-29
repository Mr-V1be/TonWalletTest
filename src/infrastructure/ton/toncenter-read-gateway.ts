import { Address, fromNano } from '@ton/ton';
import { z } from 'zod';
import type { BlockchainGateway } from '@/core/application/ports/blockchain-gateway';
import type { TransactionRecord } from '@/core/domain/transaction/transaction-record';
import type { WalletSnapshot } from '@/core/domain/wallet/wallet-snapshot';
import {
  buildToncenterHeaders,
  toncenterConfig,
} from '@/shared/config/toncenter-config';
import { fetchJsonWithSchema } from '@/shared/lib/fetch-json-with-schema';
import {
  toncenterTransactionsResponseSchema,
  toncenterWalletStatesResponseSchema,
  type ToncenterMessage,
  type ToncenterTransaction,
  type TransactionsResponse,
  type WalletStatesResponse,
} from '@/shared/lib/toncenter-response-schemas';

const decodedCommentSchema = z.union([
  z.object({ comment: z.string() }),
  z.object({ text: z.string() }),
  z.object({
    payload: z.object({ text: z.string() }),
  }),
]);

export class ToncenterReadGateway
  implements BlockchainGateway
{
  async getBalance(
    address: string,
    signal?: AbortSignal,
  ) {
    const snapshot = await this.getWalletSnapshot(
      address,
      signal,
    );

    return snapshot.balanceTon;
  }

  async getTransactions(
    address: string,
    limit: number,
    offset = 0,
    signal?: AbortSignal,
  ): Promise<TransactionRecord[]> {
    const normalizedOffset = Math.max(0, offset);
    const params = new URLSearchParams({
      account: address,
      limit: String(limit),
      offset: String(normalizedOffset),
      sort: 'desc',
    });
    const response =
      await fetchJsonWithSchema<TransactionsResponse>({
        headers: buildToncenterHeaders(),
        input: `${toncenterConfig.v3Endpoint}/transactions?${params}`,
        label: 'TON Center',
        schema: toncenterTransactionsResponseSchema,
        signal,
      });

    return mapToncenterTransactions(
      response.transactions ?? [],
      address,
    );
  }

  async getWalletSnapshot(
    address: string,
    signal?: AbortSignal,
  ): Promise<WalletSnapshot> {
    const params = new URLSearchParams({
      address,
    });
    const response =
      await fetchJsonWithSchema<WalletStatesResponse>({
        headers: buildToncenterHeaders(),
        input: `${toncenterConfig.v3Endpoint}/walletStates?${params}`,
        label: 'TON Center',
        schema: toncenterWalletStatesResponseSchema,
        signal,
      });
    const walletState = response.wallets?.[0];

    if (!walletState) {
      return {
        balanceNano: '0',
        balanceTon: '0',
        isWallet: false,
        status: 'nonexist',
      };
    }

    return {
      balanceNano: walletState.balance,
      balanceTon: fromNano(walletState.balance),
      isWallet: walletState.is_wallet,
      status: walletState.status,
    };
  }
}

export function mapToncenterTransactions(
  transactions: ToncenterTransaction[],
  accountAddress: string,
): TransactionRecord[] {
  const accountRawAddress =
    normalizeRawAddress(accountAddress) ??
    accountAddress;

  return transactions.flatMap((transaction) =>
    mapTransaction(transaction, accountRawAddress),
  );
}

function mapTransaction(
  transaction: ToncenterTransaction,
  accountAddress: string,
): TransactionRecord[] {
  const createdAt = new Date(
    transaction.now * 1000,
  ).toISOString();
  const incomingMessage = transaction.in_msg ?? null;
  const records: TransactionRecord[] = [];
  const outgoingMessages =
    transaction.out_msgs?.filter((message) =>
      isOutgoingMessage(message, accountAddress),
    ) ?? [];

  if (
    incomingMessage &&
    isIncomingMessage(incomingMessage, accountAddress)
  ) {
    records.push({
      id: `${transaction.hash}:incoming`,
      direction: 'incoming',
      amountTon: fromNano(incomingMessage.value ?? '0'),
      comment: readComment(incomingMessage),
      counterparty: formatCounterparty(
        incomingMessage.source,
      ),
      createdAt,
      status: resolveIncomingStatus(incomingMessage),
    });
  }

  outgoingMessages.forEach((message, index) => {
    records.push({
      id: `${transaction.hash}:outgoing:${index}`,
      direction: 'outgoing',
      amountTon: fromNano(message.value ?? '0'),
      comment: readComment(message),
      counterparty: formatCounterparty(
        message.destination,
      ),
      createdAt,
      status: transaction.description?.aborted
        ? 'failed'
        : 'confirmed',
    });
  });

  if (records.length > 0) {
    return records;
  }

  return [mapFallbackTransaction(transaction, accountAddress)];
}

function readComment(message?: ToncenterMessage | null) {
  const parsed = decodedCommentSchema.safeParse(
    message?.message_content?.decoded,
  );

  if (!parsed.success) {
    return undefined;
  }

  if ('comment' in parsed.data) {
    return parsed.data.comment;
  }

  if ('text' in parsed.data) {
    return parsed.data.text;
  }

  if ('payload' in parsed.data) {
    return parsed.data.payload.text;
  }

  return undefined;
}

function mapFallbackTransaction(
  transaction: ToncenterTransaction,
  accountAddress: string,
): TransactionRecord {
  const isIncoming = isIncomingMessage(
    transaction.in_msg,
    accountAddress,
  );
  const primaryOutMessage =
    transaction.out_msgs?.find(
      (message) => message.destination,
    ) ?? null;
  const counterparty = isIncoming
    ? transaction.in_msg?.source
    : primaryOutMessage?.destination;
  const amountNano = isIncoming
    ? transaction.in_msg?.value
    : primaryOutMessage?.value;

  return {
    id: transaction.hash,
    direction: isIncoming ? 'incoming' : 'outgoing',
    amountTon: fromNano(amountNano ?? '0'),
    comment: isIncoming
      ? readComment(transaction.in_msg)
      : readComment(primaryOutMessage),
    counterparty: formatCounterparty(counterparty),
    createdAt: new Date(transaction.now * 1000).toISOString(),
    status:
      isIncoming && hasPositiveValue(amountNano)
        ? 'confirmed'
        : transaction.description?.aborted
          ? 'failed'
          : 'confirmed',
  };
}

function formatCounterparty(
  address?: string | null,
) {
  if (!address) {
    return 'Unknown';
  }

  try {
    return Address.parse(address).toString({
      bounceable: false,
      testOnly: true,
    });
  } catch {
    return address;
  }
}

function hasPositiveValue(
  value?: string | null,
) {
  try {
    return BigInt(value ?? '0') > 0n;
  } catch {
    return false;
  }
}

function isIncomingMessage(
  message: ToncenterMessage | null | undefined,
  accountAddress: string,
) {
  return (
    normalizeRawAddress(message?.destination) ===
      accountAddress &&
    (Boolean(message?.source) ||
      hasPositiveValue(message?.value))
  );
}

function isOutgoingMessage(
  message: ToncenterMessage,
  accountAddress: string,
) {
  const source = normalizeRawAddress(message.source);
  const destination = normalizeRawAddress(
    message.destination,
  );

  return (
    source === accountAddress &&
    Boolean(destination) &&
    hasPositiveValue(message.value)
  );
}

function normalizeRawAddress(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  try {
    return Address.parse(value).toRawString();
  } catch {
    return value;
  }
}

function resolveIncomingStatus(
  message: ToncenterMessage,
): TransactionRecord['status'] {
  return hasPositiveValue(message.value)
    ? 'confirmed'
    : 'failed';
}
