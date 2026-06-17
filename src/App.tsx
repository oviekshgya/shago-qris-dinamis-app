import { useEffect, useMemo, useState } from 'react';
import { AdminSetup } from './components/AdminSetup';
import { AmountForm } from './components/AmountForm';
import { QrResult } from './components/QrResult';
import { TransactionHistory } from './components/TransactionHistory';
import { WarningBox } from './components/WarningBox';
import type { LocalTransaction, MerchantConfig } from './core/types';
import {
  loadMerchantConfig,
  loadTransactions,
  resetMerchantConfig,
  saveMerchantConfig,
  saveTransactions,
} from './storage/localStorage';

type Tab = 'setup' | 'generate' | 'history';

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'setup', label: 'Setup Merchant' },
  { id: 'generate', label: 'Generate QR' },
  { id: 'history', label: 'History' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('setup');
  const [merchantConfig, setMerchantConfig] = useState<MerchantConfig | null>(() => loadMerchantConfig());
  const [transactions, setTransactions] = useState<LocalTransaction[]>(() => loadTransactions());
  const latestTransaction = transactions[0] ?? null;

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const merchantSummary = useMemo(() => {
    if (!merchantConfig) return 'QRIS merchant belum diset';
    const name = merchantConfig.merchantInfo.merchantName ?? 'Merchant';
    const city = merchantConfig.merchantInfo.merchantCity ?? '-';
    return `${name} · ${city}`;
  }, [merchantConfig]);

  function handleSaveMerchant(config: MerchantConfig) {
    saveMerchantConfig(config);
    setMerchantConfig(config);
    setActiveTab('generate');
  }

  function handleResetMerchant() {
    resetMerchantConfig();
    setMerchantConfig(null);
  }

  function handleGenerated(transaction: LocalTransaction) {
    setTransactions((current) => [transaction, ...current]);
  }

  function handleCheck(id: string) {
    setTransactions((current) =>
      current.map((transaction) => (transaction.id === id ? { ...transaction, status: 'CHECKED' } : transaction)),
    );
  }

  function handleDelete(id: string) {
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 rounded-md border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink">Private QRIS Dynamic Generator</h1>
              <p className="mt-1 text-sm text-slate-600">{merchantSummary}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
              Client-side only · LocalStorage
            </div>
          </div>
        </header>

        <WarningBox />

        <nav className="mt-5 flex gap-2 overflow-x-auto rounded-md border border-slate-200 bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-5 grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            {activeTab === 'setup' && (
              <AdminSetup merchantConfig={merchantConfig} onSave={handleSaveMerchant} onReset={handleResetMerchant} />
            )}
            {activeTab === 'generate' && (
              <div className="space-y-5">
                <AmountForm merchantConfig={merchantConfig} transactions={transactions} onGenerated={handleGenerated} />
                <QrResult transaction={latestTransaction} />
              </div>
            )}
            {activeTab === 'history' && (
              <TransactionHistory transactions={transactions} onCheck={handleCheck} onDelete={handleDelete} />
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Batasan operasional</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Gunakan hanya untuk QRIS merchant milik sendiri.</li>
                <li>Nominal QRIS dibuat dari payload static yang tersimpan lokal.</li>
                <li>Tidak ada webhook, settlement, atau klaim pembayaran otomatis.</li>
                <li>Pembayaran wajib diverifikasi manual di kanal resmi merchant.</li>
              </ul>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Merchant aktif</h2>
              {merchantConfig ? (
                <dl className="mt-3 space-y-2 text-sm">
                  <Row label="Nama" value={merchantConfig.merchantInfo.merchantName} />
                  <Row label="Provider" value={merchantConfig.merchantInfo.merchantAccountProvider} />
                  <Row label="Kota" value={merchantConfig.merchantInfo.merchantCity} />
                  <Row label="MCC" value={merchantConfig.merchantInfo.merchantCategoryCode} />
                  <Row label="Max" value={`Rp${merchantConfig.maxAmount.toLocaleString('id-ID')}`} />
                </dl>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Belum ada QRIS merchant tersimpan.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value || '-'}</dd>
    </div>
  );
}
