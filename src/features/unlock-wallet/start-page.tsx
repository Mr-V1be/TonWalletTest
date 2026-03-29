import { Link } from '@tanstack/react-router';
import {
  ChevronRight,
  Download,
  Plus,
} from 'lucide-react';
import {
  selectPersistedMeta,
  selectStorageStatus,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { ActionLink } from '@/shared/ui/action-link';
import { InfoCard } from '@/shared/ui/info-card';

export function StartPage() {
  const persistedMeta = useWalletSessionStore(selectPersistedMeta);
  const storageStatus = useWalletSessionStore(selectStorageStatus);
  const { t } = useI18n();

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <main className="w-full max-w-[32rem] grid gap-8">
        <section className="grid gap-4">
          <Link
            to="/create"
            className="grid grid-cols-[auto_1fr_auto] items-center gap-5 p-5 bg-surface-low rounded-xl transition-colors hover:bg-surface"
          >
            <span className="w-12 h-12 rounded-[0.95rem] grid place-items-center bg-accent text-white">
              <Plus size={20} strokeWidth={2.2} />
            </span>
            <span className="grid gap-1 min-w-0">
              <span className="m-0 font-headline font-bold text-[1.2rem] leading-[1.1]">
                {t('start.createNewWallet')}
              </span>
            </span>
            <span className="grid place-items-center text-text-soft">
              <ChevronRight size={20} strokeWidth={2.1} />
            </span>
          </Link>
          <Link
            to="/import"
            className="grid grid-cols-[auto_1fr_auto] items-center gap-5 p-5 bg-surface-low rounded-xl transition-colors hover:bg-surface"
          >
            <span className="w-12 h-12 rounded-[0.95rem] grid place-items-center bg-surface-soft text-text">
              <Download size={20} strokeWidth={2.1} />
            </span>
            <span className="grid gap-1 min-w-0">
              <span className="m-0 font-headline font-bold text-[1.2rem] leading-[1.1]">
                {t('start.importExisting')}
              </span>
            </span>
            <span className="grid place-items-center text-text-soft">
              <ChevronRight size={20} strokeWidth={2.1} />
            </span>
          </Link>
        </section>
        {persistedMeta ? (
          <ActionLink to="/unlock">{t('start.unlockStoredWallet')}</ActionLink>
        ) : null}
        {storageStatus === 'corrupted' ? (
          <InfoCard title={t('start.walletStorageCorrupted')} eyebrow={t('start.recovery')} tone="warning">
            {t('start.reimportWallet')}
          </InfoCard>
        ) : null}
      </main>
    </div>
  );
}
