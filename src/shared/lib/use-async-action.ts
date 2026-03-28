import {
  useCallback,
  useRef,
  useState,
} from 'react';
import { readError } from '@/shared/lib/read-error';

export type AsyncActionResult<T> =
  | { ok: true; data: T }
  | { ok: false };

export function useAsyncAction<T>(
  action: () => Promise<T>,
  fallbackError: string,
) {
  return createAsyncActionState(
    action,
    fallbackError,
  );
}

function createAsyncActionState<T>(
  action: () => Promise<T>,
  fallbackError: string,
) {
  const actionRef = useRef(action);
  const fallbackRef = useRef(fallbackError);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  actionRef.current = action;
  fallbackRef.current = fallbackError;

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const run = useCallback(async () => {
    setError('');
    setIsPending(true);

    try {
      return {
        ok: true,
        data: await actionRef.current(),
      } satisfies AsyncActionResult<T>;
    } catch (nextError) {
      setError(
        readError(nextError, fallbackRef.current),
      );
      return { ok: false } satisfies AsyncActionResult<T>;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    clearError,
    error,
    isPending,
    run,
  };
}
