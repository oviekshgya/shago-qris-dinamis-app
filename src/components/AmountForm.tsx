import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { generateUniqueCode } from '../core/uniqueCode';
import { validateAmount } from '../core/validator';
import { useAppContext } from '../context/AppContext';

interface AmountFormProps {
  onGenerated?: () => void;
}

export function AmountForm({ onGenerated }: AmountFormProps) {
  const { currentMerchant, transactions, generateTransaction, apiStatus } = useAppContext();
  const [amount, setAmount] = useState('');
  const [useUniqueCode, setUseUniqueCode] = useState(true);
  const [proposedUniqueCode, setProposedUniqueCode] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const numericAmount = Number(amount);
  const formattedAmount = amount ? numericAmount.toLocaleString('id-ID') : '';

  useEffect(() => {
    if (!currentMerchant || !useUniqueCode || !Number.isFinite(numericAmount) || numericAmount < 1000) {
      setProposedUniqueCode(null);
      return;
    }

    try {
      setProposedUniqueCode(generateUniqueCode(numericAmount, currentMerchant.maxAmount, transactions));
    } catch {
      setProposedUniqueCode(null);
    }
  }, [currentMerchant, numericAmount, transactions, useUniqueCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentMerchant) {
      setError('QRIS static merchant belum diset. Buka tab Setup Merchant terlebih dahulu.');
      return;
    }

    const baseAmount = Number(amount);
    const amountError = validateAmount(baseAmount, currentMerchant.maxAmount);

    if (amountError) {
      setError(amountError);
      return;
    }

    setIsGenerating(true);
    try {
      await generateTransaction({ amount: baseAmount, useUniqueCode });
      setAmount('');
      setProposedUniqueCode(null);
      setError(null);
      onGenerated?.();
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'Gagal membuat QRIS nominal.');
    } finally {
      setIsGenerating(false);
    }
  }

  const previewUniqueCode = proposedUniqueCode ?? 0;
  const previewAmount = numericAmount + previewUniqueCode;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!currentMerchant && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
          QRIS static merchant belum diset. Kasir belum bisa generate QR.
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200" htmlFor="amount">
          Nominal pembayaran
        </label>
        <div className="mt-2 flex rounded-md border border-white/10 bg-shago-black/70 ring-red-500/20 focus-within:border-red-400 focus-within:ring-4">
          <span className="border-r border-white/10 px-3 py-3 text-sm text-slate-400">Rp</span>
          <input
            id="amount"
            className="w-full rounded-r-md bg-transparent px-3 py-3 text-base text-white outline-none"
            inputMode="numeric"
            value={formattedAmount}
            onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ''))}
            placeholder="15.000"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Minimal Rp1.000. Maksimal Rp{(currentMerchant?.maxAmount ?? 10_000_000).toLocaleString('id-ID')}. API {apiStatus}.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
        <input
          className="mt-1 h-4 w-4 rounded border-slate-600 text-red-600 focus:ring-red-500"
          type="checkbox"
          checked={useUniqueCode}
          onChange={(event) => setUseUniqueCode(event.target.checked)}
        />
        <span className="text-sm text-slate-300">
          <span className="block font-medium text-white">Tambahkan kode unik otomatis</span>
          <span className="mt-1 block text-xs text-slate-500">
            Kode unik random 1-99 ditambahkan ke nominal QRIS supaya pembayaran dengan nominal dasar yang sama bisa
            dibedakan saat cek manual tanpa selisih terlalu besar.
          </span>
        </span>
      </label>

      {currentMerchant && amount && (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm">
          <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Preview QR berikutnya</p>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Nominal dasar</span>
            <span className="font-medium text-white">Rp{numericAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="mt-2 flex justify-between gap-3">
            <span className="text-slate-500">Kode unik random</span>
            <span className="font-medium text-white">
              {useUniqueCode && proposedUniqueCode
                ? `+Rp${proposedUniqueCode.toLocaleString('id-ID')}`
                : useUniqueCode
                  ? 'Tidak tersedia'
                  : 'Tidak dipakai'}
            </span>
          </div>
          <div className="mt-2 flex justify-between gap-3 border-t border-white/10 pt-2">
            <span className="font-medium text-white">Total QRIS</span>
            <span className="font-semibold text-red-200">Rp{previewAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}

      {error && <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}

      <button
        type="submit"
        className="min-h-12 w-full rounded-md bg-shago-gradient px-4 py-3 text-sm font-semibold text-white shadow-red-glow transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-700 disabled:shadow-none sm:w-auto"
        disabled={!currentMerchant || isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate QRIS'}
      </button>
    </form>
  );
}
