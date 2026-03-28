import { describe, expect, it } from 'vitest';
import {
  buildKnownAddressSet,
  looksSimilar,
  normalizeAmount,
  parseRecipient,
  requiredReserveNano,
} from '@/shared/lib/transfer-review';

const testnetFriendly =
  '0QAU7whfZW_H1lyTXrdNlH63HrHwIbGJ05EZzp3iknlET-kr';
const mainnetFriendly =
  'UQDg6S-r4rdNU-PuvgSGv1SIfyEtP3m4hFkzR7g0t3ayCnIt';
const rawAddress =
  '0:14EF085F656FC7D65C935EB74D947EB71EB1F021B189D39119CE9DE29279444F';

describe('testnet transfer helpers', () => {
  it('normalizes valid testnet friendly address', () => {
    const recipient = parseRecipient(testnetFriendly);

    expect(recipient.recipient?.canonical).toBe(
      testnetFriendly,
    );
    expect(recipient.blockingErrors).toEqual([]);
    expect(recipient.warnings).toEqual([]);
  });

  it('warns for raw address and still normalizes it', () => {
    const recipient = parseRecipient(rawAddress);

    expect(recipient.recipient?.canonical).toBe(
      testnetFriendly,
    );
    expect(
      recipient.warnings.map((item) => item.code),
    ).toContain('raw-address');
  });

  it('blocks friendly address that is not marked as testnet', () => {
    const recipient = parseRecipient(mainnetFriendly);

    expect(recipient.blockingErrors).toContain(
      'Recipient address is not marked as testnet.',
    );
  });

  it('normalizes comma amount and rejects invalid amount', () => {
    const amount = normalizeAmount('1,25');
    const invalid = normalizeAmount('abc');

    expect(amount.amountTon).toBe('1.25');
    expect(requiredReserveNano()).toBeGreaterThan(0n);
    expect(invalid.amountTon).toBeNull();
    expect(invalid.blockingErrors).toContain(
      'Amount format is invalid.',
    );
  });

  it('detects similar addresses by shared edges', () => {
    const similarAddress = `${testnetFriendly.slice(0, 8)}ZZZZZZZZZZZZZZZZZZZZZZZZ${testnetFriendly.slice(-6)}`;

    expect(
      looksSimilar(testnetFriendly, similarAddress),
    ).toBe(true);
    expect(
      looksSimilar(testnetFriendly, testnetFriendly),
    ).toBe(false);
  });

  it('builds a deduplicated known-address set', () => {
    const knownAddresses = buildKnownAddressSet({
      recentRecipients: [testnetFriendly],
      trustedAddresses: [testnetFriendly, rawAddress],
    });

    expect(knownAddresses.size).toBe(2);
  });
});
