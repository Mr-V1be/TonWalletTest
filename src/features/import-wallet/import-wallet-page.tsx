import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppServices } from '@/app/providers/app-services-provider';
import { MIN_PASSCODE_LENGTH } from '@/core/application/use-cases/passcode-policy';
import { AuthBrand } from '@/features/unlock-wallet/auth-brand';
import {
  selectStartSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { useAsyncAction } from '@/shared/lib/use-async-action';
import { ActionButton } from '@/shared/ui/action-button';
import { ActionLink } from '@/shared/ui/action-link';
import { InfoCard } from '@/shared/ui/info-card';
import { ScreenFrame } from '@/shared/ui/screen-frame';
import { TextField } from '@/shared/ui/text-field';

export function ImportWalletPage() {
  const { walletCore } = useAppServices();
  const navigate = useNavigate();
  const startSession = useWalletSessionStore(selectStartSession);
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
    'Something went wrong while importing the wallet.',
  );

  useEffect(() => () => {
    passcodeRef.current = '';
    seedPhraseRef.current = '';
  }, []);

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
    <div className="auth-shell">
      <div className="auth-panel auth-panelCompact">
        <AuthBrand />
        <ScreenFrame
          title="Import existing wallet"
        >
          <div className="stack-lg">
            <InfoCard title="Restore wallet" eyebrow="Existing mnemonic">
              <div className="stack-md">
                <TextField
                  key={seedFieldKey}
                  label="Seed phrase"
                  multiline
                  placeholder="Enter 12 or 24 mnemonic words"
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
                  label="Local passcode"
                  type="password"
                  placeholder={`At least ${MIN_PASSCODE_LENGTH} characters`}
                  autoComplete="new-password"
                  onChange={(event) => {
                    importAction.clearError();
                    passcodeRef.current =
                      event.target.value;
                  }}
                />
                {importAction.error ? <p className="error-copy">{importAction.error}</p> : null}
              </div>
            </InfoCard>
            <div className="action-rowEqual">
              <ActionButton disabled={importAction.isPending} onClick={handleImport}>
                {importAction.isPending ? 'Importing wallet...' : 'Import to testnet wallet'}
              </ActionButton>
              <ActionLink to="/" variant="secondary">Back</ActionLink>
            </div>
          </div>
        </ScreenFrame>
      </div>
    </div>
  );
}
