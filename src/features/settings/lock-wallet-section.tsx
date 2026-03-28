import { ActionButton } from '@/shared/ui/action-button';

interface LockWalletSectionProps {
  onLock(): void;
}

export function LockWalletSection(
  props: LockWalletSectionProps,
) {
  return (
    <section className="card-shell settings-card">
      <p className="card-shellEyebrow">Manual control</p>
      <h2 className="card-shellTitle">Lock wallet</h2>
      <div className="settings-lockRow">
        <ActionButton
          variant="secondary"
          onClick={props.onLock}
        >
          Lock wallet
        </ActionButton>
      </div>
    </section>
  );
}
