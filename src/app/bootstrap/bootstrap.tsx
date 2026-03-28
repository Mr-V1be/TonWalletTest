import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/app/providers/app-providers';
import { AppRouter } from '@/app/router/app-router';
import { bootstrapWalletSessionStore } from '@/features/unlock-wallet/wallet-session-store';
import { readStoredWalletBootstrapState } from '@/infrastructure/storage/browser-wallet-store';
import '@/shared/styles/tokens.css';
import '@/shared/styles/globals.css';
import '@/shared/styles/ethereal.css';
import '@/shared/styles/layout.css';

export function bootstrap() {
  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Root container was not found');
  }

  bootstrapWalletSessionStore(
    readStoredWalletBootstrapState(),
  );
  createRoot(container).render(
    <StrictMode>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </StrictMode>,
  );
}
