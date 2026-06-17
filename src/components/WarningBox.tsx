export function WarningBox() {
  return (
    <div className="rounded-md border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
      <p className="font-semibold">
        Gunakan hanya untuk QRIS merchant milik sendiri. Aplikasi ini tidak memverifikasi pembayaran otomatis.
      </p>
      <p className="mt-2 text-amber-100/80">
        QRIS static dapat disimpan lokal dan dikirim ke Shago API saat tersedia. Status pembayaran wajib dicek dari
        aplikasi merchant, PJP, atau bank resmi.
      </p>
    </div>
  );
}
