import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { useAppServices } from '@/app/providers/app-services-provider';
import { TonLogo } from '@/shared/ui/ton-logo';
import {
  selectSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { useWalletSnapshotQuery, useWalletTransactionsQuery } from '@/features/wallet-dashboard/wallet-dashboard-queries';
import { buildAddressExplorerUrl, buildTransactionExplorerUrl } from '@/shared/config/blockchain-services';
import { shortAddress } from '@/shared/lib/format-address';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { translateErrorMessage } from '@/shared/i18n/translate-error-message';
import { readError } from '@/shared/lib/read-error';
import { ActionButton } from '@/shared/ui/action-button';
import { toast } from 'sonner';
import { StatusPill } from '@/shared/ui/status-pill';

const MAX_TRANSACTION_LIMIT = 100;
const TRANSACTION_LIMIT_STEP = 20;

export function WalletDashboardPage() {
  const { blockchain } = useAppServices();
  const session = useWalletSessionStore(selectSession);
  const { language, t } = useI18n();
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
      [item.counterparty, item.id, item.comment ?? '', item.amountTon, item.direction, item.status, item.createdAt]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [normalizedSearch, transactionsQuery.data]);
  const quickActionClass =
    'inline-flex flex-1 basis-[8.5rem] items-center justify-center min-h-[45px] px-4 rounded-lg bg-accent text-white font-headline font-extrabold';

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,1fr)] lg:items-stretch">
        <article className="relative overflow-hidden bg-surface-low rounded-2xl px-6 py-8 flex flex-col justify-evenly gap-4 min-h-48">
          <p className="m-0 text-text-soft font-mono text-[0.72rem] font-bold tracking-[0.24em] uppercase">
            {t('wallet.availableBalance')}
          </p>
          <div className="flex items-center gap-3">
            <p className="m-0 font-headline font-extrabold text-3xl leading-none tracking-[-0.03em]">
              {snapshotQuery.isLoading
                ? '...'
                : snapshotQuery.data?.balanceTon ?? '0'}
            </p>
            <TonLogo size={22} />
          </div>
          <button
            type="button"
            title={address}
            className="inline-flex items-center self-start max-w-full min-h-[40px] px-2.5 py-2 rounded-[0.5rem] bg-[rgba(38,42,51,0.82)] text-text-muted font-mono text-[0.78rem] border-0 cursor-pointer text-left hover:bg-[rgba(38,42,51,1)]"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(address);
                toast.success(t('receive.addressCopied'));
              } catch {
                toast.error(t('receive.clipboardFailed'));
              }
            }}
          >
            <span className="break-all">{address}</span>
          </button>
        </article>
        <div className="grid gap-4 lg:grid-rows-2 lg:h-full">
          <article className="relative overflow-hidden bg-surface-low rounded-2xl flex flex-col p-6 lg:h-full">
            <p className="m-0 text-text-soft font-mono text-[0.72rem] font-bold tracking-[0.24em] uppercase">
              {t('wallet.networkStatus')}
            </p>
            <p className="mt-2.5 m-0 font-headline font-bold text-[1.85rem] leading-[1.05]">
              {t('common.testnet')}
            </p>
          </article>
          <article className="relative overflow-hidden bg-surface-low rounded-2xl flex flex-col p-6 lg:h-full">
            <p className="m-0 text-text-soft font-mono text-[0.72rem] font-bold tracking-[0.24em] uppercase">
              {t('wallet.sessionPolicy')}
            </p>
            <p className="mt-2.5 m-0 font-headline font-bold text-[1.85rem] leading-[1.05]">
              {t('wallet.localOnlyUnlock')}
            </p>
          </article>
        </div>
      </section>
      <section className="relative overflow-hidden bg-surface-low rounded-2xl p-7">
        <div className="flex justify-between items-center gap-4 mb-5 flex-wrap">
          <h2 className="m-0 font-headline text-[1.25rem] font-bold tracking-[-0.03em]">
            {t('wallet.recentActivity')}
          </h2>
          <label className="relative w-full max-w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 grid place-items-center text-text-soft">
              <Search size={18} strokeWidth={2} />
            </span>
            <input
              className="w-full h-[3.15rem] pl-11 pr-4 border border-[rgba(63,72,81,0.25)] rounded-[0.75rem] bg-[rgba(38,42,51,0.92)] text-text outline-none"
              placeholder={t('wallet.searchPlaceholder')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {transactionsQuery.isLoading ? (
          <p className="m-0 text-text-muted leading-[1.55]">{t('common.loading')}</p>
        ) : null}
        {transactionsQuery.error ? (
          <p className="m-0 text-danger text-[0.92rem] font-bold">
            {translateErrorMessage(
              readError(
                transactionsQuery.error,
                t('error.transactionsLoad'),
              ),
              t,
            )}
          </p>
        ) : null}
        {!transactionsQuery.isLoading && !filteredTransactions.length ? (
          <p className="m-0 text-text-muted leading-[1.55]">{t('wallet.noTransactions')}</p>
        ) : null}
        <div className="grid">
          {filteredTransactions.map((item, index) => (
            <article
              key={item.id}
              className={[
                'grid grid-cols-[auto_1fr_auto] gap-4 items-center py-4',
                index !== 0 ? 'border-t border-[rgba(63,72,81,0.2)]' : '',
              ].join(' ')}
            >
              <div
                className={[
                  'w-10 h-10 rounded-full grid place-items-center text-white',
                  item.direction === 'incoming'
                    ? 'bg-[rgba(21,201,123,0.2)] text-[#15c97b]'
                    : 'bg-[rgba(40,76,106,0.5)]',
                ].join(' ')}
              >
                {item.direction === 'incoming' ? (
                  <ArrowDownLeft size={18} strokeWidth={2.2} />
                ) : (
                  <ArrowUpRight size={18} strokeWidth={2.2} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="m-0 font-headline font-bold text-[0.95rem]">
                    {formatDirection(item.direction, t)}
                  </p>
                  <StatusPill
                    tone={
                      item.status === 'failed'
                        ? 'danger'
                        : 'success'
                    }
                  >
                    {translateStatus(item.status, t)}
                  </StatusPill>
                </div>
                <p className="m-0 text-text-soft text-[0.82rem] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.comment ?? shortAddress(item.counterparty)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <p className="m-0 font-headline font-bold text-[0.95rem]">
                    {item.direction === 'incoming' ? '+' : '-'}{item.amountTon}
                  </p>
                  <TonLogo size={14} />
                </div>
                <p className="m-0 text-text-soft text-[0.78rem] mt-0.5">
                  {formatDate(item.createdAt, language)}
                </p>
              </div>
            </article>
          ))}
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
            {t('wallet.loadMore', { count: TRANSACTION_LIMIT_STEP })}
          </ActionButton>
        ) : null}
      </section>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/app/receive" className={quickActionClass}>
          {t('common.receive')}
        </Link>
        <Link to="/app/send" className={quickActionClass}>
          {t('common.send')}
        </Link>
        <Link to="/app/settings" className={quickActionClass}>
          {t('common.settings')}
        </Link>
        <a
          href={buildAddressExplorerUrl(address)}
          target="_blank"
          rel="noreferrer"
          className={quickActionClass}
        >
          {t('common.explorer')}
        </a>
      </section>
    </div>
  );
}

function formatDate(value: string, language: 'en' | 'ru') {
  return new Date(value).toLocaleDateString(language, {
    day: 'numeric',
    month: 'short',
  });
}

function formatDirection(
  value: 'incoming' | 'outgoing',
  t: ReturnType<typeof useI18n>['t'],
) {
  return value === 'incoming'
    ? t('tx.direction.incoming')
    : t('tx.direction.outgoing');
}

function translateStatus(
  value: 'confirmed' | 'failed' | 'pending',
  t: ReturnType<typeof useI18n>['t'],
) {
  return {
    confirmed: t('tx.status.confirmed'),
    failed: t('tx.status.failed'),
    pending: t('tx.status.pending'),
  }[value];
}
