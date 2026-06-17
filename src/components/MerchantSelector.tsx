import { useAppContext } from '../context/AppContext';

export function MerchantSelector() {
  const { merchants, currentMerchantId, selectMerchant, apiStatus } = useAppContext();

  if (merchants.length === 0) {
    return (
      <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-100">
        No merchant configured
      </div>
    );
  }

  return (
    <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
      <span className="hidden text-xs font-semibold uppercase text-slate-400 sm:inline">Merchant</span>
      <select
        className="min-w-0 bg-transparent text-sm font-semibold text-white outline-none"
        value={currentMerchantId ?? merchants[0]?.id ?? 'default'}
        onChange={(event) => selectMerchant(event.target.value)}
      >
        {merchants.map((merchant) => (
          <option key={merchant.id || 'default'} className="bg-shago-black" value={merchant.id || 'default'}>
            {merchant.merchantInfo.merchantName || merchant.id || 'Merchant'} · {merchant.merchantInfo.merchantCity || '-'}
          </option>
        ))}
      </select>
      <span
        className={`h-2 w-2 rounded-full ${apiStatus === 'online' ? 'bg-emerald-400' : apiStatus === 'checking' ? 'bg-amber-300' : 'bg-red-400'}`}
        title={`API ${apiStatus}`}
      />
    </label>
  );
}
