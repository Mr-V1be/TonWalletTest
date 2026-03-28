export interface WalletSessionVaultPort {
  clear(sessionId: string): void;
  create(mnemonic: string[]): Promise<string>;
  read(sessionId: string): Promise<string[] | null>;
}
