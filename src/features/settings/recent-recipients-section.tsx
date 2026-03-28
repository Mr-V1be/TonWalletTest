import { SettingsAddressRow } from '@/features/settings/settings-address-row';

interface RecentRecipientsSectionProps {
  recentRecipients: string[];
  trustedSet: Set<string>;
  onTrustToggle(
    address: string,
    trusted: boolean,
  ): Promise<void>;
}

export function RecentRecipientsSection(
  props: RecentRecipientsSectionProps,
) {
  return (
    <section className="card-shell settings-card">
      <p className="card-shellEyebrow">History helpers</p>
      <h2 className="card-shellTitle">Recent recipients</h2>
      {props.recentRecipients.length ? (
        <div className="address-list">
          {props.recentRecipients.map((address) => (
            <SettingsAddressRow
              key={address}
              address={address}
              trusted={props.trustedSet.has(address)}
              onToggle={props.onTrustToggle}
            />
          ))}
        </div>
      ) : (
        <p className="settings-copy">No recent recipients.</p>
      )}
    </section>
  );
}
