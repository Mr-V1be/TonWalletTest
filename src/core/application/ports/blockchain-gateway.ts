import type { TransactionRecord } from '@/core/domain/transaction/transaction-record';
import type { WalletSnapshot } from '@/core/domain/wallet/wallet-snapshot';

export interface BlockchainGateway {
  getBalance(
    address: string,
    signal?: AbortSignal,
  ): Promise<string>;
  getWalletSnapshot(
    address: string,
    signal?: AbortSignal,
  ): Promise<WalletSnapshot>;
  getTransactions(
    address: string,
    limit: number,
    offset?: number,
    signal?: AbortSignal,
  ): Promise<TransactionRecord[]>;
}
