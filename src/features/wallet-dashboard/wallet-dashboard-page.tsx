import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { useAppServices } from '@/app/providers/app-services-provider';
import {
  selectSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { useWalletSnapshotQuery, useWalletTransactionsQuery } from '@/features/wallet-dashboard/wallet-dashboard-queries';
import { buildAddressExplorerUrl, buildTransactionExplorerUrl } from '@/shared/config/blockchain-services';
import { shortAddress } from '@/shared/lib/format-address';
import { readError } from '@/shared/lib/read-error';
import { ActionButton } from '@/shared/ui/action-button';
import { StatusPill } from '@/shared/ui/status-pill';

const MAX_TRANSACTION_LIMIT = 100;
const TRANSACTION_LIMIT_STEP = 20;

export function WalletDashboardPage() {
  const { blockchain } = useAppServices();
  const session = useWalletSessionStore(selectSession);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const address = session?.meta.address ?? '';
  const snapshotQuery = useWalletSnapshotQuery(blockchain.readGateway, address);
  const transactionsQuery = useWalletTransactionsQuery(blockchain.readGateway, address, limit);
  const canLoadMore =
    limit < MAX_TRANSACTION_LIMIT &&
    (transactionsQuery.data?.length ?? 0) >= limit;
  const normalizedSearch = search.trim().toLowerCase();
  const filteredTransactions = useMemo(() => {
    if (!transactionsQuery.data || !normalizedSearch) {
      return transactionsQuery.data ?? [];
    }

    return transactionsQuery.data.filter((item) =>
      [item.counterparty, item.id, item.comment ?? '', item.amountTon]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [normalizedSearch, transactionsQuery.data]);

  return (
    <div className="dashboard-grid">
      <section className="dashboard-heroGrid">
        <article className="dashboard-balance">
          <p className="dashboard-label">Available Balance</p>
          <div className="dashboard-balanceRow">
            <p className="dashboard-amount">
              {snapshotQuery.isLoading
                ? '...'
                : snapshotQuery.data?.balanceTon ?? '0'}
            </p>
            <span className="dashboard-unit">TON</span>
          </div>
          <div className="dashboard-footerRow">
            <a
              href={buildAddressExplorerUrl(address)}
              target="_blank"
              rel="noreferrer"
              className="dashboard-addressPill"
            >
              {shortAddress(address)}
            </a>
            <Link to="/app/receive" className="dashboard-cta">
              Receive TON
            </Link>
          </div>
        </article>
        <div className="hero-statStack">
          <article className="dashboard-stat">
            <p className="dashboard-statTitle">Network status</p>
            <p className="dashboard-statValue">Testnet</p>
          </article>
          <article className="dashboard-stat">
            <p className="dashboard-statTitle">Session policy</p>
            <p className="dashboard-statValue">Local-only unlock</p>
          </article>
        </div>
      </section>
      <section className="activity-panel">
        <div className="activity-header">
          <h2 className="section-title">Recent Activity</h2>
          <label className="activity-search">
            <span className="activity-searchIcon">
              <Search size={18} strokeWidth={2} />
            </span>
            <input
              className="activity-searchInput"
              placeholder="Search transactions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {transactionsQuery.isLoading ? <p className="section-copy">Loading...</p> : null}
        {transactionsQuery.error ? (
          <p className="error-copy">
            {readError(
              transactionsQuery.error,
              'Unable to load transactions right now.',
            )}
          </p>
        ) : null}
        {!transactionsQuery.isLoading && !filteredTransactions.length ? (
          <p className="section-copy">No transactions.</p>
        ) : null}
        <div className="asset-list">
          {filteredTransactions.map((item) => (
            <article key={item.id} className="asset-row">
              <div className="asset-icon">
                {item.direction === 'incoming' ? (
                  <ArrowDownLeft size={18} strokeWidth={2.2} />
                ) : (
                  <ArrowUpRight size={18} strokeWidth={2.2} />
                )}
              </div>
              <div className="asset-copy">
                <p className="asset-title">
                  {formatDirection(item.direction)}
                </p>
                <p className="asset-subtitle">
                  {item.comment ?? shortAddress(item.counterparty)}
                </p>
                <div className="meta-row">
                  <StatusPill
                    tone={
                      item.status === 'failed'
                        ? 'danger'
                        : 'success'
                    }
                  >
                    {item.status}
                  </StatusPill>
                  <a
                    href={buildTransactionExplorerUrl(item.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-link"
                  >
                    Explorer
                  </a>
                </div>
              </div>
              <div className="asset-value">
                <p className="asset-amount">{item.amountTon} TON</p>
                <p className="asset-meta">{formatDate(item.createdAt)}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="activity-actions">
          <Link to="/app/send" className="activity-action">Send</Link>
          <Link to="/app/receive" className="activity-action">Receive</Link>
          <Link to="/app/settings" className="activity-action">Settings</Link>
        </div>
        {canLoadMore ? (
          <ActionButton
            variant="quiet"
            onClick={() =>
              setLimit((current) =>
                Math.min(
                  current + TRANSACTION_LIMIT_STEP,
                  MAX_TRANSACTION_LIMIT,
                ),
              )
            }
          >
            Load {TRANSACTION_LIMIT_STEP} more
          </ActionButton>
        ) : null}
      </section>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

function formatDirection(value: 'incoming' | 'outgoing') {
  return value === 'incoming' ? 'Incoming' : 'Outgoing';
}
