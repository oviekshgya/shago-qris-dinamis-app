import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { decodeQrPayloadFromImage } from '../core/qrImageDecoder';
import { validateQrisStatic } from '../core/validator';
import { useAppContext } from '../context/AppContext';

interface AdminSetupProps {
  mode?: 'compact' | 'page';
}

const DEFAULT_MAX_AMOUNT = 10_000_000;

export function AdminSetup({ mode = 'page' }: AdminSetupProps) {
  const { currentMerchant, saveMerchant, removeMerchant, apiStatus } = useAppContext();
  const [merchantId, setMerchantId] = useState('default');
  const [payload, setPayload] = useState(currentMerchant?.staticPayload ?? '');
  const [maxAmount, setMaxAmount] = useState(String(currentMerchant?.maxAmount ?? DEFAULT_MAX_AMOUNT));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const validation = useMemo(() => validateQrisStatic(payload), [payload]);

  useEffect(() => {
    if (!currentMerchant) return;
    setMerchantId('default');
    setPayload(currentMerchant.staticPayload);
    setMaxAmount(String(currentMerchant.maxAmount));
  }, [currentMerchant]);

  async function handleSave() {
    const checked = validateQrisStatic(payload);
    const parsedMaxAmount = Number(maxAmount);

    if (!checked.valid || !checked.merchantInfo) return;
    if (!Number.isFinite(parsedMaxAmount) || parsedMaxAmount < 1000) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      await saveMerchant({
        id: 'default',
        config: {
          id: 'default',
          staticPayload: payload.trim(),
          merchantInfo: checked.merchantInfo,
          maxAmount: parsedMaxAmount,
          savedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Gagal menyimpan merchant.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleQrUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setIsDecoding(true);
    setUploadError(null);

    try {
      const decodedPayload = await decodeQrPayloadFromImage(file);
      setPayload(decodedPayload);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Gagal membaca gambar QRIS.');
    } finally {
      setIsDecoding(false);
    }
  }

  return (
    <section className="space-y-5">
      {mode === 'page' && (
        <div>
          <h2 className="text-xl font-bold text-white">Merchant Management</h2>
          <p className="mt-1 text-sm text-slate-400">Simpan satu QRIS static merchant untuk mode online dan fallback lokal.</p>
        </div>
      )}

      <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <label className="text-sm font-medium text-slate-200" htmlFor="qris-image">
          Upload gambar QRIS static
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="qris-image"
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-shago-gradient file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/bmp"
            onChange={handleQrUpload}
            disabled={isDecoding}
          />
          {isDecoding && <span className="text-sm text-slate-400">Membaca QR...</span>}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Gambar diproses di browser ini saja. Payload hasil scan tetap harus lolos validasi QRIS static dan CRC.
        </p>
        {uploadError && (
          <div className="mt-3 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">{uploadError}</div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-200" htmlFor="static-qris">
          Payload QRIS static merchant
        </label>
        <textarea
          id="static-qris"
          className="mt-2 min-h-40 w-full resize-y rounded-md border border-white/10 bg-shago-black/70 p-3 font-mono text-sm text-slate-100 outline-none ring-red-500/20 transition focus:border-red-400 focus:ring-4"
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          placeholder="Tempel payload QRIS static milik merchant sendiri"
          spellCheck={false}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
        <div className="sm:max-w-[220px]">
          <label className="text-sm font-medium text-slate-200" htmlFor="max-amount">
            Nominal maksimal
          </label>
          <input
            id="max-amount"
            className="mt-2 w-full rounded-md border border-white/10 bg-shago-black/70 px-3 py-2 text-sm text-white outline-none ring-red-500/20 focus:border-red-400 focus:ring-4"
            inputMode="numeric"
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value.replace(/[^\d]/g, ''))}
          />
        </div>

        {validation.valid && validation.merchantInfo && (
          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <div className="font-medium">{validation.merchantInfo.merchantName || 'QRIS merchant'} valid.</div>
            <div className="mt-1 text-emerald-100/80">{validation.merchantInfo.merchantCity || 'Payload siap disimpan.'}</div>
          </div>
        )}
      </div>

      {payload.trim() && !validation.valid && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">
          {validation.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {currentMerchant && (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          Merchant aktif tersimpan pada {new Date(currentMerchant.savedAt).toLocaleString('id-ID')}. API {apiStatus}.
        </div>
      )}

      {saveError && <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-100">{saveError}</div>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-md bg-shago-gradient px-4 py-2 text-sm font-semibold text-white shadow-red-glow transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-700 disabled:shadow-none"
          disabled={!validation.valid || Number(maxAmount) < 1000 || isSaving}
          onClick={handleSave}
        >
          {isSaving ? 'Saving...' : 'Simpan QRIS Merchant'}
        </button>
        <button
          type="button"
          className="rounded-md border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/10"
          onClick={() => void removeMerchant(currentMerchant?.id || merchantId)}
        >
          Reset QRIS Merchant
        </button>
      </div>
    </section>
  );
}
