import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { parseRecipient } from '@/shared/lib/transfer-review';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { translateErrorMessage } from '@/shared/i18n/translate-error-message';
import { readError } from '@/shared/lib/read-error';
import { ActionButton } from '@/shared/ui/action-button';
import { SettingsAddressRow } from '@/features/settings/settings-address-row';
import type { RecipientBookPort } from '@/core/application/ports/recipient-book-port';
import { toast } from 'sonner';

interface TrustedAddressesSectionProps {
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
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const count = props.trustedAddresses.length;

  const handleAddTrusted = async () => {
    const parsed = parseRecipient(props.trustedInput);

    if (!parsed.recipient || parsed.blockingErrors.length > 0) {
      toast.error(
        translateErrorMessage(
          parsed.blockingErrors[0] ??
            t('settings.saveTrustFailed'),
          t,
        ),
      );
      return;
    }

    try {
      await props.recipientBook.setTrustedAddress(
        parsed.recipient.canonical,
        true,
      );
      props.onTrustedInputChange('');
      toast.success(
        parsed.warnings.length
          ? t('settings.addressSavedNormalized')
          : t('settings.addressSaved'),
      );
      await props.onSnapshotRefresh();
      setExpanded(true);
    } catch (error) {
      toast.error(
        translateErrorMessage(
          readError(error, t('settings.saveTrustFailed')),
          t,
        ),
      );
    }
  };

  return (
    <section className="bg-surface-low rounded-2xl p-5 flex flex-col gap-3">
      <h2 className="m-0 font-headline font-extrabold text-base leading-tight">
        {t('settings.trustedAddresses')}
      </h2>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          className="flex-1 min-w-0 h-10 px-3 bg-[rgba(38,42,51,0.92)] text-text text-sm border border-[rgba(63,72,81,0.25)] rounded-[0.75rem] outline-none placeholder:text-text-soft"
          placeholder={t('settings.placeholder')}
          value={props.trustedInput}
          onChange={(event) =>
            props.onTrustedInputChange(event.target.value)
          }
        />
        <ActionButton
          className="!min-h-10 !px-4 !text-sm"
          onClick={handleAddTrusted}
        >
          {t('settings.saveTrusted')}
        </ActionButton>
      </div>
      {count > 0 ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="flex items-center gap-2 h-9 px-3 rounded-[0.5rem] bg-[rgba(38,42,51,0.6)] text-text-muted text-[0.82rem] font-bold border-0 cursor-pointer self-start hover:bg-[rgba(38,42,51,0.9)] transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? t('common.hide') : t('common.show')} ({count})
            <ChevronDown
              size={14}
              className={[
                'transition-transform duration-200',
                expanded ? 'rotate-180' : '',
              ].join(' ')}
            />
          </button>
          {expanded ? (
            <div className="grid gap-1.5 animate-[slideUp_0.2s_ease-out]">
              {props.trustedAddresses.map((address) => (
                <SettingsAddressRow
                  key={address}
                  address={address}
                  trusted
                  onToggle={props.onTrustToggle}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
