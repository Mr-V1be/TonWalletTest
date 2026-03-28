import type { TransferStage } from '@/features/send-ton/send-ton-types';
import type { TransferReview } from '@/shared/lib/transfer-review';

export interface SendTonState {
  amountInput: string;
  isReviewPending: boolean;
  recipientInput: string;
  review: TransferReview | null;
  stage: TransferStage;
  submitError: string;
  transactionId: string | null;
}

type SendTonAction =
  | {
      type: 'draft-updated';
      field: 'amountInput' | 'recipientInput';
      value: string;
    }
  | { type: 'review-failed'; error: string }
  | { type: 'review-finished' }
  | { type: 'review-started' }
  | { type: 'review-succeeded'; review: TransferReview }
  | { type: 'send-broadcasted' }
  | { type: 'send-failed'; error: string }
  | { type: 'send-finished'; transactionId: string | null }
  | { type: 'send-started' };

export const initialSendTonState: SendTonState = {
  amountInput: '',
  isReviewPending: false,
  recipientInput: '',
  review: null,
  stage: 'idle',
  submitError: '',
  transactionId: null,
};

export function sendTonReducer(
  state: SendTonState,
  action: SendTonAction,
): SendTonState {
  switch (action.type) {
    case 'draft-updated':
      return {
        ...state,
        [action.field]: action.value,
        isReviewPending: false,
        review: null,
        stage: 'idle',
        submitError: '',
        transactionId: null,
      };
    case 'review-started':
      return {
        ...state,
        isReviewPending: true,
        stage: 'idle',
        submitError: '',
        transactionId: null,
      };
    case 'review-succeeded':
      return { ...state, review: action.review };
    case 'review-failed':
      return {
        ...state,
        stage: 'failed',
        submitError: action.error,
      };
    case 'review-finished':
      return { ...state, isReviewPending: false };
    case 'send-started':
      return {
        ...state,
        stage: 'submitting',
        submitError: '',
        transactionId: null,
      };
    case 'send-broadcasted':
      return { ...state, stage: 'broadcasted' };
    case 'send-failed':
      return {
        ...state,
        stage: 'failed',
        submitError: action.error,
      };
    case 'send-finished':
      return {
        ...state,
        stage: action.transactionId
          ? 'confirmed'
          : 'timeout',
        transactionId: action.transactionId,
      };
  }
}
