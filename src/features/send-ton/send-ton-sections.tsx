import { useEffect, useState } from 'react';
import { fromNano } from '@ton/ton';
import { TriangleAlert } from 'lucide-react';
import { useAppServices } from '@/app/providers/app-services-provider';
import type { TransferStage } from '@/features/send-ton/send-ton-types';
import { buildAddressExplorerUrl } from '@/shared/config/blockchain-services';
import {
  requiredReserveNano,
  type TransferReview,
} from '@/shared/lib/transfer-review';
import { ActionButton } from '@/shared/ui/action-button';
import { StatusPill } from '@/shared/ui/status-pill';

export function TransferSections(props: {
  review: TransferReview | null;
  stage: TransferStage;
}) {
  const { recipientBook } = useAppServices();
  const { review, stage } = props;
  const [trustState, setTrustState] = useState<
    'idle' | 'saved' | 'failed'
  >('idle');
  const confirmedAddress =
    review?.normalizedAddress ?? null;

  useEffect(() => {
    setTrustState('idle');
  }, [review?.normalizedAddress]);

  return (
    <div className="review-stack">
      {review?.blockingErrors.length ? (
        <section className="card-shell card-shellWarning">
          <div className="warning-head">
            <div className="warning-icon">
              <TriangleAlert size={18} strokeWidth={2.1} />
            </div>
            <div className="stack-sm">
              <p className="card-shellEyebrow">Blocking</p>
              <h2 className="card-shellTitle">
                Fix before sending
              </h2>
            </div>
          </div>
          <div className="warning-list">
            {review.blockingErrors.map((item) => (
              <article key={item} className="warning-item">
                <p className="warning-itemTitle">{item}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {review?.warnings.length ? (
        <section className="card-shell card-shellWarning">
          <div className="warning-head">
            <div className="warning-icon">
              <TriangleAlert size={18} strokeWidth={2.1} />
            </div>
            <div className="stack-sm">
              <p className="card-shellEyebrow">
                Review carefully
              </p>
              <h2 className="card-shellTitle">
                Risk warnings
              </h2>
            </div>
          </div>
          <div className="stack-sm">
            <div className="cluster">
              {review.warnings.map((item) => (
                <StatusPill
                  key={item.code}
                  tone="warning"
                >
                  {item.title}
                </StatusPill>
              ))}
            </div>
            <div className="warning-list">
              {review.warnings.map((item) => (
                <article
                  key={item.code}
                  className="warning-item"
                >
                  <p className="warning-itemTitle">
                    {item.title}
                  </p>
                </article>
              ))}
            </div>
            <div className="review-addressBox">
              <p className="mono-block">
                {review.normalizedAddress}
              </p>
            </div>
          </div>
        </section>
      ) : null}
      {review &&
      !review.blockingErrors.length &&
      confirmedAddress &&
      review.amountTon ? (
        <section className="card-shell">
          <p className="card-shellEyebrow">Ready</p>
          <h2 className="card-shellTitle">
            Confirm transfer
          </h2>
          <div className="stack-sm">
            <div className="review-addressBox">
              <p className="mono-block">
                {confirmedAddress}
              </p>
            </div>
            <div className="meta-row">
              <a
                href={buildAddressExplorerUrl(
                  confirmedAddress,
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-link"
              >
                View recipient in testnet explorer
              </a>
            </div>
            <p className="section-copy">Amount: {review.amountTon} TON</p>
            <p className="section-copy">Reserve: {fromNano(requiredReserveNano())} TON</p>
            <div className="review-actions">
              <ActionButton
                variant="secondary"
                onClick={() =>
                  trustAddress(
                    recipientBook,
                    confirmedAddress,
                    setTrustState,
                  )
                }
              >
                Save as trusted
              </ActionButton>
              {trustState === 'saved' ? (
                <span className="section-copy">
                  Recipient saved to trusted addresses.
                </span>
              ) : null}
              {trustState === 'failed' ? (
                <span className="error-copy">
                  Trusted address could not be saved.
                </span>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

async function trustAddress(
  recipientBook: ReturnType<
    typeof useAppServices
  >['recipientBook'],
  address: string,
  setTrustState: (value: 'idle' | 'saved' | 'failed') => void,
) {
  try {
    await recipientBook.setTrustedAddress(
      address,
      true,
    );
    setTrustState('saved');
  } catch {
    setTrustState('failed');
  }
}
