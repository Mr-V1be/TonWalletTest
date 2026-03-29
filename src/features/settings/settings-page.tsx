import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppServices } from '@/app/providers/app-services-provider';
import { LanguageSection } from '@/features/settings/language-section';
import { LockWalletSection } from '@/features/settings/lock-wallet-section';
import { RecentRecipientsSection } from '@/features/settings/recent-recipients-section';
import { ToncenterApiKeySection } from '@/features/settings/toncenter-api-key-section';
import { TrustedAddressesSection } from '@/features/settings/trusted-addresses-section';
import {
  selectLockWallet,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { translateErrorMessage } from '@/shared/i18n/translate-error-message';
import { readError } from '@/shared/lib/read-error';
import { toast } from 'sonner';

export function SettingsPage() {
  const { recipientBook } = useAppServices();
  const navigate = useNavigate();
  const lockWallet = useWalletSessionStore(selectLockWallet);
  const { t } = useI18n();
  const [trustedInput, setTrustedInput] = useState('');
  const [snapshot, setSnapshot] = useState({
    recentRecipients: [] as string[],
    trustedAddresses: [] as string[],
  });
  const trustedSet = useMemo(() => new Set(snapshot.trustedAddresses), [snapshot.trustedAddresses]);

  const refreshSnapshot = useCallback(async () => {
    try {
      setSnapshot(await recipientBook.readSnapshot());
    } catch (error) {
      toast.error(
        translateErrorMessage(
          readError(error, t('error.addressBookLoad')),
          t,
        ),
      );
    }
  }, [recipientBook]);

  const handleToggleTrust = useCallback(
    async (address: string, trusted: boolean) => {
      try {
        await recipientBook.setTrustedAddress(address, !trusted);
        await refreshSnapshot();
      } catch (error) {
        toast.error(
          translateErrorMessage(
            readError(
              error,
              t('settings.updateTrustFailed'),
            ),
            t,
          ),
        );
      }
    },
    [recipientBook, refreshSnapshot, t],
  );

  useEffect(() => {
    void refreshSnapshot();
  }, [refreshSnapshot]);

  return (
    <div className="grid gap-5">
      <header className="grid gap-3">
        <h1 className="m-0 font-headline font-extrabold text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-[-0.06em]">
          {t('settings.title')}
        </h1>
      </header>
      <section className="grid gap-4 max-w-2xl">
        <TrustedAddressesSection
          onSnapshotRefresh={refreshSnapshot}
          recipientBook={recipientBook}
          trustedAddresses={snapshot.trustedAddresses}
          trustedInput={trustedInput}
          onTrustedInputChange={setTrustedInput}
          onTrustToggle={handleToggleTrust}
        />
        <ToncenterApiKeySection />
        <LanguageSection />
        <LockWalletSection
          onLock={() => {
            lockWallet();
            void navigate({ to: '/unlock' });
          }}
        />
      </section>
    </div>
  );
}
