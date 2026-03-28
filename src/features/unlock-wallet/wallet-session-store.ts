import { create } from 'zustand';
import type { WalletSessionVaultPort } from '@/core/application/ports/wallet-session-vault-port';
import type { ActiveWalletSession } from '@/core/domain/wallet/active-wallet-session';
import type { WalletMeta } from '@/core/domain/wallet/wallet-meta';
import type { UnlockedWalletSession } from '@/core/domain/wallet/unlocked-wallet-session';

interface WalletSessionState {
  persistedMeta: WalletMeta | null;
  session: ActiveWalletSession | null;
  sessionVault: WalletSessionVaultPort | null;
  storageStatus: 'corrupted' | 'missing' | 'ready';
  clearPersistedWallet(): void;
  lockWallet(): void;
  setPersistedMeta(meta: WalletMeta | null): void;
  setSessionVault(
    sessionVault: WalletSessionVaultPort,
  ): void;
  startSession(
    session: UnlockedWalletSession,
  ): Promise<void>;
}

export const useWalletSessionStore =
  create<WalletSessionState>((set, get) => ({
    persistedMeta: null,
    session: null,
    sessionVault: null,
    storageStatus: 'missing',
    clearPersistedWallet: () => {
      clearActiveSession(get());
      set({
        persistedMeta: null,
        session: null,
        storageStatus: 'missing',
      });
    },
    lockWallet: () => {
      clearActiveSession(get());
      set({ session: null });
    },
    setPersistedMeta: (meta) =>
      set({
        persistedMeta: meta,
        storageStatus: meta ? 'ready' : 'missing',
      }),
    setSessionVault: (sessionVault) =>
      set({ sessionVault }),
    startSession: async (session) => {
      const sessionVault = get().sessionVault;

      if (!sessionVault) {
        throw new Error(
          'Wallet session vault is not configured.',
        );
      }

      clearActiveSession(get());
      const sessionId = await sessionVault.create(
        session.mnemonic,
      );

      set({
        persistedMeta: session.meta,
        session: {
          meta: session.meta,
          sessionId,
        },
        storageStatus: 'ready',
      });
    },
  }));

export const selectLockWallet = (
  state: WalletSessionState,
) => state.lockWallet;

export const selectPersistedMeta = (
  state: WalletSessionState,
) => state.persistedMeta;

export const selectSession = (
  state: WalletSessionState,
) => state.session;

export const selectStartSession = (
  state: WalletSessionState,
) => state.startSession;

export const selectStorageStatus = (
  state: WalletSessionState,
) => state.storageStatus;

export function bootstrapWalletSessionStore(input: {
  meta: WalletMeta | null;
  status: 'corrupted' | 'missing' | 'ready';
}) {
  if (useWalletSessionStore.getState().session) {
    return;
  }

  useWalletSessionStore.setState({
    persistedMeta: input.meta,
    storageStatus: input.status,
  });
}

export function configureWalletSessionVault(
  sessionVault: WalletSessionVaultPort,
) {
  useWalletSessionStore.getState().setSessionVault(
    sessionVault,
  );
}

export function readProtectedRouteRedirect() {
  const { persistedMeta, session } =
    useWalletSessionStore.getState();

  if (session) {
    return null;
  }

  return persistedMeta ? '/unlock' : '/';
}

function clearActiveSession(
  state: WalletSessionState,
) {
  const sessionId = state.session?.sessionId;

  if (sessionId && state.sessionVault) {
    state.sessionVault.clear(sessionId);
  }
}
