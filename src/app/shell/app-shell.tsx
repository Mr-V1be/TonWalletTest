import { Outlet } from '@tanstack/react-router';
import {
  selectSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { ShellNav } from '@/app/shell/shell-nav';

export function AppShell() {
  const session = useWalletSessionStore(selectSession);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <ShellNav address={session.meta.address} />
      <div className="min-h-screen lg:pl-72">
        <main className="grid gap-6 px-4 pb-8 lg:px-10 pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
