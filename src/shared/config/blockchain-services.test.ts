import { describe, expect, it } from 'vitest';
import {
  buildTransactionExplorerUrl,
  extractExplorerTransactionHash,
} from '@/shared/config/blockchain-services';

describe('blockchain explorer urls', () => {
  it('strips internal transaction row suffixes before building explorer urls', () => {
    const rowId =
      '8o0rCTf/I7ONQTcHvZypGYA/xUk0DhWngfzwmu0J.MVo=:outgoing:0';

    expect(
      extractExplorerTransactionHash(rowId),
    ).toBe(
      '8o0rCTf/I7ONQTcHvZypGYA/xUk0DhWngfzwmu0J.MVo=',
    );
    expect(
      buildTransactionExplorerUrl(rowId),
    ).toBe(
      'https://testnet.tonviewer.com/transaction/8o0rCTf%2FI7ONQTcHvZypGYA%2FxUk0DhWngfzwmu0J.MVo%3D',
    );
  });
});
