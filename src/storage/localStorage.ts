import type { LocalTransaction, MerchantConfig } from '../core/types';

const MERCHANT_KEY = 'private-qris:merchant';
const TRANSACTIONS_KEY = 'private-qris:transactions';

export function loadMerchantConfig(): MerchantConfig | null {
  const raw = window.localStorage.getItem(MERCHANT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MerchantConfig;
  } catch {
    return null;
  }
}

export function saveMerchantConfig(config: MerchantConfig): void {
  window.localStorage.setItem(MERCHANT_KEY, JSON.stringify(config));
}

export function resetMerchantConfig(): void {
  window.localStorage.removeItem(MERCHANT_KEY);
}

export function loadTransactions(): LocalTransaction[] {
  const raw = window.localStorage.getItem(TRANSACTIONS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as LocalTransaction[];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: LocalTransaction[]): void {
  window.localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}
