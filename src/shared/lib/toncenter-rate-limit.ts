const RATE_LIMIT_PATTERNS = [
  /\b429\b/,
  /too many requests/i,
  /rate limit/i,
] as const;

const TONCENTER_RATE_LIMIT_MESSAGE =
  'TON Center is rate limiting requests. Try again in a few seconds.';

export async function retryOnToncenterRateLimit<T>(
  operation: () => Promise<T>,
  options?: {
    attempts?: number;
    delayMs?: number;
  },
) {
  const attempts = options?.attempts ?? 3;
  const delayMs = options?.delayMs ?? 1500;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (
        !isToncenterRateLimitError(error) ||
        attempt === attempts - 1
      ) {
        throw toToncenterRateLimitError(error);
      }

      await sleep(delayMs * (attempt + 1));
    }
  }

  throw toToncenterRateLimitError(lastError);
}

export function isToncenterRateLimitError(
  error: unknown,
) {
  const message =
    error instanceof Error ? error.message : String(error);

  return RATE_LIMIT_PATTERNS.some((pattern) =>
    pattern.test(message),
  );
}

export function toToncenterRateLimitError(
  error: unknown,
) {
  if (isToncenterRateLimitError(error)) {
    return new Error(TONCENTER_RATE_LIMIT_MESSAGE);
  }

  return error instanceof Error
    ? error
    : new Error(String(error));
}

function sleep(durationMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}
