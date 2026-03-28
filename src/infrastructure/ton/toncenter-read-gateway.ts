import { fromNano } from '@ton/ton';
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

    return (response.transactions ?? []).map((tx) =>
      mapTransaction(tx, address),
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

function mapTransaction(
  transaction: ToncenterTransaction,
  accountAddress: string,
): TransactionRecord {
  const isIncoming =
    transaction.in_msg?.destination === accountAddress &&
    Boolean(transaction.in_msg?.source);
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
    comment:
      readComment(transaction.in_msg) ??
      readComment(primaryOutMessage),
    counterparty: counterparty ?? 'Unknown',
    createdAt: new Date(transaction.now * 1000).toISOString(),
    status: transaction.description?.aborted
      ? 'failed'
      : 'confirmed',
  };
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
