import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppServices } from '@/app/providers/app-services-provider';
import {
  selectPersistedMeta,
  selectStartSession,
  selectStorageStatus,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { translateErrorMessage } from '@/shared/i18n/translate-error-message';
import { shortAddress } from '@/shared/lib/format-address';
import { useAsyncAction } from '@/shared/lib/use-async-action';
import { ActionButton } from '@/shared/ui/action-button';
import { ActionLink } from '@/shared/ui/action-link';
import { TextField } from '@/shared/ui/text-field';
import { toast } from 'sonner';

export function UnlockWalletPage() {
  const { walletCore } = useAppServices();
  const navigate = useNavigate();
  const persistedMeta = useWalletSessionStore(selectPersistedMeta);
  const storageStatus = useWalletSessionStore(selectStorageStatus);
  const startSession = useWalletSessionStore(selectStartSession);
  const { t } = useI18n();
  const passcodeRef = useRef('');
  const [passcodeFieldKey, setPasscodeFieldKey] =
    useState(0);
  const unlockAction = useAsyncAction(
    () => walletCore.unlockWallet(passcodeRef.current),
    t('error.rootFallback'),
  );

  useEffect(() => () => {
    passcodeRef.current = '';
  }, []);

  useEffect(() => {
    if (unlockAction.error) {
      toast.error(translateErrorMessage(unlockAction.error, t));
    }
  }, [unlockAction.error, t]);

  const handleUnlock = async () => {
    const result = await unlockAction.run();

    if (!result.ok) {
      return;
    }

    passcodeRef.current = '';
    setPasscodeFieldKey((current) => current + 1);
    await startSession(result.data);
    await navigate({ to: '/app/wallet' });
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 py-4">
      <main className="w-full max-w-[30rem] grid gap-4">
        <header className="grid justify-items-center text-center">
          <h1 className="m-0 font-headline text-[clamp(2rem,7vw,3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
            {t('unlock.title')}
          </h1>
        </header>
        <section className="grid gap-4 p-6 bg-surface-low rounded-2xl">
          <TextField
            key={passcodeFieldKey}
            type="password"
            aria-label={t('unlock.passcode')}
            placeholder={t('unlock.passcode')}
            autoComplete="current-password"
            onChange={(event) => {
              unlockAction.clearError();
              passcodeRef.current =
                event.target.value;
            }}
          />
          <div className="grid gap-3">
            <ActionButton
              disabled={!persistedMeta || unlockAction.isPending || storageStatus === 'corrupted'}
              onClick={handleUnlock}
            >
              {unlockAction.isPending ? t('unlock.pending') : t('unlock.unlockWallet')}
            </ActionButton>
            <ActionLink to="/" variant="secondary">{t('common.back')}</ActionLink>
          </div>
        </section>
      </main>
    </div>
  );
}
