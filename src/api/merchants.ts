import type { MerchantConfig } from '../core/types';
import { apiClient } from './client';

export interface MerchantListParams {
  limit?: number;
  offset?: number;
}

export interface MerchantPayload {
  staticPayload: string;
  maxAmount: number;
}

function normalizeMerchant(merchant: MerchantConfig): MerchantConfig {
  return {
    ...merchant,
    savedAt: merchant.savedAt || merchant.updatedAt || merchant.createdAt || new Date().toISOString(),
  };
}

export async function healthCheck(): Promise<{ status: string }> {
  return apiClient.request('/health');
}

export async function setupDefaultMerchant(payload: MerchantPayload): Promise<MerchantConfig> {
  return normalizeMerchant(await apiClient.request('/api/v1/merchants/setup', {
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export async function getCurrentMerchant(): Promise<MerchantConfig> {
  return normalizeMerchant(await apiClient.request('/api/v1/merchants/current'));
}

export async function resetCurrentMerchant(): Promise<{ deleted: boolean }> {
  return apiClient.request('/api/v1/merchants/current', { method: 'DELETE' });
}

export async function listMerchants(params: MerchantListParams = {}): Promise<MerchantConfig[]> {
  const search = new URLSearchParams({
    limit: String(params.limit ?? 50),
    offset: String(params.offset ?? 0),
  });
  const merchants = await apiClient.request<MerchantConfig[]>(`/api/v1/merchants?${search.toString()}`);
  return merchants.map(normalizeMerchant);
}

export async function createMerchant(merchantId: string, payload: MerchantPayload): Promise<MerchantConfig> {
  return normalizeMerchant(await apiClient.request(`/api/v1/merchants/${encodeURIComponent(merchantId)}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export async function updateMerchant(merchantId: string, payload: MerchantPayload): Promise<MerchantConfig> {
  return normalizeMerchant(await apiClient.request(`/api/v1/merchants/${encodeURIComponent(merchantId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export async function getMerchant(merchantId: string): Promise<MerchantConfig> {
  return normalizeMerchant(await apiClient.request(`/api/v1/merchants/${encodeURIComponent(merchantId)}`));
}

export async function deleteMerchant(merchantId: string): Promise<{ deleted: boolean }> {
  return apiClient.request(`/api/v1/merchants/${encodeURIComponent(merchantId)}`, { method: 'DELETE' });
}
