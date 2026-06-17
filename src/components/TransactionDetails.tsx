import type { LocalTransaction, MerchantConfig } from '../core/types';

interface TransactionDetailsProps {
  transaction: LocalTransaction | null;
  merchant?: MerchantConfig | null;
}

export function TransactionDetails({ transaction, merchant }: TransactionDetailsProps) {
  if (!transaction) {
    return (
      <aside className="rounded-md border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-slate-400">
        Select a transaction to inspect details.
      </aside>
    );
  }

  return (
    <aside className="space-y-4 rounded-md border border-white/10 bg-white/[0.04] p-4">
      <div>
        <p className="text-xs font-semibold uppercase text-red-200">Transaction Detail</p>
        <h3 className="mt-1 text-xl font-bold text-white">Rp{transaction.amount.toLocaleString('id-ID')}</h3>
      </div>
      <dl className="grid gap-3 text-sm">
        <Row label="ID" value={transaction.id} />
        <Row label="Merchant" value={merchant?.merchantInfo.merchantName || transaction.merchantId || '-'} />
        <Row label="Base amount" value={`Rp${(transaction.baseAmount ?? transaction.amount).toLocaleString('id-ID')}`} />
        <Row label="Unique code" value={transaction.uniqueCode ? `Rp${transaction.uniqueCode.toLocaleString('id-ID')}` : '-'} />
        <Row label="Status" value={transaction.status} />
        <Row label="Created" value={new Date(transaction.createdAt).toLocaleString('id-ID')} />
        <Row label="Checked" value={transaction.checkedAt ? new Date(transaction.checkedAt).toLocaleString('id-ID') : '-'} />
      </dl>
      <textarea
        className="min-h-28 w-full resize-y rounded-md border border-white/10 bg-shago-black/70 p-3 font-mono text-xs text-slate-300"
        value={transaction.qrisPayload}
        readOnly
      />
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-words font-medium text-slate-200">{value}</dd>
    </div>
  );
}
