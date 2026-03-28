import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppServices } from '@/app/providers/app-services-provider';
import { AppServicesProvider } from '@/app/providers/app-services-provider';
import { BrowserRecipientBookStore } from '@/infrastructure/storage/browser-recipient-book-store';
import { BrowserWalletStore } from '@/infrastructure/storage/browser-wallet-store';
import { SettingsPage } from '@/features/settings/settings-page';
import { useWalletSessionStore } from '@/features/unlock-wallet/wallet-session-store';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<
    typeof import('@tanstack/react-router')
  >('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const store = new BrowserWalletStore();
const recipientBook = new BrowserRecipientBookStore();
const readGateway = {
  getBalance: vi.fn(),
  getTransactions: vi.fn(),
  getWalletSnapshot: vi.fn(),
} satisfies AppServices['blockchain']['readGateway'];
const meta = {
  address:
    '0QAU7whfZW_H1lyTXrdNlH63HrHwIbGJ05EZzp3iknlET-kr',
  createdAt: '2026-03-27T00:00:00.000Z',
  network: 'testnet' as const,
  walletVersion: 'v5r1' as const,
};

describe('SettingsPage', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await store.saveEncrypted(
      {
        cipherText: 'cipher',
        iv: 'iv',
        kdfSalt: 'salt',
        version: 1,
      },
      meta,
    );
    useWalletSessionStore.setState({
      persistedMeta: meta,
      session: null,
    });
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    cleanup();
    useWalletSessionStore.setState({
      persistedMeta: null,
      session: null,
    });
  });

  it('saves trusted address from settings', async () => {
    const user = userEvent.setup();
    const services: AppServices = {
      blockchain: {
        readGateway,
      },
      recipientBook,
      transfer: {
        testnetTransfer: {
          broadcastTransfer: vi.fn(),
          reviewTransfer: vi.fn(),
          waitForTransferConfirmation: vi.fn(),
        },
      },
      walletCore: {
        createWallet: vi.fn(),
        importWallet: vi.fn(),
        unlockWallet: vi.fn(),
      },
    };

    render(
      <AppServicesProvider services={services}>
        <SettingsPage />
      </AppServicesProvider>,
    );

    await user.type(
      screen.getByLabelText('Add trusted address'),
      meta.address,
    );
    await user.click(
      screen.getByRole('button', {
        name: 'Save trusted address',
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByText('Address saved as trusted.'),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getAllByText('Trusted')[0],
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        meta.address,
      ),
    ).toBeInTheDocument();
  });
});
