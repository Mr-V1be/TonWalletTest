import { describe, expect, it, vi } from 'vitest';
import {
  isToncenterRateLimitError,
  retryOnToncenterRateLimit,
} from '@/shared/lib/toncenter-rate-limit';

describe('toncenter rate limit helper', () => {
  it('retries rate-limited operations and eventually resolves', async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(
        new Error('Request failed with status code 429'),
      )
      .mockRejectedValueOnce(
        new Error('TON Center request failed with status 429.'),
      )
      .mockResolvedValue('ok');

    await expect(
      retryOnToncenterRateLimit(operation, {
        attempts: 3,
        delayMs: 1,
      }),
    ).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('normalizes final 429 into a user-facing message', async () => {
    await expect(
      retryOnToncenterRateLimit(
        () =>
          Promise.reject(
            new Error('Request failed with status code 429'),
          ),
        {
          attempts: 2,
          delayMs: 1,
        },
      ),
    ).rejects.toThrow(
      'TON Center is rate limiting requests. Try again in a few seconds.',
    );
    expect(
      isToncenterRateLimitError(
        new Error('Too Many Requests'),
      ),
    ).toBe(true);
  });
});
