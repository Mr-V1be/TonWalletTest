export interface RecipientBookSnapshot {
  recentRecipients: string[];
  trustedAddresses: string[];
}

export interface RecipientBookPort {
  appendRecentRecipient(address: string): Promise<void>;
  readSnapshot(): Promise<RecipientBookSnapshot>;
  setTrustedAddress(
    address: string,
    trusted: boolean,
  ): Promise<void>;
}
