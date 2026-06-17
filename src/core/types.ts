export type TransactionStatus = 'UNVERIFIED' | 'CHECKED';

export interface TlvNode {
  tag: string;
  length: number;
  value: string;
  children?: TlvNode[];
}

export interface MerchantInfo {
  merchantName?: string;
  merchantCity?: string;
  merchantCategoryCode?: string;
  countryCode?: string;
  pointOfInitiationMethod?: string;
  merchantAccountTag?: string;
  merchantAccountProvider?: string;
  merchantAccountGui?: string;
}

export interface MerchantConfig {
  id?: string;
  staticPayload: string;
  merchantInfo: MerchantInfo;
  maxAmount: number;
  savedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocalTransaction {
  id: string;
  merchantId?: string;
  baseAmount?: number;
  uniqueCode?: number;
  amount: number;
  qrisPayload: string;
  createdAt: string;
  status: TransactionStatus;
  checkedAt?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  merchantInfo?: MerchantInfo;
}
