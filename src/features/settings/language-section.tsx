import { useI18n } from '@/shared/i18n/i18n-provider';

export function LanguageSection() {
  const { language, setLanguage, t } = useI18n();

  return (
    <section className="bg-surface-low rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="m-0 font-headline font-extrabold text-base leading-tight">
        {t('settings.language')}
      </h2>
      <div className="inline-flex gap-1 p-1 bg-surface-muted rounded-full">
        <button
          type="button"
          className={[
            'min-w-12 h-9 px-4 border-0 rounded-full cursor-pointer text-sm font-bold transition-colors duration-150',
            language === 'en'
              ? 'bg-accent text-white'
              : 'bg-transparent text-text-soft hover:bg-surface-soft',
          ].join(' ')}
          onClick={() => setLanguage('en')}
        >
          {t('lang.en')}
        </button>
        <button
          type="button"
          className={[
            'min-w-12 h-9 px-4 border-0 rounded-full cursor-pointer text-sm font-bold transition-colors duration-150',
            language === 'ru'
              ? 'bg-accent text-white'
              : 'bg-transparent text-text-soft hover:bg-surface-soft',
          ].join(' ')}
          onClick={() => setLanguage('ru')}
        >
          {t('lang.ru')}
        </button>
      </div>
    </section>
  );
}
