import { useI18n } from '@/shared/i18n/i18n-provider';

export function SessionPolicySection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-surface-low rounded-2xl p-5 grid gap-2.5">
      <p className="m-0 text-accent-strong font-mono text-[0.72rem] font-bold tracking-[0.24em] uppercase">
        {t('settings.security')}
      </p>
      <h2 className="m-0 font-headline font-extrabold text-[1.35rem] leading-[1.05] tracking-[-0.04em]">
        {t('settings.sessionPolicy')}
      </h2>
      <p className="m-0 text-text-muted leading-[1.65]">
        {t('settings.currentTabOnly')} · {t('settings.autoLock')}
      </p>
    </section>
  );
}
