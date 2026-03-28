import { Address, toNano } from '@ton/ton';
import type { RecipientBookSnapshot } from '@/core/application/ports/recipient-book-port';
import type { RiskWarning } from '@/core/domain/risk/risk-warning';

const reserveNano = toNano('0.05');
const warningCopy: Record<
  RiskWarning['code'],
  {
    description: string;
    title: string;
  }
> = {
  'new-address': {
    description:
      'This address is not in your recent or trusted recipients yet.',
    title: 'New address',
  },
  'raw-address': {
    description:
      'Raw TON addresses are harder to visually verify than friendly testnet format.',
    title: 'Raw address format',
  },
  'self-send': {
    description:
      'You are about to send TON back to the same wallet.',
    title: 'Sending to yourself',
  },
  'similar-address': {
    description:
      'This address shares the same edges as a known recipient but is not identical.',
    title: 'Similar recent address',
  },
  'uninitialized-recipient': {
    description:
      'The recipient account is not active yet and may deploy on first incoming transfer.',
    title: 'Recipient is not initialized',
  },
};

export interface ParsedRecipient {
  canonical: string;
}

export interface RecipientParseResult {
  blockingErrors: string[];
  recipient: ParsedRecipient | null;
  warnings: RiskWarning[];
}

export interface TransferReview {
  amountTon: string | null;
  blockingErrors: string[];
  bounce: boolean;
  normalizedAddress: string | null;
  warnings: RiskWarning[];
}

export function buildKnownAddressSet(
  snapshot: RecipientBookSnapshot,
) {
  return new Set([
    ...snapshot.recentRecipients,
    ...snapshot.trustedAddresses,
  ]);
}

export function createWarning(
  code: RiskWarning['code'],
): RiskWarning {
  return {
    blocking: false,
    code,
    description: warningCopy[code].description,
    title: warningCopy[code].title,
  };
}

export function looksSimilar(left: string, right: string) {
  return (
    left !== right &&
    left.slice(0, 8) === right.slice(0, 8) &&
    left.slice(-6) === right.slice(-6)
  );
}

export function normalizeAmount(input: string) {
  const blockingErrors: string[] = [];
  const normalized = input.trim().replace(/,/g, '.');

  if (!normalized) {
    blockingErrors.push('Amount is required.');
    return { amountTon: null, blockingErrors };
  }

  try {
    if (toNano(normalized) <= 0n) {
      blockingErrors.push(
        'Amount must be greater than zero.',
      );
      return { amountTon: null, blockingErrors };
    }

    return { amountTon: normalized, blockingErrors };
  } catch {
    blockingErrors.push('Amount format is invalid.');
    return { amountTon: null, blockingErrors };
  }
}

export function parseRecipient(
  input: string,
): RecipientParseResult {
  const blockingErrors: string[] = [];
  const warnings: RiskWarning[] = [];
  const value = input.trim();

  try {
    if (Address.isFriendly(value)) {
      const parsed = Address.parseFriendly(value);

      if (!parsed.isTestOnly) {
        blockingErrors.push(
          'Recipient address is not marked as testnet.',
        );
      }

      return {
        blockingErrors,
        recipient: {
          canonical: parsed.address.toString({
            bounceable: false,
            testOnly: true,
          }),
        },
        warnings,
      };
    }

    if (Address.isRaw(value)) {
      warnings.push(createWarning('raw-address'));

      return {
        blockingErrors,
        recipient: {
          canonical: Address.parseRaw(value).toString({
            bounceable: false,
            testOnly: true,
          }),
        },
        warnings,
      };
    }

    return {
      blockingErrors,
      recipient: {
        canonical: Address.parse(value).toString({
          bounceable: false,
          testOnly: true,
        }),
      },
      warnings,
    };
  } catch {
    blockingErrors.push('Recipient address is invalid.');
    return {
      blockingErrors,
      recipient: null,
      warnings,
    };
  }
}

export function requiredReserveNano() {
  return reserveNano;
}
