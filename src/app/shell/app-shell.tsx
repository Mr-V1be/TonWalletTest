import {
  useLocation,
  Outlet,
} from '@tanstack/react-router';
import {
  selectSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { ShellNav } from '@/app/shell/shell-nav';
import { shortAddress } from '@/shared/lib/format-address';
import styles from '@/app/shell/app-shell.module.css';

export function AppShell() {
  const location = useLocation();
  const session = useWalletSessionStore(selectSession);
  const sectionLabel = {
    '/app/receive': 'Receive Assets',
    '/app/send': 'Send Assets',
    '/app/settings': 'Settings',
    '/app/wallet': 'Dashboard',
  }[location.pathname] ?? 'Dashboard';

  if (!session) {
    return null;
  }

  return (
    <div className={styles.shell}>
      <ShellNav address={session.meta.address} />
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumbs}>
            <span className={styles.breadcrumbAccent}>
              Vault
            </span>
            <span className={styles.breadcrumbSlash}>
              /
            </span>
            <span className={styles.breadcrumbCurrent}>
              {sectionLabel}
            </span>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.topbarDots}>
              <span />
              <span />
              <span />
            </div>
            <span className={styles.networkBadge}>
              {shortAddress(session.meta.address)}
            </span>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
