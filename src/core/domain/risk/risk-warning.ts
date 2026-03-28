export type RiskCode =
  | 'new-address'
  | 'raw-address'
  | 'self-send'
  | 'similar-address'
  | 'uninitialized-recipient';

export interface RiskWarning {
  code: RiskCode;
  title: string;
  description: string;
  blocking: boolean;
}
