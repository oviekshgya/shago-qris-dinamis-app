import type { LocalTransaction, TransactionStatus } from '../core/types';
import { apiClient } from './client';

export interface GenerateQrisPayload {
  merchantId?: string;
  amount: number;
  useUniqueCode: boolean;
}

export interface TransactionListParams {
  merchantId?: string;
  status?: TransactionStatus | 'ALL';
  limit?: number;
  offset?: number;
}

export async function generateQris(payload: GenerateQrisPayload): Promise<LocalTransaction> {
  return apiClient.request('/api/v1/qris/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function generateMerchantQris(
  merchantId: string,
  payload: Omit<GenerateQrisPayload, 'merchantId'>,
): Promise<LocalTransaction> {
  return apiClient.request(`/api/v1/merchants/${encodeURIComponent(merchantId)}/qris/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listTransactions(params: TransactionListParams = {}): Promise<LocalTransaction[]> {
  const search = new URLSearchParams({
    limit: String(params.limit ?? 50),
    offset: String(params.offset ?? 0),
  });
  if (params.merchantId) search.set('merchantId', params.merchantId);
  if (params.status && params.status !== 'ALL') search.set('status', params.status);

  return apiClient.request(`/api/v1/transactions?${search.toString()}`);
}

export async function markTransactionChecked(transactionId: string): Promise<LocalTransaction> {
  return apiClient.request(`/api/v1/transactions/${encodeURIComponent(transactionId)}/checked`, { method: 'PATCH' });
}

export async function deleteTransaction(transactionId: string): Promise<{ deleted: boolean }> {
  return apiClient.request(`/api/v1/transactions/${encodeURIComponent(transactionId)}`, { method: 'DELETE' });
}
