import { ActionButton } from '@/shared/ui/action-button';
import { useI18n } from '@/shared/i18n/i18n-provider';

interface LockWalletSectionProps {
  onLock(): void;
}

export function LockWalletSection(
  props: LockWalletSectionProps,
) {
  const { t } = useI18n();

  return (
    <section className="bg-surface-low rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="m-0 font-headline font-extrabold text-base leading-tight">
        {t('settings.lockWallet')}
      </h2>
      <ActionButton
        className="!min-h-10 !px-4 !text-sm"
        variant="secondary"
        onClick={props.onLock}
      >
        {t('settings.lockWallet')}
      </ActionButton>
    </section>
  );
}
