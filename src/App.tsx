import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AdminSetup } from './components/AdminSetup';
import { AmountForm } from './components/AmountForm';
import { ApiDocs } from './components/ApiDocs';
import type { AppTab } from './components/BottomNav';
import { MobileLayout } from './components/MobileLayout';
import { QRISDisplay } from './components/QRISDisplay';
import { TransactionHistory } from './components/TransactionHistory';
import { WarningBox } from './components/WarningBox';
import { AppProvider, useAppContext } from './context/AppContext';
import { API_DISPLAY_URL } from './styles/theme';

export default function App() {
  return (
    <AppProvider>
      <ShagoApp />
    </AppProvider>
  );
}

function ShagoApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('generate');
  const [showQrisModal, setShowQrisModal] = useState(false);
  const { apiStatus, apiError, currentMerchant, latestTransaction, refresh } = useAppContext();

  const merchantSummary = useMemo(() => {
    if (!currentMerchant) return 'No merchant configured';
    const name = currentMerchant.merchantInfo.merchantName ?? 'Merchant';
    const city = currentMerchant.merchantInfo.merchantCity ?? '-';
    return `${name} / ${city}`;
  }, [currentMerchant]);

  return (
    <main className="min-h-screen bg-shago-black text-white">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.12),transparent_28%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-shago-black/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-shago-gradient text-sm font-black text-white shadow-red-glow">
                SG
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-black tracking-normal text-white sm:text-xl">SHAGO QRIS</h1>
                <p className="truncate text-xs text-slate-400">{merchantSummary}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:text-sm"
                onClick={() => void refresh()}
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 pt-[73px]">
          <MobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
            <div className="p-4 sm:p-6 lg:p-8">
              <ApiBanner apiStatus={apiStatus} apiError={apiError} />
              {activeTab === 'generate' && (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,460px)_minmax(320px,1fr)]">
                  <section className="rounded-md border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-white">Generate QRIS</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {currentMerchant
                          ? `${currentMerchant.merchantInfo.merchantName || 'Merchant'} - max Rp${currentMerchant.maxAmount.toLocaleString('id-ID')}`
                          : 'Setup merchant dulu untuk mode online maupun offline.'}
                      </p>
                    </div>
                    <AmountForm onGenerated={() => setShowQrisModal(true)} />
                  </section>
                  <QRISDisplay transaction={latestTransaction} merchant={currentMerchant} />
                </div>
              )}
              {activeTab === 'merchants' && (
                <div className="mx-auto max-w-3xl">
                  <AdminSetup />
                </div>
              )}
              {activeTab === 'transactions' && <TransactionHistory />}
              {activeTab === 'api' && <ApiDocs />}
              {activeTab === 'about' && <AboutPanel />}
            </div>
          </MobileLayout>
        </div>
        {showQrisModal && latestTransaction && (
          <QrisModal onClose={() => setShowQrisModal(false)}>
            <QRISDisplay transaction={latestTransaction} merchant={currentMerchant} />
          </QrisModal>
        )}
      </div>
    </main>
  );
}

function ApiBanner({ apiStatus, apiError }: { apiStatus: string; apiError: string | null }) {
  return (
    <div className="mb-4 flex flex-col gap-1 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
      <span>
      <span
        className={`mr-2 inline-flex h-2 w-2 rounded-full ${
          apiStatus === 'online' ? 'bg-emerald-400' : apiStatus === 'checking' ? 'bg-amber-300' : 'bg-red-400'
        }`}
      />
      API {apiStatus} at {API_DISPLAY_URL}
      </span>
      {apiError && <span className="text-red-200">Local fallback aktif</span>}
    </div>
  );
}

function QrisModal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-md border border-white/10 bg-shago-black p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">QRIS Berhasil Dibuat</h2>
          <button
            type="button"
            className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">About Us</h2>
        <p className="mt-1 text-sm text-slate-400">Shago QRIS untuk membuat QRIS nominal secara cepat, sederhana, dan tetap bisa offline.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Produk</p>
          <p className="mt-2 text-sm text-slate-300">Aplikasi Shago QRIS mengubah QRIS static merchant menjadi QRIS nominal/dynamic untuk operasional kasir.</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Mode kerja</p>
          <p className="mt-2 text-sm text-slate-300">Saat API online, transaksi dikirim ke backend. Saat API mati, QRIS tetap dibuat di browser dan disimpan lokal.</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Backend</p>
          <p className="mt-2 break-words text-sm text-slate-300">{API_DISPLAY_URL}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Verifikasi</p>
          <p className="mt-2 text-sm text-slate-300">Status pembayaran tetap wajib dicek manual melalui aplikasi merchant, PJP, atau bank resmi.</p>
        </div>
      </div>
      <WarningBox />
    </section>
  );
}
