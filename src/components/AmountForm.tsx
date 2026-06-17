import { useEffect, useState } from 'react';
import { convertStaticToDynamicPayload } from '../core/qrisConverter';
import type { LocalTransaction, MerchantConfig } from '../core/types';
import { generateUniqueCode } from '../core/uniqueCode';
import { validateAmount } from '../core/validator';

interface AmountFormProps {
  merchantConfig: MerchantConfig | null;
  transactions: LocalTransaction[];
  onGenerated: (transaction: LocalTransaction) => void;
}

export function AmountForm({ merchantConfig, transactions, onGenerated }: AmountFormProps) {
  const [amount, setAmount] = useState('');
  const [useUniqueCode, setUseUniqueCode] = useState(true);
  const [proposedUniqueCode, setProposedUniqueCode] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount);

  useEffect(() => {
    if (!merchantConfig || !useUniqueCode || !Number.isFinite(numericAmount) || numericAmount < 1000) {
      setProposedUniqueCode(null);
      return;
    }

    try {
      setProposedUniqueCode(generateUniqueCode(numericAmount, merchantConfig.maxAmount, transactions));
    } catch {
      setProposedUniqueCode(null);
    }
  }, [merchantConfig, numericAmount, transactions, useUniqueCode]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!merchantConfig) {
      setError('QRIS static merchant belum diset. Buka tab Setup Merchant terlebih dahulu.');
      return;
    }

    const baseAmount = Number(amount);
    const amountError = validateAmount(baseAmount, merchantConfig.maxAmount);

    if (amountError) {
      setError(amountError);
      return;
    }

    try {
      const uniqueCode = useUniqueCode
        ? (proposedUniqueCode ?? generateUniqueCode(baseAmount, merchantConfig.maxAmount, transactions))
        : undefined;
      const finalAmount = baseAmount + (uniqueCode ?? 0);
      const finalAmountError = validateAmount(finalAmount, merchantConfig.maxAmount);

      if (finalAmountError) {
        setError(finalAmountError);
        return;
      }

      const qrisPayload = convertStaticToDynamicPayload(merchantConfig.staticPayload, finalAmount);
      onGenerated({
        id: crypto.randomUUID(),
        baseAmount,
        uniqueCode,
        amount: finalAmount,
        qrisPayload,
        createdAt: new Date().toISOString(),
        status: 'UNVERIFIED',
      });
      setAmount('');
      setProposedUniqueCode(null);
      setError(null);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'Gagal membuat QRIS nominal.');
    }
  }

  const previewUniqueCode = proposedUniqueCode ?? 0;
  const previewAmount = numericAmount + previewUniqueCode;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!merchantConfig && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          QRIS static merchant belum diset. Kasir belum bisa generate QR.
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-800" htmlFor="amount">
          Nominal pembayaran
        </label>
        <div className="mt-2 flex rounded-md border border-slate-300 bg-white ring-mint/30 focus-within:border-mint focus-within:ring-4">
          <span className="border-r border-slate-200 px-3 py-2 text-sm text-slate-500">Rp</span>
          <input
            id="amount"
            className="w-full rounded-r-md px-3 py-2 text-sm outline-none"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ''))}
            placeholder="15000"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Minimal Rp1.000. Maksimal Rp{(merchantConfig?.maxAmount ?? 10_000_000).toLocaleString('id-ID')}.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <input
          className="mt-1 h-4 w-4 rounded border-slate-300 text-mint focus:ring-mint"
          type="checkbox"
          checked={useUniqueCode}
          onChange={(event) => setUseUniqueCode(event.target.checked)}
        />
        <span className="text-sm text-slate-700">
          <span className="block font-medium text-slate-900">Tambahkan kode unik otomatis</span>
          <span className="mt-1 block text-xs text-slate-500">
            Kode unik random 1-99 ditambahkan ke nominal QRIS supaya pembayaran dengan nominal dasar yang sama bisa
            dibedakan saat cek manual tanpa selisih terlalu besar.
          </span>
        </span>
      </label>

      {merchantConfig && amount && (
        <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
          <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Preview QR berikutnya</p>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Nominal dasar</span>
            <span className="font-medium text-slate-900">Rp{numericAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="mt-2 flex justify-between gap-3">
            <span className="text-slate-500">Kode unik random</span>
            <span className="font-medium text-slate-900">
              {useUniqueCode && proposedUniqueCode
                ? `+Rp${proposedUniqueCode.toLocaleString('id-ID')}`
                : useUniqueCode
                  ? 'Tidak tersedia'
                  : 'Tidak dipakai'}
            </span>
          </div>
          <div className="mt-2 flex justify-between gap-3 border-t border-slate-100 pt-2">
            <span className="font-medium text-slate-900">Total QRIS</span>
            <span className="font-semibold text-ink">Rp{previewAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <button
        type="submit"
        className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!merchantConfig}
      >
        Generate QR
      </button>
    </form>
  );
}
