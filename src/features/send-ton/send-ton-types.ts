export type TransferStage =
  | 'idle'
  | 'submitting'
  | 'broadcasted'
  | 'confirmed'
  | 'timeout'
  | 'failed';
