import type { PropsWithChildren } from 'react';
import { AppServicesProvider } from '@/app/providers/app-services-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/app/providers/query-client';
import { SessionAutoLock } from '@/app/providers/session-auto-lock';
import { I18nProvider } from '@/shared/i18n/i18n-provider';
import { AppToaster } from '@/shared/ui/app-toaster';

export function AppProviders({
  children,
}: PropsWithChildren) {
  return (
    <I18nProvider>
      <AppServicesProvider>
        <QueryClientProvider client={queryClient}>
          <SessionAutoLock>{children}</SessionAutoLock>
          <AppToaster />
        </QueryClientProvider>
      </AppServicesProvider>
    </I18nProvider>
  );
}
