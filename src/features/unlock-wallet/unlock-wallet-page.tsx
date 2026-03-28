import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppServices } from '@/app/providers/app-services-provider';
import { MIN_PASSCODE_LENGTH } from '@/core/application/use-cases/passcode-policy';
import { AuthBrand } from '@/features/unlock-wallet/auth-brand';
import {
  selectPersistedMeta,
  selectStartSession,
  selectStorageStatus,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { useAsyncAction } from '@/shared/lib/use-async-action';
import { ActionButton } from '@/shared/ui/action-button';
import { ActionLink } from '@/shared/ui/action-link';
import { InfoCard } from '@/shared/ui/info-card';
import { ScreenFrame } from '@/shared/ui/screen-frame';
import { TextField } from '@/shared/ui/text-field';

export function UnlockWalletPage() {
  const { walletCore } = useAppServices();
  const navigate = useNavigate();
  const persistedMeta = useWalletSessionStore(selectPersistedMeta);
  const storageStatus = useWalletSessionStore(selectStorageStatus);
  const startSession = useWalletSessionStore(selectStartSession);
  const passcodeRef = useRef('');
  const [passcodeFieldKey, setPasscodeFieldKey] =
    useState(0);
  const unlockAction = useAsyncAction(
    () => walletCore.unlockWallet(passcodeRef.current),
    'Something went wrong while unlocking the wallet.',
  );

  useEffect(() => () => {
    passcodeRef.current = '';
  }, []);

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
    <div className="auth-shell">
      <div className="auth-panel auth-panelCompact">
        <AuthBrand />
        <ScreenFrame
          title="Unlock wallet"
        >
          <div className="stack-lg">
            <InfoCard title="Encrypted wallet" eyebrow="Stored locally">
              <div className="stack-md">
                {persistedMeta ? (
                  <p className="mono-block">{persistedMeta.address}</p>
                ) : storageStatus === 'corrupted' ? (
                  <p className="error-copy">
                    Storage is corrupted.
                  </p>
                ) : (
                  <p className="section-copy">No stored wallet.</p>
                )}
                <TextField
                  key={passcodeFieldKey}
                  label="Passcode"
                  type="password"
                  placeholder={`At least ${MIN_PASSCODE_LENGTH} characters`}
                  autoComplete="current-password"
                  onChange={(event) => {
                    unlockAction.clearError();
                    passcodeRef.current =
                      event.target.value;
                  }}
                />
                {unlockAction.error ? <p className="error-copy">{unlockAction.error}</p> : null}
              </div>
            </InfoCard>
            <div className="action-rowEqual">
              <ActionButton
                disabled={!persistedMeta || unlockAction.isPending || storageStatus === 'corrupted'}
                onClick={handleUnlock}
              >
                {unlockAction.isPending ? 'Unlocking wallet...' : 'Unlock wallet'}
              </ActionButton>
              <ActionLink to="/" variant="secondary">Back</ActionLink>
            </div>
          </div>
        </ScreenFrame>
      </div>
    </div>
  );
}
