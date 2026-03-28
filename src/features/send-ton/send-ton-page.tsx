import { SendTonStatusCard } from '@/features/send-ton/send-ton-status-card';
import { TransferSections } from '@/features/send-ton/send-ton-sections';
import { useSendTonController } from '@/features/send-ton/use-send-ton-controller';
import { ActionButton } from '@/shared/ui/action-button';

export function SendTonPage() {
  const controller = useSendTonController();

  return (
    <div className="send-shell">
      <header className="page-hero">
        <p className="page-kicker">Vault / Send assets</p>
        <h1 className="page-title">Transfer TON</h1>
      </header>
      <section className="send-card">
        <div className="stack-lg">
          <div className="stack-md">
            <label className="stitchField">
              <span className="stitchLabel">Recipient address</span>
              <input
                aria-label="Recipient address"
                className="stitchInput"
                placeholder="Paste a TON testnet address"
                disabled={controller.isReviewPending || controller.isSending}
                value={controller.recipientInput}
                onChange={(event) => controller.setRecipientInput(event.target.value)}
              />
              <div className="stitchHintRow">
                <span>Review</span>
                <span>
                  {controller.review?.warnings.length
                    ? 'Warnings'
                    : 'Testnet'}
                </span>
              </div>
            </label>
            <label className="stitchField">
              <span className="stitchLabel">Amount</span>
              <input
                aria-label="Amount"
                className="stitchInput stitchInputLg"
                placeholder="0.00"
                disabled={controller.isReviewPending || controller.isSending}
                value={controller.amountInput}
                onChange={(event) => controller.setAmountInput(event.target.value)}
              />
              <div className="stitchHintRow">
                <span>Reserve</span>
                <span>0.05 TON</span>
              </div>
            </label>
          </div>
          <TransferSections review={controller.review} stage={controller.stage} />
          <div className="send-summary">
            <div className="transaction-row">
              <span className="section-copy">Network fee</span>
              <span className="mono-block">~0.05 TON</span>
            </div>
            <div className="transaction-row">
              <span className="section-copy">Estimated time</span>
              <span className="mono-block">&lt; 30 seconds</span>
            </div>
          </div>
          <SendTonStatusCard
            stage={controller.stage}
            submitError={controller.submitError}
            transactionId={controller.transactionId}
          />
          <div className="cluster">
            <ActionButton
              disabled={controller.isReviewPending || controller.isSending}
              onClick={controller.handleReview}
            >
              {controller.isReviewPending ? 'Reviewing...' : 'Review transfer'}
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
              {controller.isSending ? 'Sending...' : 'Send TON'}
            </ActionButton>
          </div>
        </div>
      </section>
    </div>
  );
}
