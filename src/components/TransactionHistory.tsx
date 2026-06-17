import { useMemo, useState } from 'react';
import type { LocalTransaction } from '../core/types';
import { useAppContext } from '../context/AppContext';
import { TransactionDetails } from './TransactionDetails';

type StatusFilter = 'ALL' | 'UNVERIFIED' | 'CHECKED';

export function TransactionHistory() {
  const { transactions, merchants, currentMerchant, checkTransaction, deleteTransaction } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [merchantFilter, setMerchantFilter] = useState(currentMerchant?.id || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(transactions[0]?.id ?? null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const created = new Date(transaction.createdAt);
      const merchant = merchants.find((item) => (item.id || 'default') === (transaction.merchantId || 'default'));
      const searchable = [
        transaction.id,
        transaction.merchantId,
        merchant?.merchantInfo.merchantName,
        transaction.amount,
        transaction.baseAmount,
        transaction.uniqueCode,
        transaction.status,
        new Date(transaction.createdAt).toLocaleString('id-ID'),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (searchQuery.trim() && !searchable.includes(searchQuery.trim().toLowerCase())) return false;
      if (statusFilter !== 'ALL' && transaction.status !== statusFilter) return false;
      if (merchantFilter !== 'ALL' && (transaction.merchantId || 'default') !== merchantFilter) return false;
      if (startDate && created < new Date(`${startDate}T00:00:00`)) return false;
      if (endDate && created > new Date(`${endDate}T23:59:59`)) return false;
      return true;
    });
  }, [endDate, merchantFilter, merchants, searchQuery, startDate, statusFilter, transactions]);

  const selectedTransaction = filteredTransactions.find((transaction) => transaction.id === selectedId) ?? filteredTransactions[0] ?? null;
  const selectedMerchant =
    merchants.find((merchant) => (merchant.id || 'default') === (selectedTransaction?.merchantId || 'default')) ?? currentMerchant;

  function exportCsv() {
    const header = ['id', 'merchantId', 'baseAmount', 'uniqueCode', 'amount', 'status', 'createdAt', 'checkedAt'];
    const rows = filteredTransactions.map((transaction) =>
      header
        .map((key) => {
          const value = transaction[key as keyof LocalTransaction] ?? '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(','),
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shago-qris-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-white/15 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
        Belum ada transaksi lokal.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
        <p className="mt-1 text-sm text-slate-400">Filter, verify, delete, and export generated QRIS records.</p>
      </div>

      <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
        Status pembayaran harus dicek dari aplikasi merchant, PJP, atau bank. Aplikasi ini tidak punya webhook resmi
        dan tidak bisa mengklaim pembayaran otomatis.
      </div>

      <div className="grid gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.4fr)_repeat(5,minmax(0,1fr))]">
        <input
          className="rounded-md border border-white/10 bg-shago-black/70 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-red-400 sm:col-span-2 lg:col-span-1"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search transaksi"
        />
        <select className="rounded-md border border-white/10 bg-shago-black/70 px-3 py-2 text-sm text-white" value={merchantFilter} onChange={(event) => setMerchantFilter(event.target.value)}>
          <option value="ALL">All merchants</option>
          {merchants.map((merchant) => (
            <option key={merchant.id || 'default'} value={merchant.id || 'default'}>
              {merchant.merchantInfo.merchantName || merchant.id}
            </option>
          ))}
        </select>
        <select className="rounded-md border border-white/10 bg-shago-black/70 px-3 py-2 text-sm text-white" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
          <option value="ALL">All status</option>
          <option value="UNVERIFIED">UNVERIFIED</option>
          <option value="CHECKED">CHECKED</option>
        </select>
        <input className="rounded-md border border-white/10 bg-shago-black/70 px-3 py-2 text-sm text-white" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <input className="rounded-md border border-white/10 bg-shago-black/70 px-3 py-2 text-sm text-white" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        <button className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10" type="button" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-md border border-white/10 bg-white/[0.04]">
          {filteredTransactions.map((transaction) => (
            <article
              key={transaction.id}
              className={`cursor-pointer border-b border-white/10 p-4 transition last:border-b-0 ${
                selectedTransaction?.id === transaction.id ? 'bg-red-500/10' : 'hover:bg-white/[0.04]'
              }`}
              onClick={() => setSelectedId(transaction.id)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">Rp{transaction.amount.toLocaleString('id-ID')}</p>
                {typeof transaction.uniqueCode === 'number' && (
                  <p className="mt-1 text-xs text-slate-500">
                    Dasar Rp{(transaction.baseAmount ?? transaction.amount).toLocaleString('id-ID')} + kode unik random
                    Rp{transaction.uniqueCode.toLocaleString('id-ID')}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleString('id-ID')}</p>
                <span
                  className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                    transaction.status === 'CHECKED'
                      ? 'bg-emerald-500/15 text-emerald-200'
                      : 'bg-amber-500/15 text-amber-100'
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border border-emerald-400/30 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/10"
                  onClick={(event) => {
                    event.stopPropagation();
                    void checkTransaction(transaction.id);
                  }}
                >
                  Tandai Sudah Dicek Manual
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/10"
                  onClick={(event) => {
                    event.stopPropagation();
                    void deleteTransaction(transaction.id);
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
            </article>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400">No transactions match the selected filters.</div>
          )}
        </div>
        <TransactionDetails transaction={selectedTransaction} merchant={selectedMerchant} />
      </div>
    </section>
  );
}
