import { useState } from 'react';
import {
  selectSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { ReceiveTonQr } from '@/features/receive-ton/receive-ton-qr';
import { buildAddressExplorerUrl } from '@/shared/config/blockchain-services';
import { ActionButton } from '@/shared/ui/action-button';

export function ReceiveTonPage() {
  const session = useWalletSessionStore(selectSession);
  const address = session?.meta.address ?? '';
  const [copyState, setCopyState] = useState<
    'idle' | 'copied' | 'failed'
  >('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <div className="receive-shell">
      <header className="page-hero page-heroCenter">
        <p className="page-kicker">Inbound transaction</p>
        <h1 className="page-title">Receive Assets</h1>
      </header>
      <section className="receive-grid">
        <div>{address ? <ReceiveTonQr address={address} /> : null}</div>
        <div className="stack-lg">
          <section className="card-shell receive-copyCard">
            <div className="receive-cardHeader">
              <span className="receive-badge">TON</span>
            </div>
            <div className="stack-sm">
              <p className="settings-label">
                Public wallet address
              </p>
              <div className="receive-addressBox">
                <p className="mono-block">{address}</p>
              </div>
            </div>
            {copyState === 'copied' ? (
              <p className="section-copy">Address copied to clipboard.</p>
            ) : null}
            {copyState === 'failed' ? (
              <p className="error-copy">Clipboard access failed in this browser.</p>
            ) : null}
            <div className="receive-cardActions">
              <ActionButton disabled={!address} onClick={handleCopy}>
                Copy address
              </ActionButton>
              {address ? (
                <a
                  href={buildAddressExplorerUrl(address)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-link"
                >
                  View address in testnet explorer
                </a>
              ) : null}
            </div>
          </section>
          <div className="receive-metaGrid">
            <article className="mini-card">
              <p className="eyebrow">Asset type</p>
              <p className="section-title">Toncoin (TON)</p>
            </article>
            <article className="mini-card">
              <p className="eyebrow">Network</p>
              <p className="section-title">Testnet v4</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
