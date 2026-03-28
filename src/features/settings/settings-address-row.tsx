import { buildAddressExplorerUrl } from '@/shared/config/blockchain-services';
import { ActionButton } from '@/shared/ui/action-button';
import { StatusPill } from '@/shared/ui/status-pill';

export function SettingsAddressRow(props: {
  address: string;
  trusted: boolean;
  onToggle: (
    address: string,
    trusted: boolean,
  ) => Promise<void>;
}) {
  const { address, trusted, onToggle } = props;

  return (
    <div className="address-row">
      <div className="cluster">
        <StatusPill tone={trusted ? 'success' : 'warning'}>
          {trusted ? 'Trusted' : 'Recent'}
        </StatusPill>
        <a
          href={buildAddressExplorerUrl(address)}
          target="_blank"
          rel="noreferrer"
          className="inline-link"
        >
          Explorer
        </a>
      </div>
      <p className="mono-block">{address}</p>
      <ActionButton
        variant="quiet"
        onClick={() => {
          void onToggle(address, trusted);
        }}
      >
        {trusted ? 'Remove trust' : 'Mark as trusted'}
      </ActionButton>
    </div>
  );
}
