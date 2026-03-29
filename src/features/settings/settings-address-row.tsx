import { ExternalLink, Trash2 } from 'lucide-react';
import { buildAddressExplorerUrl } from '@/shared/config/blockchain-services';
import { shortAddress } from '@/shared/lib/format-address';

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
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[rgba(38,42,51,0.6)] rounded-[0.5rem]">
      <p className="m-0 flex-1 min-w-0 font-mono text-[0.82rem] text-text-muted truncate" title={address}>
        {shortAddress(address, 10)}
      </p>
      <a
        href={buildAddressExplorerUrl(address)}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 w-8 h-8 grid place-items-center rounded-md text-text-soft hover:text-accent-strong hover:bg-surface-soft transition-colors"
      >
        <ExternalLink size={14} />
      </a>
      <button
        type="button"
        className="shrink-0 w-8 h-8 grid place-items-center rounded-md border-0 bg-transparent text-text-soft hover:text-danger hover:bg-danger-soft cursor-pointer transition-colors"
        onClick={() => {
          void onToggle(address, trusted);
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
