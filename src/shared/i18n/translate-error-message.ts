import type { TranslationKey } from '@/shared/i18n/i18n-provider';

export function translateErrorMessage(
  message: string,
  t: (
    key: TranslationKey,
    values?: Record<string, number | string>,
  ) => string,
) {
  if (!message) {
    return '';
  }

  const passcodeLengthMatch =
    message.match(
      /^Passcode must contain at least (\d+) characters\.$/,
    );
  if (passcodeLengthMatch) {
    return t('error.passcodeMin', {
      count: passcodeLengthMatch[1] ?? '',
    });
  }

  const lockoutMatch = message.match(
    /^Too many incorrect attempts\. Try again in (\d+)s\.$/,
  );
  if (lockoutMatch) {
    return t('error.lockout', {
      seconds: lockoutMatch[1] ?? '',
    });
  }

  if (
    /\b429\b/.test(message) ||
    /too many requests/i.test(message) ||
    /rate limit/i.test(message)
  ) {
    return t('error.rateLimited');
  }

  const exactMatches = new Map<string, TranslationKey>([
    ['Address book could not be loaded.', 'error.addressBookLoad'],
    ['Amount format is invalid.', 'error.amountFormatInvalid'],
    ['Amount is required.', 'error.amountRequired'],
    [
      'Amount must be greater than zero.',
      'error.amountGreaterThanZero',
    ],
    [
      'Encrypted wallet payload is corrupted.',
      'error.encryptedPayloadCorrupted',
    ],
    ['Passcode cannot contain only spaces.', 'error.passcodeSpaces'],
    ['Passcode is incorrect.', 'error.invalidPasscode'],
    ['Passcode is too common.', 'error.passcodeCommon'],
    [
      'Passcode must contain letters and numbers.',
      'error.passcodeLettersNumbers',
    ],
    ['Recipient address is invalid.', 'error.recipientInvalid'],
    [
      'Recipient address is not marked as testnet.',
      'error.recipientNotTestnet',
    ],
    [
      'Insufficient balance after the required 0.05 TON reserve.',
      'error.requiredReserve',
    ],
    ['Seed phrase is invalid.', 'error.mnemonicInvalid'],
    [
      'Seed phrase must contain 12 or 24 words.',
      'error.mnemonicWordCount',
    ],
    [
      'No encrypted wallet was found in this browser.',
      'error.noEncryptedWallet',
    ],
    [
      'Wallet metadata does not match the stored encrypted wallet.',
      'error.metadataMismatch',
    ],
    [
      'TON Center is rate limiting requests. Try again in a few seconds.',
      'error.rateLimited',
    ],
    [
      'TON Center API key is required.',
      'error.toncenterApiKeyRequired',
    ],
    [
      'TON Center API key must be 64 hex characters.',
      'error.toncenterApiKeyFormat',
    ],
    [
      'TON Center API key is invalid.',
      'error.toncenterApiKeyInvalid',
    ],
    [
      'TON Center API key is not allowed for testnet.',
      'error.toncenterApiKeyNetwork',
    ],
    [
      'TON Center API key validation failed.',
      'error.toncenterApiKeyValidation',
    ],
    ['Wallet storage is corrupted.', 'error.storageCorrupted'],
    ['Transfer review failed.', 'error.transferReviewFailed'],
    ['Transfer submission failed.', 'error.transferSubmitFailed'],
  ]);

  const key = exactMatches.get(message);

  return key ? t(key) : message;
}
