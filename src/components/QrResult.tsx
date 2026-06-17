import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import type { LocalTransaction } from '../core/types';

interface QrResultProps {
  transaction: LocalTransaction | null;
}

export function QrResult({ transaction }: QrResultProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy Payload');

  useEffect(() => {
    let active = true;

    async function renderQr() {
      if (!transaction) {
        setQrDataUrl('');
        return;
      }

      const url = await QRCode.toDataURL(transaction.qrisPayload, {
        errorCorrectionLevel: 'M',
        margin: 2,
        scale: 8,
        color: {
          dark: '#14213d',
          light: '#ffffff',
        },
      });

      if (active) setQrDataUrl(url);
    }

    void renderQr();

    return () => {
      active = false;
    };
  }, [transaction]);

  async function copyPayload() {
    if (!transaction) return;
    await navigator.clipboard.writeText(transaction.qrisPayload);
    setCopyLabel('Tersalin');
    window.setTimeout(() => setCopyLabel('Copy Payload'), 1400);
  }

  if (!transaction) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        QR nominal terakhir akan tampil di sini.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col items-center gap-4 rounded-md border border-slate-200 bg-white p-5">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800">
            Total QRIS Rp{transaction.amount.toLocaleString('id-ID')}
          </p>
          {typeof transaction.uniqueCode === 'number' && (
            <p className="mt-1 text-xs text-slate-500">
              Dasar Rp{(transaction.baseAmount ?? transaction.amount).toLocaleString('id-ID')} + kode unik random Rp
              {transaction.uniqueCode.toLocaleString('id-ID')}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleString('id-ID')}</p>
        </div>
        {qrDataUrl && <img className="h-64 w-64 rounded-md border border-slate-100" src={qrDataUrl} alt="QRIS nominal" />}
        <a
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          href={qrDataUrl}
          download={`qris-${transaction.amount}-${transaction.id}.png`}
        >
          Download PNG
        </a>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-800">Payload QRIS nominal</p>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            onClick={copyPayload}
          >
            {copyLabel}
          </button>
        </div>
        <textarea
          className="min-h-32 w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900"
          value={transaction.qrisPayload}
          readOnly
        />
      </div>
    </section>
  );
}
