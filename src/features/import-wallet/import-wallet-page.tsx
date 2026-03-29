import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppServices } from '@/app/providers/app-services-provider';
import { MIN_PASSCODE_LENGTH } from '@/core/application/use-cases/passcode-policy';
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

export function ImportWalletPage() {
  const { walletCore } = useAppServices();
  const navigate = useNavigate();
  const startSession = useWalletSessionStore(selectStartSession);
  const { t } = useI18n();
  const passcodeRef = useRef('');
  const [passcodeFieldKey, setPasscodeFieldKey] =
    useState(0);
  const [seedFieldKey, setSeedFieldKey] = useState(0);
  const seedPhraseRef = useRef('');
  const importAction = useAsyncAction(
    () =>
      walletCore.importWallet(
        seedPhraseRef.current,
        passcodeRef.current,
      ),
    t('error.rootFallback'),
  );

  useEffect(() => () => {
    passcodeRef.current = '';
    seedPhraseRef.current = '';
  }, []);

  useEffect(() => {
    if (importAction.error) {
      toast.error(translateErrorMessage(importAction.error, t));
    }
  }, [importAction.error, t]);

  const handleImport = async () => {
    const result = await importAction.run();

    if (!result.ok) {
      return;
    }

    seedPhraseRef.current = '';
    passcodeRef.current = '';
    setSeedFieldKey((current) => current + 1);
    setPasscodeFieldKey((current) => current + 1);
    await startSession(result.data);
    await navigate({ to: '/app/wallet' });
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 py-4">
      <main className="w-full max-w-[30rem] grid gap-4">
        <header className="grid justify-items-center text-center">
          <h1 className="m-0 font-headline text-[clamp(2rem,7vw,3rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
            {t('import.title')}
          </h1>
        </header>
        <section className="grid gap-4 p-6 bg-surface-low rounded-2xl">
          <TextField
            key={seedFieldKey}
            label={t('import.seedPhrase')}
            multiline
            placeholder={t('import.seedPlaceholder')}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(event) => {
              importAction.clearError();
              seedPhraseRef.current = event.target.value;
            }}
          />
          <TextField
            key={passcodeFieldKey}
            type="password"
            placeholder={t('create.localPasscode')}
            autoComplete="new-password"
            onChange={(event) => {
              importAction.clearError();
              passcodeRef.current =
                event.target.value;
            }}
          />
          <div className="grid gap-3">
            <ActionButton disabled={importAction.isPending} onClick={handleImport}>
              {importAction.isPending ? t('import.pending') : t('import.importWallet')}
            </ActionButton>
            <ActionLink to="/" variant="secondary">{t('common.back')}</ActionLink>
          </div>
        </section>
      </main>
    </div>
  );
}
