export interface WalletSnapshot {
  balanceNano: string;
  balanceTon: string;
  isWallet: boolean;
  status: 'active' | 'frozen' | 'uninit' | 'nonexist';
}
