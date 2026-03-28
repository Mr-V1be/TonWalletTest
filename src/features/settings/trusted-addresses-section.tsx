import { parseRecipient } from '@/shared/lib/transfer-review';
import { readError } from '@/shared/lib/read-error';
import { ActionButton } from '@/shared/ui/action-button';
import { TextField } from '@/shared/ui/text-field';
import { SettingsAddressRow } from '@/features/settings/settings-address-row';
import type { RecipientBookPort } from '@/core/application/ports/recipient-book-port';

interface TrustedAddressesSectionProps {
  feedback: string;
  onFeedbackChange(value: string): void;
  onSnapshotRefresh(): Promise<void>;
  recipientBook: RecipientBookPort;
  trustedAddresses: string[];
  trustedInput: string;
  onTrustedInputChange(value: string): void;
  onTrustToggle(
    address: string,
    trusted: boolean,
  ): Promise<void>;
}

export function TrustedAddressesSection(
  props: TrustedAddressesSectionProps,
) {
  const handleAddTrusted = async () => {
    const parsed = parseRecipient(props.trustedInput);

    if (!parsed.recipient || parsed.blockingErrors.length > 0) {
      props.onFeedbackChange(
        parsed.blockingErrors[0] ??
          'Trusted address could not be added.',
      );
      return;
    }

    try {
      await props.recipientBook.setTrustedAddress(
        parsed.recipient.canonical,
        true,
      );
      props.onTrustedInputChange('');
      props.onFeedbackChange(
        parsed.warnings.length
          ? 'Address was normalized and saved as trusted.'
          : 'Address saved as trusted.',
      );
      await props.onSnapshotRefresh();
    } catch (error) {
      props.onFeedbackChange(
        readError(error, 'Trusted address could not be saved.'),
      );
    }
  };

  return (
    <section className="card-shell settings-card">
      <p className="card-shellEyebrow">Address book</p>
      <h2 className="card-shellTitle">Trusted addresses</h2>
      <div className="stack-md">
        <TextField
          label="Add trusted address"
          placeholder="Paste a TON testnet address"
          value={props.trustedInput}
          onChange={(event) => {
            props.onTrustedInputChange(event.target.value);
            props.onFeedbackChange('');
          }}
        />
        <div className="settings-actions">
          <ActionButton onClick={handleAddTrusted}>
            Save trusted address
          </ActionButton>
          {props.feedback ? (
            <span className="section-copy">
              {props.feedback}
            </span>
          ) : null}
        </div>
        {props.trustedAddresses.length ? (
          <div className="address-list">
            {props.trustedAddresses.map((address) => (
              <SettingsAddressRow
                key={address}
                address={address}
                trusted
                onToggle={props.onTrustToggle}
              />
            ))}
          </div>
        ) : (
          <p className="settings-copy">
            No trusted recipients yet.
          </p>
        )}
      </div>
    </section>
  );
}
