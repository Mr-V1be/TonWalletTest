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
import { SendTonPage } from '@/features/send-ton/send-ton-page';
import { useWalletSessionStore } from '@/features/unlock-wallet/wallet-session-store';

const session = {
  meta: {
    address:
      '0QAU7whfZW_H1lyTXrdNlH63HrHwIbGJ05EZzp3iknlET-kr',
    createdAt: '2026-03-27T00:00:00.000Z',
    network: 'testnet' as const,
    walletVersion: 'v5r1' as const,
  },
  sessionId: 'test-session',
};

const testnetTransfer = {
  broadcastTransfer: vi.fn(),
  reviewTransfer: vi.fn(),
  waitForTransferConfirmation: vi.fn(),
} satisfies AppServices['transfer']['testnetTransfer'];

const readGateway = {
  getBalance: vi.fn(),
  getTransactions: vi.fn(),
  getWalletSnapshot: vi.fn(),
} satisfies AppServices['blockchain']['readGateway'];

const walletCore = {
  createWallet: vi.fn(),
  importWallet: vi.fn(),
  unlockWallet: vi.fn(),
} satisfies AppServices['walletCore'];

const recipientBook = {
  appendRecentRecipient: vi.fn(),
  readSnapshot: vi.fn(),
  setTrustedAddress: vi.fn(),
} satisfies AppServices['recipientBook'];

describe('SendTonPage', () => {
  beforeEach(() => {
    testnetTransfer.broadcastTransfer.mockReset();
    testnetTransfer.reviewTransfer.mockReset();
    testnetTransfer.waitForTransferConfirmation.mockReset();
    useWalletSessionStore.setState({
      persistedMeta: session.meta,
      session,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
    useWalletSessionStore.setState({
      persistedMeta: null,
      session: null,
    });
  });

  it('reviews, sends and exposes explorer link for confirmed transfer', async () => {
    const user = userEvent.setup();
    testnetTransfer.reviewTransfer.mockResolvedValue({
      amountTon: '1.25',
      blockingErrors: [],
      bounce: true,
      normalizedAddress:
        '0QCX_h8bS7bQZxYJdbeXvU4LwM2dR5j8s5jE9riL1x4x4x4x',
      warnings: [],
    });
    testnetTransfer.broadcastTransfer.mockResolvedValue({
      expectedSeqno: 1,
      previousTopTransactionId: null,
    });
    testnetTransfer.waitForTransferConfirmation.mockResolvedValue(
      'confirmed-hash',
    );

    const services: AppServices = {
      blockchain: {
        readGateway,
      },
      recipientBook,
      transfer: {
        testnetTransfer,
      },
      walletCore,
    };

    render(
      <AppServicesProvider services={services}>
        <SendTonPage />
      </AppServicesProvider>,
    );

    await user.type(
      screen.getByLabelText('Recipient address'),
      '0QCX_h8bS7bQZxYJdbeXvU4LwM2dR5j8s5jE9riL1x4x4x4x',
    );
    await user.type(
      screen.getByLabelText('Amount'),
      '1.25',
    );
    await user.click(
      screen.getByRole('button', {
        name: 'Review transfer',
      }),
    );

    await screen.findByText('Confirm transfer');
    expect(
      testnetTransfer.reviewTransfer,
    ).toHaveBeenCalledWith({
      amountInput: '1.25',
      recipientInput:
        '0QCX_h8bS7bQZxYJdbeXvU4LwM2dR5j8s5jE9riL1x4x4x4x',
      senderAddress: session.meta.address,
      signal: expect.any(AbortSignal),
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Send TON',
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('link', {
          name: 'View confirmed transaction in testnet explorer',
        }),
      ).toHaveAttribute(
        'href',
        'https://testnet.tonviewer.com/transaction/confirmed-hash',
      ),
    );
    expect(
      testnetTransfer.waitForTransferConfirmation,
    ).toHaveBeenCalledWith({
      expectedSeqno: 1,
      previousTopTransactionId: null,
      session,
      signal: expect.any(AbortSignal),
    });
  });
});
