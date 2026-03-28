export class CorruptedWalletPayloadError extends Error {
  constructor() {
    super('Stored wallet payload is corrupted.');
    this.name = 'CorruptedWalletPayloadError';
  }
}

export class CorruptedWalletRecordError extends Error {
  constructor() {
    super('Wallet storage is corrupted in this browser.');
    this.name = 'CorruptedWalletRecordError';
  }
}

export class InvalidPasscodeError extends Error {
  constructor() {
    super('Passcode is incorrect.');
    this.name = 'InvalidPasscodeError';
  }
}
