import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { TransferStage } from '@/features/send-ton/send-ton-types';
import { buildTransactionExplorerUrl } from '@/shared/config/blockchain-services';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { translateErrorMessage } from '@/shared/i18n/translate-error-message';

export function SendTonStatusCard(props: {
  stage: TransferStage;
  submitError: string;
  transactionId: string | null;
}) {
  const { stage, submitError, transactionId } = props;
  const { t } = useI18n();

  if (stage === 'idle' && !submitError) {
    return null;
  }

  if (stage === 'failed') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-[0.75rem] bg-danger-soft/60 border border-danger/20 animate-[slideUp_0.25s_ease-out]">
        <AlertCircle size={16} className="text-danger shrink-0" />
        <p className="m-0 text-[0.88rem] text-danger font-bold">
          {translateErrorMessage(submitError, t)}
        </p>
      </div>
    );
  }

  if (stage === 'confirmed' || transactionId) {
    return (
      <div className="grid gap-2 animate-[slideUp_0.25s_ease-out]">
        <div className="flex items-center gap-3 px-4 py-3 rounded-[0.75rem] bg-success-soft/60 border border-success/20">
          <CheckCircle size={16} className="text-success shrink-0" />
          <p className="m-0 text-[0.88rem] text-success font-bold">
            {t('send.status.confirmed')}
          </p>
        </div>
        {transactionId ? (
          <a
            href={buildTransactionExplorerUrl(transactionId)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-[0.5rem] bg-surface-soft text-text text-[0.82rem] font-bold self-start"
          >
            {t('send.viewConfirmed')}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[0.75rem] bg-accent-soft/40 border border-accent/20 animate-[slideUp_0.25s_ease-out]">
      <Loader2 size={16} className="text-accent-strong shrink-0 animate-spin" />
      <p className="m-0 text-[0.88rem] text-accent-strong font-bold">
        {statusLabel(stage, t)}
      </p>
    </div>
  );
}

function statusLabel(
  stage: TransferStage,
  t: ReturnType<typeof useI18n>['t'],
) {
  return {
    broadcasted: t('send.status.broadcasted'),
    confirmed: t('send.status.confirmed'),
    idle: '',
    submitting: t('send.status.submitting'),
    timeout: t('send.status.timeout'),
    failed: '',
  }[stage];
}
