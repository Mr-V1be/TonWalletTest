import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReceiveTonPage } from '@/features/receive-ton/receive-ton-page';
import { useWalletSessionStore } from '@/features/unlock-wallet/wallet-session-store';

vi.mock('@/features/receive-ton/receive-ton-qr', () => ({
  ReceiveTonQr: () => <div>QR mock</div>,
}));

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

describe('ReceiveTonPage', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
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

  it('copies address and shows explorer link', async () => {
    const user = userEvent.setup();
    render(<ReceiveTonPage />);

    await user.click(
      screen.getByRole('button', {
        name: 'Copy address',
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByText('Address copied to clipboard.'),
      ).toBeInTheDocument(),
    );

    expect(
      screen.getByRole('link', {
        name: 'View address in testnet explorer',
      }),
    ).toHaveAttribute(
      'href',
      `https://testnet.tonviewer.com/${encodeURIComponent(session.meta.address)}`,
    );
  });
});
