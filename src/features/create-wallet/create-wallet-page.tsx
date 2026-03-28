import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppServices } from '@/app/providers/app-services-provider';
import { MIN_PASSCODE_LENGTH } from '@/core/application/use-cases/passcode-policy';
import type { UnlockedWalletSession } from '@/core/domain/wallet/unlocked-wallet-session';
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

export function CreateWalletPage() {
  const { walletCore } = useAppServices();
  const navigate = useNavigate();
  const startSession = useWalletSessionStore(selectStartSession);
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
    'Something went wrong while creating the wallet.',
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

  function clearPendingSession() {
    // Best-effort only: JS strings are immutable and cannot
    // be zeroized reliably, so we only release references ASAP.
    pendingSessionRef.current = null;
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panelCompact">
        <AuthBrand />
        <ScreenFrame
          title="Create a new wallet"
        >
          <div className="stack-lg">
            {hasPendingSession ? (
              <>
                {mnemonic ? (
                  <InfoCard title="Recovery phrase" eyebrow="Save it now" tone="warning">
                    <div className="seed-grid">
                      {mnemonic.map((word, index) => (
                        <span key={`${word}-${index}`} className="seed-word">
                        {index + 1}. {word}
                      </span>
                    ))}
                  </div>
                  </InfoCard>
                ) : (
                  <InfoCard title="Recovery phrase hidden" eyebrow="Safety first" tone="warning">
                    Hidden.
                  </InfoCard>
                )}
                <div className="action-rowEqual">
                  {!mnemonic ? (
                    <ActionButton
                      variant="secondary"
                      onClick={() => setIsMnemonicVisible(true)}
                    >
                      Reveal phrase again
                    </ActionButton>
                  ) : null}
                  <ActionButton onClick={handleContinue}>Continue to wallet</ActionButton>
                </div>
              </>
            ) : (
              <>
                <InfoCard title="Protect this browser" eyebrow="Passcode">
                  <div className="stack-md">
                    <TextField
                      key={passcodeFieldKey}
                      label="Local passcode"
                      type="password"
                      placeholder={`At least ${MIN_PASSCODE_LENGTH} characters`}
                      autoComplete="new-password"
                      onChange={(event) => {
                        createAction.clearError();
                        passcodeRef.current =
                          event.target.value;
                      }}
                    />
                    {createAction.error ? <p className="error-copy">{createAction.error}</p> : null}
                  </div>
                </InfoCard>
                <div className="action-rowEqual">
                  <ActionButton disabled={createAction.isPending} onClick={handleCreate}>
                    {createAction.isPending ? 'Generating wallet...' : 'Generate testnet wallet'}
                  </ActionButton>
                  <ActionLink to="/" variant="secondary">Back</ActionLink>
                </div>
              </>
            )}
          </div>
        </ScreenFrame>
      </div>
    </div>
  );
}
