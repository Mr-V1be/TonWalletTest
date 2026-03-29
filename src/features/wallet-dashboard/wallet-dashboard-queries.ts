import { useQuery } from '@tanstack/react-query';
import type { BlockchainGateway } from '@/core/application/ports/blockchain-gateway';

const SNAPSHOT_REFETCH_INTERVAL_MS = 30_000;
const TRANSACTIONS_REFETCH_INTERVAL_MS = 45_000;

export function useWalletSnapshotQuery(
  readGateway: BlockchainGateway,
  address: string,
) {
  return useQuery({
    queryKey: ['wallet-snapshot', address],
    queryFn: ({ signal }) =>
      readGateway.getWalletSnapshot(
        address,
        signal,
      ),
    enabled: Boolean(address),
    refetchInterval: SNAPSHOT_REFETCH_INTERVAL_MS,
  });
}

export function useWalletTransactionsQuery(
  readGateway: BlockchainGateway,
  address: string,
  limit: number,
) {
  return useQuery({
    queryKey: ['wallet-transactions', address, limit],
    queryFn: ({ signal }) =>
      readGateway.getTransactions(
        address,
        limit,
        undefined,
        signal,
      ),
    enabled: Boolean(address),
    refetchInterval: TRANSACTIONS_REFETCH_INTERVAL_MS,
  });
}
