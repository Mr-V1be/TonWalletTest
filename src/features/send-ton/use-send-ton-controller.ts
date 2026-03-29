import { useEffect, useReducer, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppServices } from '@/app/providers/app-services-provider';
import { initialSendTonState, sendTonReducer } from '@/features/send-ton/send-ton-state';
import type { TransferStage } from '@/features/send-ton/send-ton-types';
import {
  selectLockWallet,
  selectSession,
  useWalletSessionStore,
} from '@/features/unlock-wallet/wallet-session-store';
import { readError } from '@/shared/lib/read-error';
import { isAbortError } from '@/shared/utils/is-abort-error';
import { toast } from 'sonner';

export function useSendTonController() {
  const { transfer } = useAppServices();
  const navigate = useNavigate();
  const session = useWalletSessionStore(selectSession);
  const lockWallet = useWalletSessionStore(selectLockWallet);
  const [state, dispatch] = useReducer(sendTonReducer, initialSendTonState);
  const reviewControllerRef = useRef<AbortController | null>(null);
  const sendControllerRef = useRef<AbortController | null>(null);
  const reviewRequestIdRef = useRef(0);
  const sendRequestIdRef = useRef(0);

  useEffect(() => () => {
    reviewControllerRef.current?.abort();
    sendControllerRef.current?.abort();
    sendRequestIdRef.current += 1;
  }, []);

  const updateDraft = (next: { amountInput?: string; recipientInput?: string }) => {
    reviewControllerRef.current?.abort();
    reviewRequestIdRef.current += 1;
    const updatedField = 'amountInput' in next ? 'amountInput' : 'recipientInput';
    const updatedValue = next[updatedField] ?? '';

    dispatch({
      type: 'draft-updated',
      field: updatedField,
      value: updatedValue,
    });
  };

  const handleReview = async () => {
    if (!session || state.isReviewPending || isSending(state.stage)) {
      return;
    }

    const controller = new AbortController();
    const requestId = reviewRequestIdRef.current + 1;

    reviewRequestIdRef.current = requestId;
    reviewControllerRef.current?.abort();
    reviewControllerRef.current = controller;
    dispatch({ type: 'review-started' });

    try {
      const nextReview = await transfer.testnetTransfer.reviewTransfer({
        amountInput: state.amountInput,
        recipientInput: state.recipientInput,
        senderAddress: session.meta.address,
        signal: controller.signal,
      });

      if (reviewRequestIdRef.current !== requestId) {
        return;
      }

      dispatch({ type: 'review-succeeded', review: nextReview });
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      dispatch({ type: 'review-failed', error: readError(error, 'Transfer review failed.') });
    } finally {
      if (reviewRequestIdRef.current === requestId) {
        dispatch({ type: 'review-finished' });
      }
    }
  };

  const handleSend = async () => {
    if (!session || !state.review?.normalizedAddress || !state.review.amountTon || isSending(state.stage)) {
      return;
    }

    const requestId = sendRequestIdRef.current + 1;
    const controller = new AbortController();

    sendRequestIdRef.current = requestId;
    sendControllerRef.current?.abort();
    sendControllerRef.current = controller;
    dispatch({ type: 'send-started' });

    try {
      const broadcast = await transfer.testnetTransfer.broadcastTransfer(session, state.review);

      if (sendRequestIdRef.current !== requestId) {
        return;
      }

      dispatch({ type: 'send-broadcasted' });
      const confirmedTransactionId = await transfer.testnetTransfer.waitForTransferConfirmation(
        buildConfirmationInput(broadcast, session, controller.signal),
      );

      if (sendRequestIdRef.current !== requestId) {
        return;
      }

      dispatch({ type: 'send-finished', transactionId: confirmedTransactionId });
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      const errorMessage = readError(error, 'Transfer submission failed.');

      if (errorMessage.includes('no longer available')) {
        toast.error('Session expired. Please unlock again.');
        lockWallet();
        void navigate({ to: '/unlock' });
        return;
      }

      dispatch({ type: 'send-failed', error: errorMessage });
    }
  };

  return {
    amountInput: state.amountInput,
    handleReview,
    handleSend,
    isReviewPending: state.isReviewPending,
    isSending: isSending(state.stage),
    recipientInput: state.recipientInput,
    review: state.review,
    setAmountInput: (value: string) => updateDraft({ amountInput: value }),
    setRecipientInput: (value: string) => updateDraft({ recipientInput: value }),
    stage: state.stage,
    submitError: state.submitError,
    transactionId: state.transactionId,
  };
}

function isSending(stage: TransferStage) {
  return stage === 'broadcasted' || stage === 'submitting';
}

function buildConfirmationInput(
  broadcast: {
    expectedSeqno: number;
    previousTopTransactionId: string | null;
    walletPublicKey?: Uint8Array;
  },
  session: NonNullable<
    ReturnType<typeof useWalletSessionStore.getState>['session']
  >,
  signal: AbortSignal,
) {
  return {
    expectedSeqno: broadcast.expectedSeqno,
    previousTopTransactionId: broadcast.previousTopTransactionId,
    session,
    signal,
    ...(broadcast.walletPublicKey ? { walletPublicKey: broadcast.walletPublicKey } : {}),
  };
}
