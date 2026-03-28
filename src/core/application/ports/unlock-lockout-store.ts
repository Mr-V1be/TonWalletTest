export interface UnlockLockoutStatus {
  isLocked: boolean;
  retryAfterMs: number;
}

export interface UnlockLockoutStore {
  getStatus(): Promise<UnlockLockoutStatus>;
  recordFailure(): Promise<void>;
  reset(): Promise<void>;
}
