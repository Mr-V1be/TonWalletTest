import type { TransferStage } from '@/features/send-ton/send-ton-types';
import { buildTransactionExplorerUrl } from '@/shared/config/blockchain-services';

export function SendTonStatusCard(props: {
  stage: TransferStage;
  submitError: string;
  transactionId: string | null;
}) {
  const { stage, submitError, transactionId } = props;

  if (stage === 'idle' && !submitError) {
    return null;
  }

  return (
    <section
      className={
        stage === 'failed'
          ? 'card-shell card-shellWarning'
          : 'card-shell status-panel'
      }
    >
      <p className="card-shellEyebrow">Submission</p>
      <h2 className="card-shellTitle">
        Transfer status
      </h2>
      <p className="status-copy">
        {statusLabel(stage, submitError)}
      </p>
      {transactionId ? (
        <a
          href={buildTransactionExplorerUrl(transactionId)}
          target="_blank"
          rel="noreferrer"
          className="status-link"
        >
          View confirmed transaction in testnet explorer
        </a>
      ) : null}
    </section>
  );
}

function statusLabel(
  stage: TransferStage,
  submitError: string,
) {
  if (stage === 'failed') {
    return submitError;
  }

  return {
    broadcasted:
      'Broadcasted to the network, waiting for confirmation.',
    confirmed: 'Transfer confirmed in recent wallet activity.',
    idle: '',
    submitting: 'Preparing and submitting the signed transfer.',
    timeout:
      'Broadcast succeeded, but confirmation was not detected in time.',
  }[stage];
}
