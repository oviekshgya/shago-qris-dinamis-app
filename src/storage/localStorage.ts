import type { LocalTransaction, MerchantConfig } from '../core/types';

const MERCHANT_KEY = 'private-qris:merchant';
const MERCHANTS_KEY = 'shago-qris:merchants';
const CURRENT_MERCHANT_ID_KEY = 'shago-qris:current-merchant-id';
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
  saveMerchants([config, ...loadMerchants().filter((merchant) => merchant.id !== config.id)]);
}

export function resetMerchantConfig(): void {
  window.localStorage.removeItem(MERCHANT_KEY);
  window.localStorage.removeItem(CURRENT_MERCHANT_ID_KEY);
}

export function loadMerchants(): MerchantConfig[] {
  const raw = window.localStorage.getItem(MERCHANTS_KEY);
  if (!raw) {
    const legacyMerchant = loadMerchantConfig();
    return legacyMerchant ? [{ ...legacyMerchant, id: legacyMerchant.id || 'default' }] : [];
  }

  try {
    return JSON.parse(raw) as MerchantConfig[];
  } catch {
    return [];
  }
}

export function saveMerchants(merchants: MerchantConfig[]): void {
  window.localStorage.setItem(MERCHANTS_KEY, JSON.stringify(merchants));
}

export function loadCurrentMerchantId(): string | null {
  return window.localStorage.getItem(CURRENT_MERCHANT_ID_KEY);
}

export function saveCurrentMerchantId(merchantId: string): void {
  window.localStorage.setItem(CURRENT_MERCHANT_ID_KEY, merchantId);
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
