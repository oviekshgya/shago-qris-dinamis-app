import { useMemo, useState } from 'react';
import { decodeQrPayloadFromImage } from '../core/qrImageDecoder';
import { validateQrisStatic } from '../core/validator';
import type { MerchantConfig } from '../core/types';

interface AdminSetupProps {
  merchantConfig: MerchantConfig | null;
  onSave: (config: MerchantConfig) => void;
  onReset: () => void;
}

const DEFAULT_MAX_AMOUNT = 10_000_000;

export function AdminSetup({ merchantConfig, onSave, onReset }: AdminSetupProps) {
  const [payload, setPayload] = useState(merchantConfig?.staticPayload ?? '');
  const [maxAmount, setMaxAmount] = useState(String(merchantConfig?.maxAmount ?? DEFAULT_MAX_AMOUNT));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const validation = useMemo(() => validateQrisStatic(payload), [payload]);

  function handleSave() {
    const checked = validateQrisStatic(payload);
    const parsedMaxAmount = Number(maxAmount);

    if (!checked.valid || !checked.merchantInfo) return;
    if (!Number.isFinite(parsedMaxAmount) || parsedMaxAmount < 1000) return;

    onSave({
      staticPayload: payload.trim(),
      merchantInfo: checked.merchantInfo,
      maxAmount: parsedMaxAmount,
      savedAt: new Date().toISOString(),
    });
  }

  async function handleQrUpload(event: React.ChangeEvent<HTMLInputElement>) {
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
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <label className="text-sm font-medium text-slate-800" htmlFor="qris-image">
          Upload gambar QRIS static
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="qris-image"
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/bmp"
            onChange={handleQrUpload}
            disabled={isDecoding}
          />
          {isDecoding && <span className="text-sm text-slate-500">Membaca QR...</span>}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Gambar diproses di browser ini saja. Payload hasil scan tetap harus lolos validasi QRIS static dan CRC.
        </p>
        {uploadError && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{uploadError}</div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-800" htmlFor="static-qris">
          Payload QRIS static merchant
        </label>
        <textarea
          id="static-qris"
          className="mt-2 min-h-40 w-full resize-y rounded-md border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 outline-none ring-mint/30 transition focus:border-mint focus:ring-4"
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          placeholder="Tempel payload QRIS static milik merchant sendiri"
          spellCheck={false}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div>
          <label className="text-sm font-medium text-slate-800" htmlFor="max-amount">
            Nominal maksimal
          </label>
          <input
            id="max-amount"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-mint/30 focus:border-mint focus:ring-4"
            inputMode="numeric"
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value.replace(/[^\d]/g, ''))}
          />
        </div>

        {validation.merchantInfo && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <Info label="Merchant" value={validation.merchantInfo.merchantName} />
              <Info label="Provider" value={validation.merchantInfo.merchantAccountProvider} />
              <Info label="Provider ID" value={validation.merchantInfo.merchantAccountGui} />
              <Info label="Kota" value={validation.merchantInfo.merchantCity} />
              <Info label="MCC" value={validation.merchantInfo.merchantCategoryCode} />
              <Info label="Country" value={validation.merchantInfo.countryCode} />
            </div>
          </div>
        )}
      </div>

      {payload.trim() && !validation.valid && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {validation.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {merchantConfig && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          QRIS merchant sudah tersimpan lokal pada {new Date(merchantConfig.savedAt).toLocaleString('id-ID')}.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!validation.valid || Number(maxAmount) < 1000}
          onClick={handleSave}
        >
          Simpan QRIS Merchant
        </button>
        <button
          type="button"
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          onClick={onReset}
        >
          Reset QRIS Merchant
        </button>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value || '-'}</p>
    </div>
  );
}
