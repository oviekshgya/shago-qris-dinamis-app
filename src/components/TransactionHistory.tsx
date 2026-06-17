import type { LocalTransaction } from '../core/types';

interface TransactionHistoryProps {
  transactions: LocalTransaction[];
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TransactionHistory({ transactions, onCheck, onDelete }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        Belum ada transaksi lokal.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        Status pembayaran harus dicek dari aplikasi merchant, PJP, atau bank. Aplikasi ini tidak punya webhook resmi
        dan tidak bisa mengklaim pembayaran otomatis.
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        {transactions.map((transaction) => (
          <article key={transaction.id} className="border-b border-slate-100 p-4 last:border-b-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">Rp{transaction.amount.toLocaleString('id-ID')}</p>
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
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                  onClick={() => onCheck(transaction.id)}
                >
                  Tandai Sudah Dicek Manual
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(transaction.id)}
                >
                  Hapus
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
