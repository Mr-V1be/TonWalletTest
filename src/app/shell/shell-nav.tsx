import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  House,
  Menu,
  Settings2,
  X,
} from 'lucide-react';
import { appNavItems } from '@/shared/config/navigation';
import { shortAddress } from '@/shared/lib/format-address';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { toast } from 'sonner';

export function ShellNav(props: {
  address: string;
}) {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCopyAddress = async () => {
    if (!props.address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(props.address);
      toast.success(t('receive.addressCopied'));
    } catch {
      toast.error(t('receive.clipboardFailed'));
    }
  };

  return (
    <>
      {/* Mobile topbar */}
      <div className="flex items-center justify-between p-4 bg-[#10151f] lg:hidden">
        <button
          type="button"
          onClick={handleCopyAddress}
          title={props.address}
          className="flex gap-2.5 items-center border-0 bg-transparent text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full grid place-items-center bg-accent text-white font-headline font-extrabold text-sm">
            T
          </div>
          <span className="text-text-soft font-mono text-[0.72rem] uppercase tracking-[0.16em]">
            {shortAddress(props.address)}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 grid place-items-center border-0 bg-transparent text-text cursor-pointer"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen ? (
        <nav className="grid gap-1 p-4 pt-0 bg-[#10151f] lg:hidden">
          {appNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3.5 min-h-[3rem] px-4 py-2.5 text-text-soft rounded-lg"
              activeProps={{
                className:
                  'flex items-center gap-3.5 min-h-[3rem] px-4 py-2.5 rounded-lg bg-accent text-white',
              }}
              onClick={() => setMobileOpen(false)}
            >
              <span className="w-5 h-5">
                <NavIcon route={item.to} />
              </span>
              <span className="text-[0.95rem] font-bold">
                {t(item.labelKey)}
              </span>
            </Link>
          ))}
        </nav>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden lg:grid fixed inset-y-0 left-0 w-72 grid-rows-[1fr_auto] gap-8 p-5 bg-[#10151f]">
        <nav className="grid content-start gap-1.5 pt-4">
          {appNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3.5 min-h-[3.4rem] px-4 py-3.5 text-text-soft rounded-lg"
              activeProps={{
                className:
                  'flex items-center gap-3.5 min-h-[3.4rem] px-4 py-3.5 rounded-lg bg-accent text-white',
              }}
            >
              <span className="w-5 h-5">
                <NavIcon route={item.to} />
              </span>
              <span className="text-[0.95rem] font-bold">
                {t(item.labelKey)}
              </span>
            </Link>
          ))}
        </nav>
        <button
          type="button"
          title={props.address}
          onClick={handleCopyAddress}
          className="w-full flex gap-3.5 items-center p-4 bg-surface-low rounded-xl border-0 text-left cursor-pointer transition-[background-color,filter,opacity] duration-150 ease-out hover:brightness-95"
        >
          <div className="w-11 h-11 rounded-full grid place-items-center bg-accent text-white font-headline font-extrabold">
            T
          </div>
          <div>
            <p className="m-0 font-headline font-extrabold">
              {t('shell.mainVault')}
            </p>
            <p className="mt-0.5 m-0 text-text-soft font-mono text-[0.72rem] uppercase tracking-[0.16em]">
              {shortAddress(props.address)}
            </p>
          </div>
        </button>
      </aside>
    </>
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
