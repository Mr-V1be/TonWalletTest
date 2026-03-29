import { useMemo, useState } from 'react';
import { Key, Trash2 } from 'lucide-react';
import {
  clearToncenterApiKey,
  readToncenterApiKeyState,
  saveToncenterApiKey,
  verifyToncenterApiKey,
} from '@/shared/config/toncenter-config';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { translateErrorMessage } from '@/shared/i18n/translate-error-message';
import { readError } from '@/shared/lib/read-error';
import { ActionButton } from '@/shared/ui/action-button';
import { toast } from 'sonner';

export function ToncenterApiKeySection() {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const apiKeyState = useMemo(
    () => readToncenterApiKeyState(),
    [refreshKey],
  );

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      const normalized = await verifyToncenterApiKey(
        input,
      );

      saveToncenterApiKey(normalized);
      setInput('');
      setRefreshKey((current) => current + 1);
      toast.success(t('settings.apiKeySaved'));
    } catch (error) {
      toast.error(
        translateErrorMessage(
          readError(
            error,
            t('error.toncenterApiKeyValidation'),
          ),
          t,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    clearToncenterApiKey();
    setInput('');
    setRefreshKey((current) => current + 1);
    toast.success(t('settings.apiKeyRemoved'));
  };

  return (
    <section className="bg-surface-low rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 font-headline font-extrabold text-base leading-tight">
          {t('settings.toncenterApiKey')}
        </h2>
        {apiKeyState.source !== 'none' ? (
          <span className="flex items-center gap-1.5 px-2.5 h-6 rounded-full bg-success-soft text-success text-[0.7rem] font-bold">
            <Key size={10} />
            {apiKeyState.source === 'env' ? 'ENV' : maskApiKey(apiKeyState.apiKey)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          aria-label={t('settings.toncenterApiKey')}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 min-w-0 h-10 px-3 bg-[rgba(38,42,51,0.92)] text-text text-sm border border-[rgba(63,72,81,0.25)] rounded-[0.75rem] outline-none placeholder:text-text-soft font-mono"
          placeholder={t('settings.toncenterApiKeyPlaceholder')}
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
        />
        <div className="flex gap-2">
          <ActionButton
            className="!min-h-10 !px-4 !text-sm"
            disabled={isSubmitting || !input.trim()}
            onClick={handleSave}
          >
            {isSubmitting ? t('common.loading') : t('settings.saveApiKey')}
          </ActionButton>
          {apiKeyState.source === 'local' ? (
            <button
              type="button"
              className="shrink-0 w-10 h-10 grid place-items-center rounded-[0.5rem] border-0 bg-surface-soft text-text-soft hover:text-danger hover:bg-danger-soft cursor-pointer transition-colors"
              onClick={handleClear}
            >
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function maskApiKey(value: string) {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
