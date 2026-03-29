import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppServices } from '@/app/providers/app-services-provider';
import { MIN_PASSCODE_LENGTH } from '@/core/application/use-cases/passcode-policy';
import type { UnlockedWalletSession } from '@/core/domain/wallet/unlocked-wallet-session';
import {
  selectStartSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { translateErrorMessage } from '@/shared/i18n/translate-error-message';
import { useAsyncAction } from '@/shared/lib/use-async-action';
import { ActionButton } from '@/shared/ui/action-button';
import { ActionLink } from '@/shared/ui/action-link';
import { TextField } from '@/shared/ui/text-field';
import { toast } from 'sonner';

export function CreateWalletPage() {
  const { walletCore } = useAppServices();
  const navigate = useNavigate();
  const startSession = useWalletSessionStore(selectStartSession);
  const { t } = useI18n();
  const passcodeRef = useRef('');
  const [passcodeFieldKey, setPasscodeFieldKey] =
    useState(0);
  const pendingSessionRef =
    useRef<UnlockedWalletSession | null>(null);
  const [isMnemonicVisible, setIsMnemonicVisible] =
    useState(false);
  const hasPendingSession = Boolean(
    pendingSessionRef.current,
  );
  const mnemonic = isMnemonicVisible
    ? pendingSessionRef.current?.mnemonic ?? null
    : null;
  const createAction = useAsyncAction(
    () => walletCore.createWallet(passcodeRef.current),
    t('error.rootFallback'),
  );

  useEffect(() => () => {
    clearPendingSession();
    passcodeRef.current = '';
  }, []);

  useEffect(() => {
    if (!isMnemonicVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsMnemonicVisible(false);
    }, 60_000);
    const handleBlur = () => {
      setIsMnemonicVisible(false);
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isMnemonicVisible]);

  useEffect(() => {
    if (createAction.error) {
      toast.error(translateErrorMessage(createAction.error, t));
    }
  }, [createAction.error, t]);

  const handleCreate = async () => {
    const result = await createAction.run();

    if (!result.ok) {
      return;
    }

    passcodeRef.current = '';
    setPasscodeFieldKey((current) => current + 1);
    clearPendingSession();
    pendingSessionRef.current = result.data;
    setIsMnemonicVisible(true);
  };

  const handleContinue = async () => {
    if (!pendingSessionRef.current) {
      return;
    }

    await startSession(pendingSessionRef.current);
    clearPendingSession();
    setIsMnemonicVisible(false);
    await navigate({ to: '/app/wallet' });
  };

  const handleCopyMnemonic = async () => {
    if (!pendingSessionRef.current) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        pendingSessionRef.current.mnemonic.join(' '),
      );
      toast.success(t('create.phraseCopied'));
    } catch {
      toast.error(t('receive.clipboardFailed'));
    }
  };

  function clearPendingSession() {
    pendingSessionRef.current = null;
  }

  return (
    <div className="min-h-screen grid place-items-center px-6 py-4">
      <main className="w-full max-w-[30rem] grid gap-4">
        <header className="grid justify-items-center text-center">
          <h1 className="m-0 font-headline text-[clamp(2rem,7vw,3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
            {t('create.title')}
          </h1>
        </header>
        <section className="grid gap-4 p-6 bg-surface-low rounded-2xl">
          {hasPendingSession ? (
            <>
              {mnemonic ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mnemonic.map((word, index) => (
                    <span
                      key={`${word}-${index}`}
                      className="flex items-center min-h-[3.2rem] px-4 py-3 bg-[rgba(38,42,51,0.8)] rounded-[0.75rem] font-mono text-[0.84rem] text-text"
                    >
                      {index + 1}. {word}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="grid gap-3">
                {!mnemonic ? (
                  <ActionButton
                    variant="secondary"
                    onClick={() => setIsMnemonicVisible(true)}
                  >
                    {t('create.revealAgain')}
                  </ActionButton>
                ) : (
                  <ActionButton
                    variant="secondary"
                    onClick={handleCopyMnemonic}
                  >
                    {t('create.copyPhrase')}
                  </ActionButton>
                )}
                <ActionButton onClick={handleContinue}>{t('common.continueToWallet')}</ActionButton>
              </div>
            </>
          ) : (
            <>
              <TextField
                key={passcodeFieldKey}
                type="password"
                placeholder={t('create.localPasscode')}
                autoComplete="new-password"
                onChange={(event) => {
                  createAction.clearError();
                  passcodeRef.current =
                    event.target.value;
                }}
              />
              <div className="grid gap-3">
                <ActionButton disabled={createAction.isPending} onClick={handleCreate}>
                  {createAction.isPending ? t('create.pending') : t('create.generateWallet')}
                </ActionButton>
                <ActionLink to="/" variant="secondary">{t('common.back')}</ActionLink>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
