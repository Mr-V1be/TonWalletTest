import type { ZodType } from 'zod';

const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

interface FetchJsonWithSchemaInput<T> {
  headers?: HeadersInit;
  input: string;
  label: string;
  schema: ZodType<T>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function fetchJsonWithSchema<T>(
  input: FetchJsonWithSchemaInput<T>,
) {
  const requestSignal = createTimedSignal(
    input.signal,
    input.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(input.input, {
      headers: input.headers,
      signal: requestSignal.signal,
    });

    if (!response.ok) {
      throw new Error(
        `${input.label} request failed with status ${response.status}.`,
      );
    }

    const json = await response.json();
    const parsed = input.schema.safeParse(json);

    if (!parsed.success) {
      throw new Error(
        `${input.label} returned an unexpected response shape.`,
      );
    }

    return parsed.data;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(`${input.label} request failed.`);
  } finally {
    requestSignal.cleanup();
  }
}

function createTimedSignal(
  signal: AbortSignal | undefined,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  const abort = () => controller.abort();

  signal?.addEventListener('abort', abort, {
    once: true,
  });

  return {
    cleanup() {
      globalThis.clearTimeout(timeoutId);
      signal?.removeEventListener('abort', abort);
    },
    signal: controller.signal,
  };
}
