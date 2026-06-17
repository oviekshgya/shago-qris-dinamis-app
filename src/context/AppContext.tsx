/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import {
  createMerchant,
  deleteMerchant as deleteMerchantApi,
  getCurrentMerchant,
  listMerchants,
  resetCurrentMerchant,
  setupDefaultMerchant,
  updateMerchant,
} from '../api/merchants';
import {
  deleteTransaction as deleteTransactionApi,
  generateMerchantQris,
  generateQris,
  listTransactions,
  markTransactionChecked,
} from '../api/qris';
import { convertStaticToDynamicPayload } from '../core/qrisConverter';
import type { LocalTransaction, MerchantConfig } from '../core/types';
import { generateUniqueCode } from '../core/uniqueCode';
import {
  loadCurrentMerchantId,
  loadMerchantConfig,
  loadMerchants,
  loadTransactions,
  resetMerchantConfig,
  saveCurrentMerchantId,
  saveMerchantConfig,
  saveMerchants,
  saveTransactions,
} from '../storage/localStorage';

type ApiStatus = 'checking' | 'online' | 'offline';

interface SaveMerchantInput {
  id?: string;
  config: MerchantConfig;
}

interface GenerateInput {
  amount: number;
  useUniqueCode: boolean;
}

interface AppContextValue {
  apiStatus: ApiStatus;
  apiError: string | null;
  merchants: MerchantConfig[];
  currentMerchant: MerchantConfig | null;
  currentMerchantId: string | null;
  transactions: LocalTransaction[];
  latestTransaction: LocalTransaction | null;
  refresh: () => Promise<void>;
  selectMerchant: (merchantId: string) => void;
  saveMerchant: (input: SaveMerchantInput) => Promise<void>;
  removeMerchant: (merchantId?: string) => Promise<void>;
  generateTransaction: (input: GenerateInput) => Promise<LocalTransaction>;
  checkTransaction: (transactionId: string) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  setTransactions: Dispatch<SetStateAction<LocalTransaction[]>>;
}

const AppContext = createContext<AppContextValue | null>(null);

function upsertMerchant(merchants: MerchantConfig[], merchant: MerchantConfig): MerchantConfig[] {
  const merchantId = merchant.id || 'default';
  return [{ ...merchant, id: merchantId }, ...merchants.filter((item) => (item.id || 'default') !== merchantId)];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const legacyMerchant = loadMerchantConfig();
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [apiError, setApiError] = useState<string | null>(null);
  const [merchants, setMerchants] = useState<MerchantConfig[]>(() => loadMerchants());
  const [currentMerchantId, setCurrentMerchantId] = useState<string | null>(
    () => loadCurrentMerchantId() || legacyMerchant?.id || (legacyMerchant ? 'default' : null),
  );
  const [transactions, setTransactions] = useState<LocalTransaction[]>(() => loadTransactions());

  const currentMerchant = useMemo(() => {
    if (!merchants.length) return legacyMerchant ? { ...legacyMerchant, id: legacyMerchant.id || 'default' } : null;
    return merchants.find((merchant) => (merchant.id || 'default') === currentMerchantId) ?? merchants[0] ?? null;
  }, [currentMerchantId, legacyMerchant, merchants]);

  const latestTransaction = transactions[0] ?? null;

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveMerchants(merchants);
  }, [merchants]);

  const refresh = useCallback(async () => {
    try {
      const [apiMerchants, apiCurrent, apiTransactions] = await Promise.all([
        listMerchants({ limit: 50, offset: 0 }),
        getCurrentMerchant().catch(() => null),
        listTransactions({ limit: 50, offset: 0 }).catch(() => []),
      ]);

      const primaryMerchant = apiCurrent ?? apiMerchants[0] ?? null;
      const mergedMerchants = primaryMerchant ? [{ ...primaryMerchant, id: primaryMerchant.id || 'default' }] : [];
      const fallbackMerchants = loadMerchants();
      const selectableMerchants = mergedMerchants.length ? mergedMerchants : fallbackMerchants;
      setMerchants((current) => (mergedMerchants.length ? mergedMerchants : current));
      if (apiCurrent?.id) {
        setCurrentMerchantId(apiCurrent.id);
        saveCurrentMerchantId(apiCurrent.id);
      } else if (!currentMerchantId && selectableMerchants[0]?.id) {
        setCurrentMerchantId(selectableMerchants[0].id);
        saveCurrentMerchantId(selectableMerchants[0].id);
      }
      if (apiTransactions.length) setTransactions(apiTransactions);
      setApiStatus('online');
      setApiError(null);
    } catch (error) {
      setApiStatus('offline');
      setApiError(error instanceof Error ? error.message : 'Backend API tidak tersedia.');
    }
  }, [currentMerchantId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function selectMerchant(merchantId: string) {
    setCurrentMerchantId(merchantId);
    saveCurrentMerchantId(merchantId);
  }

  async function saveMerchant({ id, config }: SaveMerchantInput) {
    const merchantId = id?.trim() || config.id || 'default';
    const normalizedConfig = { ...config, id: merchantId };
    let saved: MerchantConfig = normalizedConfig;

    if (apiStatus !== 'offline') {
      try {
        saved =
          merchantId === 'default'
            ? await setupDefaultMerchant({ staticPayload: config.staticPayload, maxAmount: config.maxAmount })
            : config.id
              ? await updateMerchant(merchantId, { staticPayload: config.staticPayload, maxAmount: config.maxAmount })
              : await createMerchant(merchantId, { staticPayload: config.staticPayload, maxAmount: config.maxAmount });
        setApiStatus('online');
        setApiError(null);
      } catch (error) {
        setApiStatus('offline');
        setApiError(error instanceof Error ? error.message : 'Merchant disimpan lokal karena API gagal.');
      }
    }

    const savedWithId = { ...saved, id: saved.id || merchantId };
    saveMerchantConfig(savedWithId);
    setMerchants((current) => upsertMerchant(current, savedWithId));
    setCurrentMerchantId(savedWithId.id || merchantId);
    saveCurrentMerchantId(savedWithId.id || merchantId);
  }

  async function removeMerchant(merchantId = currentMerchant?.id || 'default') {
    if (apiStatus !== 'offline') {
      try {
        if (merchantId === 'default') await resetCurrentMerchant();
        else await deleteMerchantApi(merchantId);
      } catch (error) {
        setApiStatus('offline');
        setApiError(error instanceof Error ? error.message : 'Merchant hanya dihapus lokal karena API gagal.');
      }
    }

    setMerchants((current) => current.filter((merchant) => (merchant.id || 'default') !== merchantId));
    if ((currentMerchant?.id || 'default') === merchantId) {
      resetMerchantConfig();
      const next = merchants.find((merchant) => (merchant.id || 'default') !== merchantId);
      setCurrentMerchantId(next?.id ?? null);
      if (next?.id) saveCurrentMerchantId(next.id);
    }
  }

  async function generateTransaction({ amount, useUniqueCode }: GenerateInput) {
    if (!currentMerchant) throw new Error('QRIS static merchant belum diset.');

    if (apiStatus !== 'offline') {
      try {
        const merchantId = currentMerchant.id || 'default';
        const transaction =
          merchantId === 'default'
            ? await generateQris({ merchantId, amount, useUniqueCode })
            : await generateMerchantQris(merchantId, { amount, useUniqueCode });
        setTransactions((current) => [transaction, ...current.filter((item) => item.id !== transaction.id)]);
        setApiStatus('online');
        setApiError(null);
        return transaction;
      } catch (error) {
        setApiStatus('offline');
        setApiError(error instanceof Error ? error.message : 'Backend gagal, QR dibuat lokal.');
      }
    }

    const uniqueCode = useUniqueCode ? generateUniqueCode(amount, currentMerchant.maxAmount, transactions) : undefined;
    const finalAmount = amount + (uniqueCode ?? 0);
    const transaction: LocalTransaction = {
      id: crypto.randomUUID(),
      merchantId: currentMerchant.id || 'default',
      baseAmount: amount,
      uniqueCode,
      amount: finalAmount,
      qrisPayload: convertStaticToDynamicPayload(currentMerchant.staticPayload, finalAmount),
      createdAt: new Date().toISOString(),
      status: 'UNVERIFIED',
    };
    setTransactions((current) => [transaction, ...current]);
    return transaction;
  }

  async function checkTransaction(transactionId: string) {
    if (apiStatus !== 'offline') {
      try {
        const checked = await markTransactionChecked(transactionId);
        setTransactions((current) => current.map((item) => (item.id === transactionId ? checked : item)));
        return;
      } catch (error) {
        setApiStatus('offline');
        setApiError(error instanceof Error ? error.message : 'Status disimpan lokal karena API gagal.');
      }
    }

    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, status: 'CHECKED', checkedAt: new Date().toISOString() }
          : transaction,
      ),
    );
  }

  async function deleteTransaction(transactionId: string) {
    if (apiStatus !== 'offline') {
      try {
        await deleteTransactionApi(transactionId);
      } catch (error) {
        setApiStatus('offline');
        setApiError(error instanceof Error ? error.message : 'Transaksi hanya dihapus lokal karena API gagal.');
      }
    }
    setTransactions((current) => current.filter((transaction) => transaction.id !== transactionId));
  }

  const value: AppContextValue = {
    apiStatus,
    apiError,
    merchants,
    currentMerchant,
    currentMerchantId,
    transactions,
    latestTransaction,
    refresh,
    selectMerchant,
    saveMerchant,
    removeMerchant,
    generateTransaction,
    checkTransaction,
    deleteTransaction,
    setTransactions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider.');
  return context;
}
