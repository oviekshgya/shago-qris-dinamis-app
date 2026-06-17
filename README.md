# Private QRIS Dynamic Generator

Aplikasi web client-side untuk membuat QRIS nominal/dynamic dari QRIS static merchant sendiri. Aplikasi ini bukan payment gateway, bukan alat klaim pembayaran otomatis, dan bukan public converter untuk QRIS pihak lain.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

Test:

```bash
npm test
```

Lint:

```bash
npm run lint
```

## Docker

```bash
docker compose up --build
```

Aplikasi akan diserve oleh nginx di `http://localhost:8080`.

## Cara Kerja

1. Admin menempelkan payload QRIS static merchant sendiri di tab Setup Merchant.
2. Alternatifnya, admin dapat memilih gambar QRIS static; gambar didecode di browser dan tidak diupload ke server.
3. Aplikasi memvalidasi format TLV EMV QR, CRC16/CCITT-FALSE, dan menampilkan info merchant.
4. Aplikasi menampilkan nama merchant, kota, MCC, country code, dan provider identifier dari Merchant Account Info jika tersedia.
5. Payload QRIS static disimpan di LocalStorage browser.
6. Kasir memasukkan nominal di tab Generate QR.
7. Jika kode unik aktif, aplikasi menambahkan kode random 1-99 ke nominal akhir QRIS untuk membedakan pembayaran bernominal dasar sama.
8. Aplikasi mengubah tag `01` menjadi `12`, menambah atau mengubah tag `54`, menghapus CRC lama, menghitung CRC baru, lalu membuat QR PNG.

Semua proses dilakukan client-side. Tidak ada data yang dikirim ke server mana pun.

## Batasan Keamanan dan Operasional

- Gunakan hanya untuk QRIS merchant milik sendiri.
- QRIS static hanya tersimpan di browser lokal melalui LocalStorage.
- Upload gambar QRIS hanya diproses client-side untuk membaca payload dari QR.
- Tidak ada backend, webhook, autentikasi, settlement, atau verifikasi pembayaran otomatis pada MVP ini.
- Riwayat transaksi hanya catatan lokal dan tidak membuktikan pembayaran sudah diterima.
- Kode unik hanya membantu pencocokan manual berdasarkan nominal akhir, bukan verifikasi pembayaran.
- Jangan gunakan aplikasi ini sebagai public upload/converter QRIS bebas.

## Cara Cek Pembayaran Manual

Setelah pelanggan membayar QRIS nominal, buka aplikasi merchant/PJP/bank resmi milik merchant. Cocokkan nominal akhir yang mencakup kode unik, waktu transaksi, dan referensi pembayaran di kanal resmi tersebut. Setelah benar-benar ditemukan, gunakan tombol "Tandai Sudah Dicek Manual" di History.
