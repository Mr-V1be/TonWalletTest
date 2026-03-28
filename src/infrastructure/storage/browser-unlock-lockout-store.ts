import type {
  UnlockLockoutStatus,
  UnlockLockoutStore,
} from '@/core/application/ports/unlock-lockout-store';

const BASE_DELAY_MS = 2_000;
const LOCKOUT_KEY = 'ton-wallet:unlock-lockout:v1';
const MAX_ATTEMPTS = 5;
const MAX_DELAY_MS = 5 * 60 * 1_000;

interface LockoutRecord {
  attempts: number;
  lockedUntil: number;
}

export class BrowserUnlockLockoutStore
  implements UnlockLockoutStore
{
  async getStatus(): Promise<UnlockLockoutStatus> {
    const record = readRecord();

    if (!record) {
      return {
        isLocked: false,
        retryAfterMs: 0,
      };
    }

    const retryAfterMs = Math.max(
      0,
      record.lockedUntil - Date.now(),
    );

    return {
      isLocked: retryAfterMs > 0,
      retryAfterMs,
    };
  }

  async recordFailure() {
    const current = readRecord();
    const attempts = (current?.attempts ?? 0) + 1;
    const delayMs =
      attempts < MAX_ATTEMPTS
        ? 0
        : Math.min(
            BASE_DELAY_MS *
              2 ** (attempts - MAX_ATTEMPTS),
            MAX_DELAY_MS,
          );

    writeRecord({
      attempts,
      lockedUntil: Date.now() + delayMs,
    });
  }

  async reset() {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(LOCKOUT_KEY);
  }
}

function readRecord() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue =
    window.localStorage.getItem(LOCKOUT_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!isLockoutRecord(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeRecord(record: LockoutRecord) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    LOCKOUT_KEY,
    JSON.stringify(record),
  );
}

function isLockoutRecord(
  value: unknown,
): value is LockoutRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'attempts' in value &&
    'lockedUntil' in value &&
    typeof value.attempts === 'number' &&
    typeof value.lockedUntil === 'number'
  );
}
