import type { PropsWithChildren } from 'react';
import { AppServicesProvider } from '@/app/providers/app-services-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/app/providers/query-client';
import { SessionAutoLock } from '@/app/providers/session-auto-lock';

export function AppProviders({
  children,
}: PropsWithChildren) {
  return (
    <AppServicesProvider>
      <QueryClientProvider client={queryClient}>
        <SessionAutoLock>{children}</SessionAutoLock>
      </QueryClientProvider>
    </AppServicesProvider>
  );
}
