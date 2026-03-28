import { Link } from '@tanstack/react-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  House,
  Settings2,
} from 'lucide-react';
import { appNavItems } from '@/shared/config/navigation';
import { shortAddress } from '@/shared/lib/format-address';
import styles from '@/app/shell/app-shell.module.css';

export function ShellNav(props: {
  address: string;
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          <NavIcon route="/app/wallet" />
        </div>
        <div>
          <h1 className={styles.brandTitle}>
            Ethereal Vault
          </h1>
          <p className={styles.brandMeta}>
            TON Testnet
          </p>
        </div>
      </div>
      <nav className={styles.nav}>
        {appNavItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={styles.navLink}
            activeProps={{
              className: [
                styles.navLink,
                styles.navLinkActive,
              ].join(' '),
            }}
          >
            <span className={styles.navIcon}>
              <NavIcon route={item.to} />
            </span>
            <span className={styles.navLabel}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className={styles.walletCard}>
        <div className={styles.walletAvatar}>E</div>
        <div className={styles.walletCopy}>
          <p className={styles.walletName}>
            Main Vault
          </p>
          <p className={styles.walletMeta}>
            {shortAddress(props.address)}
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavIcon(props: {
  route: (typeof appNavItems)[number]['to'];
}) {
  if (props.route === '/app/send') {
    return <ArrowUpRight size={20} strokeWidth={2} />;
  }

  if (props.route === '/app/receive') {
    return <ArrowDownLeft size={20} strokeWidth={2} />;
  }

  if (props.route === '/app/settings') {
    return <Settings2 size={20} strokeWidth={2} />;
  }

  return <House size={20} strokeWidth={2} />;
}
