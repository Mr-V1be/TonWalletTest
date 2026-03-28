import { Link } from '@tanstack/react-router';
import {
  ChevronRight,
  Download,
  Plus,
} from 'lucide-react';
import { AuthBrand } from '@/features/unlock-wallet/auth-brand';
import {
  selectPersistedMeta,
  selectStorageStatus,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { ActionLink } from '@/shared/ui/action-link';
import { InfoCard } from '@/shared/ui/info-card';

export function StartPage() {
  const persistedMeta = useWalletSessionStore(selectPersistedMeta);
  const storageStatus = useWalletSessionStore(selectStorageStatus);

  return (
    <div className="auth-shell">
      <main className="auth-panel">
        <AuthBrand />
        <section className="auth-optionGrid">
          <Link to="/create" className="auth-option">
            <span className="auth-optionIcon">
              <Plus size={20} strokeWidth={2.2} />
            </span>
            <span className="auth-optionCopy">
              <span className="auth-optionTitle">Create New Wallet</span>
            </span>
            <span className="auth-optionArrow">
              <ChevronRight size={20} strokeWidth={2.1} />
            </span>
          </Link>
          <Link to="/import" className="auth-option">
            <span className="auth-optionIcon auth-optionIconMuted">
              <Download size={20} strokeWidth={2.1} />
            </span>
            <span className="auth-optionCopy">
              <span className="auth-optionTitle">Import Existing</span>
            </span>
            <span className="auth-optionArrow">
              <ChevronRight size={20} strokeWidth={2.1} />
            </span>
          </Link>
        </section>
        {persistedMeta ? (
          <InfoCard title="Stored wallet detected" eyebrow="This browser">
            <p className="mono-block">{persistedMeta.address}</p>
            <ActionLink to="/unlock">Unlock stored wallet</ActionLink>
          </InfoCard>
        ) : null}
        {storageStatus === 'corrupted' ? (
          <InfoCard title="Wallet storage is corrupted" eyebrow="Recovery" tone="warning">
            Re-import the wallet.
          </InfoCard>
        ) : null}
      </main>
    </div>
  );
}
