import { SettingsAddressRow } from '@/features/settings/settings-address-row';
import { useI18n } from '@/shared/i18n/i18n-provider';

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
  const { t } = useI18n();

  return (
    <section className="bg-surface-low rounded-2xl p-5 flex flex-col gap-3">
      <h2 className="m-0 font-headline font-extrabold text-base leading-tight">
        {t('settings.recentRecipients')}
      </h2>
      <div className="grid gap-3">
        {props.recentRecipients.map((address) => (
          <SettingsAddressRow
            key={address}
            address={address}
            trusted={props.trustedSet.has(address)}
            onToggle={props.onTrustToggle}
          />
        ))}
      </div>
    </section>
  );
}
