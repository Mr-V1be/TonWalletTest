import { SendTonStatusCard } from '@/features/send-ton/send-ton-status-card';
import { TransferSections } from '@/features/send-ton/send-ton-sections';
import { useSendTonController } from '@/features/send-ton/use-send-ton-controller';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { ActionButton } from '@/shared/ui/action-button';

export function SendTonPage() {
  const controller = useSendTonController();
  const { t } = useI18n();

  return (
    <div className="grid gap-4 max-w-[64rem]">
      <header className="grid gap-3">
        <h1 className="m-0 font-headline font-extrabold text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-[-0.06em]">
          {t('send.title')}
        </h1>
      </header>
      <section className="bg-surface-low rounded-2xl p-4 sm:p-6 grid gap-4">
        <label className="grid gap-2.5">
          <span className="text-text-muted font-headline font-bold text-[0.86rem] leading-[1.4]">
            {t('send.recipientAddress')}
          </span>
          <input
            aria-label={t('send.recipientAddress')}
            className="w-full h-[50px] px-4 border border-[rgba(63,72,81,0.25)] rounded-[0.75rem] bg-[rgba(38,42,51,0.92)] text-text outline-none"
            placeholder={t('send.recipientPlaceholder')}
            disabled={controller.isReviewPending || controller.isSending}
            value={controller.recipientInput}
            onChange={(event) => controller.setRecipientInput(event.target.value)}
          />
        </label>
        <label className="grid gap-2.5">
          <span className="text-text-muted font-headline font-bold text-[0.86rem] leading-[1.4]">
            {t('send.amount')}
          </span>
          <input
            aria-label={t('send.amount')}
            className="w-full h-[50px] px-4 border border-[rgba(63,72,81,0.25)] rounded-[0.75rem] bg-[rgba(38,42,51,0.92)] text-text outline-none font-headline font-extrabold text-[1.25rem] tracking-[-0.03em]"
            placeholder="0.00"
            disabled={controller.isReviewPending || controller.isSending}
            value={controller.amountInput}
            onChange={(event) => controller.setAmountInput(event.target.value)}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            disabled={controller.isReviewPending || controller.isSending}
            onClick={controller.handleReview}
          >
            {controller.isReviewPending ? t('send.reviewing') : t('send.reviewTransfer')}
          </ActionButton>
          <ActionButton
            variant="secondary"
            disabled={
              !controller.review ||
              controller.review.blockingErrors.length > 0 ||
              controller.isSending ||
              controller.isReviewPending
            }
            onClick={controller.handleSend}
          >
            {controller.isSending ? t('send.sending') : t('send.sendTon')}
          </ActionButton>
        </div>
      </section>
      <TransferSections review={controller.review} stage={controller.stage} />
      <SendTonStatusCard
        stage={controller.stage}
        submitError={controller.submitError}
        transactionId={controller.transactionId}
      />
    </div>
  );
}
