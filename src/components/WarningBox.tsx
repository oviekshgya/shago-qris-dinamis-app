export function WarningBox() {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">
        Gunakan hanya untuk QRIS merchant milik sendiri. Aplikasi ini tidak memverifikasi pembayaran otomatis.
      </p>
      <p className="mt-2">
        QRIS static disimpan hanya di browser lokal. Tidak ada data yang dikirim ke server mana pun, dan status
        pembayaran wajib dicek dari aplikasi merchant, PJP, atau bank resmi.
      </p>
    </div>
  );
}
