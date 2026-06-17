import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import type { LocalTransaction, MerchantConfig } from '../core/types';

interface QRISDisplayProps {
  transaction: LocalTransaction | null;
  merchant?: MerchantConfig | null;
}

export function QRISDisplay({ transaction, merchant }: QRISDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copyLabel, setCopyLabel] = useState('Copy');

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
        color: { dark: '#0F172A', light: '#FFFFFF' },
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
    setCopyLabel('Copied');
    window.setTimeout(() => setCopyLabel('Copy'), 1400);
  }

  if (!transaction) {
    return (
      <section className="flex min-h-80 items-center justify-center rounded-md border border-dashed border-white/15 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
        Generated QRIS will appear here.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-md border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase text-red-200">{merchant?.merchantInfo.merchantName || 'SHAGO QRIS'}</p>
          <p className="mt-1 text-2xl font-bold text-white">Rp{transaction.amount.toLocaleString('id-ID')}</p>
          <p className="mt-1 text-xs text-slate-400">{new Date(transaction.createdAt).toLocaleString('id-ID')}</p>
        </div>
        {qrDataUrl && (
          <img className="h-64 w-64 rounded-md border border-white/10 bg-white p-2" src={qrDataUrl} alt="QRIS nominal" />
        )}
        <div className="grid w-full grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            onClick={copyPayload}
          >
            {copyLabel} Payload
          </button>
          <a
            className="rounded-md bg-shago-gradient px-3 py-2 text-center text-sm font-semibold text-white shadow-red-glow transition hover:opacity-95"
            href={qrDataUrl}
            download={`shago-qris-${transaction.amount}-${transaction.id}.png`}
          >
            Download PNG
          </a>
        </div>
      </div>
      <textarea
        className="min-h-24 w-full resize-y rounded-md border border-white/10 bg-shago-black/70 p-3 font-mono text-xs text-slate-300 outline-none"
        value={transaction.qrisPayload}
        readOnly
      />
    </section>
  );
}
