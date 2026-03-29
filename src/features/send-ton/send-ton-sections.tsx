import { fromNano } from '@ton/ton';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAppServices } from '@/app/providers/app-services-provider';
import type { TransferStage } from '@/features/send-ton/send-ton-types';
import { buildAddressExplorerUrl } from '@/shared/config/blockchain-services';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { translateErrorMessage } from '@/shared/i18n/translate-error-message';
import {
  requiredReserveNano,
  type TransferReview,
} from '@/shared/lib/transfer-review';
import { ActionButton } from '@/shared/ui/action-button';
import { toast } from 'sonner';

export function TransferSections(props: {
  review: TransferReview | null;
  stage: TransferStage;
}) {
  const { recipientBook } = useAppServices();
  const { t } = useI18n();
  const { review, stage } = props;
  const confirmedAddress =
    review?.normalizedAddress ?? null;

  if (!review) {
    return null;
  }

  return (
    <div className="grid gap-2 animate-[slideUp_0.25s_ease-out]">
      {review.blockingErrors.map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 px-4 py-3 rounded-[0.75rem] bg-danger-soft/60 border border-danger/20"
        >
          <AlertCircle size={16} className="text-danger shrink-0" />
          <p className="m-0 text-[0.88rem] text-danger font-bold">
            {translateErrorMessage(item, t)}
          </p>
        </div>
      ))}

      {review.warnings.map((item) => (
        <div
          key={item.code}
          className="flex items-center gap-3 px-4 py-3 rounded-[0.75rem] bg-warning-soft/60 border border-warning/20"
        >
          <ShieldAlert size={16} className="text-warning shrink-0" />
          <p className="m-0 text-[0.88rem] text-warning">
            {translateRisk(item.code, t)}
          </p>
        </div>
      ))}

      {!review.blockingErrors.length &&
      confirmedAddress &&
      review.amountTon ? (
        <div className="grid gap-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-[0.75rem] bg-success-soft/60 border border-success/20">
            <CheckCircle size={16} className="text-success shrink-0" />
            <div className="min-w-0">
              <p className="m-0 text-[0.88rem] text-success font-bold">
                {t('send.confirmTransfer')} — {review.amountTon} TON
              </p>
              <p className="m-0 text-[0.75rem] text-text-soft mt-0.5 break-all">
                {confirmedAddress}
              </p>
            </div>
          </div>
          {(() => {
            const isNew = review.warnings.some((w) => w.code === 'new-address');
            return (
              <div className={isNew ? 'grid grid-cols-2 gap-2' : 'grid gap-2'}>
                <a
                  href={buildAddressExplorerUrl(confirmedAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center min-h-[38px] px-3 rounded-[0.5rem] bg-accent text-white text-[0.78rem] font-headline font-bold text-center"
                >
                  {t('send.viewRecipient')}
                </a>
                {isNew ? (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center min-h-[38px] px-3 rounded-[0.5rem] bg-accent text-white text-[0.78rem] font-headline font-bold cursor-pointer border-0 text-center"
                    onClick={() =>
                      trustAddress(recipientBook, confirmedAddress, t)
                    }
                  >
                    {t('send.saveTrusted')}
                  </button>
                ) : null}
              </div>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}

async function trustAddress(
  recipientBook: ReturnType<
    typeof useAppServices
  >['recipientBook'],
  address: string,
  t: ReturnType<typeof useI18n>['t'],
) {
  try {
    await recipientBook.setTrustedAddress(
      address,
      true,
    );
    toast.success(t('send.recipientSaved'));
  } catch {
    toast.error(t('send.recipientSaveFailed'));
  }
}

function translateRisk(
  code: TransferReview['warnings'][number]['code'],
  t: ReturnType<typeof useI18n>['t'],
) {
  return {
    'new-address': t('risk.new-address'),
    'raw-address': t('risk.raw-address'),
    'self-send': t('risk.self-send'),
    'similar-address': t('risk.similar-address'),
    'uninitialized-recipient': t('risk.uninitialized-recipient'),
  }[code];
}
