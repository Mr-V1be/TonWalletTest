import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  selectLockWallet,
  selectSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';

const AUTO_LOCK_MS = 15 * 60 * 1000;
const RESET_THROTTLE_MS = 5_000;

export function SessionAutoLock({
  children,
}: PropsWithChildren) {
  const lockWallet = useWalletSessionStore(selectLockWallet);
  const session = useWalletSessionStore(selectSession);

  useEffect(() => {
    if (!session) {
      return;
    }

    let timeoutId = window.setTimeout(
      lockWallet,
      AUTO_LOCK_MS,
    );
    let lastResetAt = Date.now();
    const resetTimer = () => {
      const now = Date.now();

      if (now - lastResetAt < RESET_THROTTLE_MS) {
        return;
      }

      lastResetAt = now;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(
        lockWallet,
        AUTO_LOCK_MS,
      );
    };
    const events: Array<keyof WindowEventMap> = [
      'keydown',
      'mousedown',
      'scroll',
      'touchstart',
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer);
    });

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [lockWallet, session]);

  return children;
}
