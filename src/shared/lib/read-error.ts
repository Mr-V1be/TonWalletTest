export function readError(
  error: unknown,
  fallback: string,
) {
  if (error instanceof AggregateError) {
    const [firstError] = error.errors;

    return readError(firstError, fallback);
  }

  if (error instanceof Error) {
    if (error.message) {
      return error.message;
    }

    if ('cause' in error) {
      return readError(error.cause, fallback);
    }
  }

  return fallback;
}
