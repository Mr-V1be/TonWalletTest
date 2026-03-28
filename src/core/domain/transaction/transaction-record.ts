export interface TransactionRecord {
  id: string;
  direction: 'incoming' | 'outgoing';
  amountTon: string;
  counterparty: string;
  status: 'confirmed' | 'pending' | 'failed';
  createdAt: string;
  comment?: string;
}
