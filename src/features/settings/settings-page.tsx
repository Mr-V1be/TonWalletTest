import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppServices } from '@/app/providers/app-services-provider';
import { LockWalletSection } from '@/features/settings/lock-wallet-section';
import { RecentRecipientsSection } from '@/features/settings/recent-recipients-section';
import { SessionPolicySection } from '@/features/settings/session-policy-section';
import { TrustedAddressesSection } from '@/features/settings/trusted-addresses-section';
import {
  selectLockWallet,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { readError } from '@/shared/lib/read-error';

export function SettingsPage() {
  const { recipientBook } = useAppServices();
  const navigate = useNavigate();
  const lockWallet = useWalletSessionStore(selectLockWallet);
  const [trustedInput, setTrustedInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [snapshot, setSnapshot] = useState({
    recentRecipients: [] as string[],
    trustedAddresses: [] as string[],
  });
  const trustedSet = useMemo(() => new Set(snapshot.trustedAddresses), [snapshot.trustedAddresses]);

  const refreshSnapshot = useCallback(async () => {
    try {
      setSnapshot(await recipientBook.readSnapshot());
    } catch (error) {
      setFeedback(
        readError(error, 'Address book could not be loaded.'),
      );
    }
  }, [recipientBook]);

  const handleToggleTrust = useCallback(
    async (address: string, trusted: boolean) => {
      try {
        await recipientBook.setTrustedAddress(address, !trusted);
        await refreshSnapshot();
      } catch (error) {
        setFeedback(
          readError(
            error,
            'Trusted address could not be updated.',
          ),
        );
      }
    },
    [recipientBook, refreshSnapshot],
  );

  useEffect(() => {
    void refreshSnapshot();
  }, [refreshSnapshot]);

  return (
    <div className="settings-shell">
      <header className="page-hero">
        <p className="page-kicker">Vault / Settings</p>
        <h1 className="page-title">Security Center</h1>
      </header>
      <section className="settings-grid">
        <div className="settings-column">
          <TrustedAddressesSection
            feedback={feedback}
            onFeedbackChange={setFeedback}
            onSnapshotRefresh={refreshSnapshot}
            recipientBook={recipientBook}
            trustedAddresses={snapshot.trustedAddresses}
            trustedInput={trustedInput}
            onTrustedInputChange={setTrustedInput}
            onTrustToggle={handleToggleTrust}
          />
        </div>
        <div className="settings-column">
          <SessionPolicySection />
          <RecentRecipientsSection
            recentRecipients={snapshot.recentRecipients}
            trustedSet={trustedSet}
            onTrustToggle={handleToggleTrust}
          />
          <LockWalletSection
            onLock={() => {
              lockWallet();
              void navigate({ to: '/unlock' });
            }}
          />
        </div>
      </section>
    </div>
  );
}
