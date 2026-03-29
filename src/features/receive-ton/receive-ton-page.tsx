import {
  selectSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { ReceiveTonQr } from '@/features/receive-ton/receive-ton-qr';
import { buildAddressExplorerUrl } from '@/shared/config/blockchain-services';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { ActionButton } from '@/shared/ui/action-button';
import { toast } from 'sonner';

export function ReceiveTonPage() {
  const session = useWalletSessionStore(selectSession);
  const { t } = useI18n();
  const address = session?.meta.address ?? '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success(t('receive.addressCopied'));
    } catch {
      toast.error(t('receive.clipboardFailed'));
    }
  };

  return (
    <div className="grid gap-6">
      <header className="grid gap-3 text-center justify-items-center">
        <h1 className="m-0 font-headline font-extrabold text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-[-0.06em]">
          {t('receive.title')}
        </h1>
      </header>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(18rem,1fr)] items-start lg:items-stretch">
        <div>{address ? <ReceiveTonQr address={address} /> : null}</div>
        <div className="grid gap-5 h-full lg:grid-rows-[1fr_auto]">
          <section className="relative overflow-hidden bg-surface-low rounded-2xl grid gap-5 p-6 lg:h-full lg:content-start">
            <div className="grid gap-2">
              <p className="m-0 text-text-soft font-mono text-[0.72rem] font-bold tracking-[0.24em] uppercase">
                {t('receive.publicAddress')}
              </p>
              <div className="p-5 rounded-xl bg-[rgba(10,14,22,0.82)]">
                <p className="m-0 font-mono text-[0.88rem] leading-[1.6] text-text-muted break-all">
                  {address}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton disabled={!address} onClick={handleCopy}>
                {t('receive.copyAddress')}
              </ActionButton>
              {address ? (
                <a
                  href={buildAddressExplorerUrl(address)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center min-h-[45px] px-5 rounded-lg bg-surface-soft text-text font-headline font-extrabold text-center"
                >
                  {t('receive.viewExplorer')}
                </a>
              ) : null}
            </div>
          </section>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-4">
            <article className="relative overflow-hidden bg-surface-low rounded-2xl p-4">
              <p className="m-0 text-text-soft font-mono text-[0.72rem] font-extrabold uppercase tracking-[0.18em]">
                {t('receive.assetType')}
              </p>
              <p className="m-0 mt-1 font-headline text-[1.25rem] font-bold tracking-[-0.03em]">
                {t('receive.toncoin')}
              </p>
            </article>
            <article className="relative overflow-hidden bg-surface-low rounded-2xl p-4">
              <p className="m-0 text-text-soft font-mono text-[0.72rem] font-extrabold uppercase tracking-[0.18em]">
                {t('receive.network')}
              </p>
              <p className="m-0 mt-1 font-headline text-[1.25rem] font-bold tracking-[-0.03em]">
                {t('receive.networkVersion')}
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
