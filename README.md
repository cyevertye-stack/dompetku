# DompetKu – Personal Expense Tracker

Aplikasi web modern, bersih, responsif, dan mudah digunakan untuk mencatat, mengelola, memantau, dan menganalisis pengeluaran uang pribadi dengan ekspor laporan Microsoft Excel (.xlsx) 3 Sheet profesional.

---

## 🌟 Fitur Utama

### 1. Dashboard Utama & Real-Time Analytics
- **Kartu Ringkasan Keuangan:**
  - Total pengeluaran bulan ini.
  - Total pengeluaran hari ini.
  - Total pengeluaran minggu ini (7 hari terakhir).
  - Sisa anggaran bulanan dengan indikator visual.
  - Total jumlah transaksi.
  - Kategori pengeluaran terbesar.
  - Perbandingan pengeluaran bulan ini vs bulan sebelumnya (+/- % dan status).
- **Grafik Interaktif:**
  - Grafik Tren Pengeluaran Harian (Area Chart).
  - Diagram Lingkaran Proporsi Pengeluaran per Kategori (Donut Chart).
  - Grafik Perbandingan Pengeluaran Antar Bulan (Bar Chart 6 bulan terakhir).
  - Distribusi Pengeluaran Berdasarkan Metode Pembayaran (Horizontal Bar Chart).
- **Banner Peringatan Batas Anggaran:**
  - Indikator status: *Aman*, *Mendekati Batas (>= 80%)*, dan *Melebihi Anggaran (> 100%)*.

### 2. Pencatatan & Manajemen Pengeluaran
- Tambah, edit, dan hapus transaksi dengan modal konfirmasi aman.
- Informasi lengkap transaksi:
  - Nama/keterangan pengeluaran.
  - Nominal dalam Rupiah (Rp).
  - Kategori dengan ikon & warna khusus.
  - Tanggal transaksi (date picker).
  - Metode pembayaran: Tunai, Transfer Bank, E-Wallet (GoPay, OVO, Dana, ShopeePay), Kartu Debit/Kredit, Lainnya.
  - Catatan tambahan (opsional).
- Pencarian cerdas (berdasarkan nama & catatan).
- Filter lengkap: berdasarkan kategori, metode bayar, dan filter bulan.
- Pengurutan: Terbaru, Terlama, Nominal Terbesar, Nominal Terkecil.
- Tampilan responsif: Tabel interaktif pada layar laptop/desktop dan kartu elegan yang nyaman disentuh pada HP (mobile).

### 3. Kategori Pengeluaran Kustom
- Kategori bawaan:
  1. Makanan & Minuman
  2. Transportasi
  3. Kebutuhan Kuliah
  4. Belanja
  5. Hiburan
  6. Tagihan & Utilitas
  7. Kesehatan
  8. Kebutuhan Pribadi
  9. Lain-lain
- Kemampuan menambah kategori baru dengan pilihan beragam ikon Lucide dan palet warna.
- Pengaturan batas anggaran per kategori.

### 4. Batas Anggaran & Kontrol Finansial
- Pengaturan batas anggaran bulanan menyeluruh (Global Monthly Budget).
- Pengaturan anggaran khusus per kategori kebutuhan.
- Progress bar persentase penggunaan anggaran.
- Efek perayaan konfeti interaktif saat mencatat transaksi.

### 5. Riwayat & Laporan Keuangan
- Filter periode laporan: *Bulan Ini*, *Bulan Lalu*, *Tahun Ini*, atau *Rentang Tanggal Kustom*.
- Metrik statistik: Total Pengeluaran, Rata-rata Harian, Transaksi Tunggal Terbesar, dan Total Transaksi.
- Rincian tabel & persentase pengeluaran per kategori.
- Rincian pengeluaran per metode pembayaran.

### 6. Ekspor Microsoft Excel (.xlsx) 3 Sheet Profesional
File Excel dirancang dengan format resmi Microsoft Excel (.xlsx) siap cetak dan siap diedit:
- **Sheet 1 – Dashboard Keuangan:**
  - Judul laporan & periode.
  - Ringkasan KPI keuangan (Total Pengeluaran, Total Transaksi, Rata-rata, Batas & Sisa Anggaran).
  - Rincian pengeluaran per kategori beserta persentase dan status anggarannya.
- **Sheet 2 – Detail Transaksi:**
  - Kolom: No, Tanggal, Keterangan, Kategori, Metode Pembayaran, Nominal (Rp), Catatan.
  - AutoFilter diaktifkan pada baris judul kolom.
  - Rumus Excel otomatis (`=SUM(...)`) pada baris total pengeluaran.
  - Format angka Rupiah (`"Rp "#,##0`).
  - Lebar kolom otomatis disesuaikan dan baris bergaris (zebra stripes).
- **Sheet 3 – Ringkasan Kategori:**
  - Rangkuman nama kategori, jumlah transaksi, total pengeluaran, dan persentase kontribusi.

### 7. Responsif Mobile & PWA Ready
- Bottom Navigation bar khusus mobile: *Beranda*, *Transaksi*, *FAB (+) Tambah Cepat*, *Anggaran*, dan *Laporan*.
- Tampilan kartu sentuh responsif.
- Manifest PWA terpasang (`manifest.webmanifest`), memungkinkan aplikasi dipasang (*Add to Home Screen*) pada smartphone iOS & Android.

### 8. Cadangan Data (Backup & Restore)
- Ekspor seluruh data ke file JSON dengan 1 klik.
- Pulihkan (Restore) seluruh data dari file JSON cadangan.
- Muat data contoh (demo) untuk uji coba fitur analitik dan ekspor Excel.
- Opsi pembersihan data aman dengan dialog konfirmasi.

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Pastikan Node.js v18+ sudah terpasang.**
2. **Clone repositori dan masuk ke folder:**
   ```bash
   cd "aplikasi kiki/pengeluaran"
   ```
3. **Jalankan aplikasi (Development):**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

4. **Atau jalankan Production Build:**
   ```bash
   npm run build
   npm run start
   ```

*Catatan: Secara lokal tanpa database online, aplikasi otomatis menggunakan penyimpanan permanen JSON lokal (`data/dompetku.json`) sehingga data tidak akan hilang saat aplikasi dimuat ulang.*

---

## ☁️ Rekomendasi Database Online & Panduan Deploy ke Vercel

### Rekomendasi Database Online Terbaik

Untuk deployment ke **Vercel**, database serverless berbasis **PostgreSQL** adalah pilihan standar industri:

1. **Neon Serverless PostgreSQL (neon.tech) — SANGAT DIREKOMENDASIKAN**
   - **Alasan:** Dibuat khusus untuk serverless Vercel dengan fitur connection pooling otomatis (tidak pernah mengalami koneksi habis/connection limit).
   - **Paket Gratis:** 0.5 GB storage, komputasi serverless instan, database branching tanpa batas.
   - **Integrasi Vercel:** Tersedia integrasi 1-klik di Vercel Marketplace.

2. **Supabase PostgreSQL (supabase.com) — Alternatif Visual Terbaik**
   - **Alasan:** Menyediakan PostgreSQL penuh dengan dashboard Table Editor visual yang sangat memudahkan pemula melihat dan mengedit data langsung di browser layaknya spreadsheet.
   - **Paket Gratis:** 500 MB database PostgreSQL gratis.

---

### Langkah-Langkah Deploy ke Vercel

#### Langkah 1: Buat Database Online
1. Kunjungi [neon.tech](https://neon.tech) atau [supabase.com](https://supabase.com) dan buat akun gratis.
2. Buat project baru (misalnya diberi nama `dompetku-db`).
3. Salin connection string PostgreSQL yang diberikan, contohnya:
   ```env
   DATABASE_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

#### Langkah 2: Unggah Kode ke GitHub
1. Inisialisasi git dan commit seluruh kode:
   ```bash
   git add .
   git commit -m "Initial commit DompetKu app"
   ```
2. Buat repositori baru di akun [GitHub](https://github.com) Anda (misal `dompetku`).
3. Hubungkan repositori lokal dan push ke GitHub:
   ```bash
   git remote add origin https://github.com/username/dompetku.git
   git branch -M main
   git push -u origin main
   ```

#### Langkah 3: Deploy di Vercel
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **Add New...** -> **Project**.
3. Pilih repositori `dompetku` dari daftar GitHub Anda dan klik **Import**.
4. Buka bagian **Environment Variables** sebelum klik Deploy:
   - **Key:** `DATABASE_URL`
   - **Value:** Masukkan connection string PostgreSQL dari Neon / Supabase pada Langkah 1.
5. Klik **Deploy**!
6. Dalam waktu kurang dari 1 menit, website DompetKu Anda sudah online dengan domain gratis seperti `https://dompetku.vercel.app` dan sertifikat SSL otomatis aktif.
