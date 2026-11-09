PosU - Point of Sale (Kasir Pintar)

Automated BDD & Integration Testing Implementation

PosU adalah aplikasi web Point of Sale (Kasir Pintar) berbasis cloud yang dirancang untuk mengelola transaksi penjualan, penyaringan katalog produk, dan pencatatan kasir secara real-time.

Proyek ini telah dilengkapi dengan Automated Integration & BDD (Behavior-Driven Development) Testing menggunakan kombinasi Playwright dan Cucumber.js untuk menjamin kualitas perangkat lunak secara end-to-end (E2E).

📖 Pengenalan Testing Stack

Pengujian otomatis pada proyek ini menggabungkan dua tools utama yang saling melengkapi:

1. Playwright (Browser Automation Engine)

Playwright adalah framework otomatisasi end-to-end modern besutan Microsoft yang bertindak sebagai "tangan dan mata" otomatis dalam pengujian.

Peran: Membuka browser (Chromium), menavigasi rute aplikasi, mengisi form login, mensimulasikan klik tombol, serta memeriksa keberadaan elemen UI.

Keunggulan:

Auto-Waiting: Otomatis menunggu elemen UI siap (visible & clickable) sebelum berinteraksi, meminimalkan error timeout.

Fast & Reliable: Eksekusi pengujian cepat dan konsisten di lingkungan headless maupun headed.

Network & Session Management: Mampu mengelola sesi autentikasi dan status lokal browser secara fleksibel.

2. Cucumber.js (Framework BDD & Parser Gherkin)

Cucumber.js adalah framework BDD yang berfungsi sebagai "penerjemah" spesifikasi bisnis menjadi skrip pengujian otomatis.

Peran: Membaca berkas .feature berformat Gherkin (bahasa alami manusia) dan menghubungkannya ke langkah-langkah eksekusi teknis (step definitions).

Sintaks Gherkin (Bahasa Indonesia):

Dengan (Given): Menyatakan kondisi awal / pre-condition sistem.

Ketika (When): Menyatakan aksi / interaksi pengguna pada sistem.

Maka (Then): Menyatakan hasil yang diharapkan (assertion).

Dan (And): Menambahkan validasi turunan dari kriteria hasil.

3. Sinergi Playwright + Cucumber.js

[ Berkas .feature (Gherkin) ] ──(Read)──> [ Cucumber.js ] ──(Execute)──> [ Playwright Engine ] ──(Control)──> [ Web PosU ]


Cucumber.js membaca teks spesifikasi bisnis dalam bahasa alami.

Cucumber.js memetakan teks tersebut ke fungsi JavaScript di pos_sales_steps.js.

Playwright mengeksekusi instruksi teknis secara langsung pada browser aplikasi web PosU.

🎯 Cakupan & Arsitektur Pengujian (Integration Testing)

Pengujian ini bukan sekadar mengecek elemen visual (UI testing), melainkan memvalidasi Integrasi End-to-End:

Frontend React UI: Memvalidasi re-render komponen, state keranjang belanja, badge item, dan tombol pembayaran.

Backend & Database (Supabase): Memvalidasi sesi autentikasi pengguna (login), kueri filter data katalog produk, dan kalkulasi otomatis total pembayaran.

📁 Struktur Berkas Proyek

pos-u-kasirpintar/
├── features/
│   ├── pos_sales.feature          # Skenario BDD berformat Gherkin (Bahasa Indonesia)
│   └── step_definitions/
│       └── pos_sales_steps.js     # Implementasi skrip otomatisasi Playwright
├── cucumber.js                     # Berkas konfigurasi Cucumber.js runner
├── package.json                   # Dependensi proyek & skrip npm
└── README.md                      # Dokumentasi resmi proyek & testing


🧪 Skenario Pengujian BDD (Gherkin)

Berikut adalah skenario pengujian yang terdapat dalam berkas features/pos_sales.feature:

# language: id
Fitur: Modul Sales PosU
  Sebagai Kasir
  Saya ingin mengelola transaksi penjualan di halaman Sales
  Agar proses kasir berjalan lancar dan akurat

  Skenario: Menambahkan produk ke keranjang dan memeriksa total bayar
    Dengan membuka halaman Sales PosU
    Ketika saya menambahkan satu produk yang tersedia ke keranjang
    Maka jumlah item di keranjang bertambah menjadi 1
    Dan total bayar menampilkan nilai yang lebih besar dari nol

  Skenario: Memfilter daftar produk berdasarkan kategori
    Dengan membuka halaman Sales PosU
    Ketika saya memilih kategori "Coffee"
    Maka daftar produk hanya menampilkan produk kategori Coffee


🚀 Prasyarat & Cara Menjalankan Testing

1. Cloning Repositori & Instalasi

git clone https://github.com/aenuralife/PosU-kasirpintar.git
cd PosU-kasirpintar
npm install
npx playwright install chromium


2. Konfigurasi Kredensial Testing (Opsional)

Pengujian menyertakan fitur auto-login. Secara bawaan kredensial telah terkonfigurasi, namun Anda juga dapat mengaturnya via Environment Variables:

# Windows PowerShell
$env:POSU_TEST_EMAIL="alipmust420@gmail.com"
$env:POSU_TEST_PASSWORD="password"


3. Eksekusi Testing

Jalankan perintah berikut di terminal:

npm run test:bdd


📊 Hasil Eksekusi & Laporan Testing

Pengujian berjalan 100% PASS tanpa hambatan (zero failures):

> pos@0.0.0 test:bdd
> cucumber-js

...........

2 scenarios (2 passed)
7 steps (7 passed)
0m16.127s (executing steps: 0m16.081s)


Rincian Analisis Eksekusi Step BDD:

Skenario 1: Menambahkan produk ke keranjang dan memeriksa total bayar

Dengan membuka halaman Sales PosU (PASS)

Playwright membuka browser, menangani autentikasi login Supabase, dan memastikan dasbor kasir termuat.

Ketika saya menambahkan satu produk yang tersedia ke keranjang (PASS)

Simulasi klik pada kartu produk di grid UI untuk memicu event handler penambahan item.

Maka jumlah item di keranjang bertambah menjadi 1 (PASS)

Memvalidasi hilangnya pesan "Keranjang masih kosong" dan pembaruan badge keranjang menjadi 1 item.

Dan total bayar menampilkan nilai yang lebih besar dari nol (PASS)

Memvalidasi kalkulasi aritmatika total bayar pada tombol Bayar (berubah dari Bayar Rp 0 menjadi nominal harga produk).

Skenario 2: Memfilter daftar produk berdasarkan kategori

Dengan membuka halaman Sales PosU (PASS)

Memastikan halaman kasir siap dalam status bersih (fresh state).

Ketika saya memilih kategori "Coffee" (PASS)

Simulasi klik tombol filter kategori "Coffee".

Maka daftar produk hanya menampilkan produk kategori Coffee (PASS)

Memvalidasi kueri dan pembaruan katalog produk sesuai kategori yang dipilih.

📌 Informasi Pengumpulan Tugas

Mata Kuliah: Analisis dan Pengujian Sistem

Target Aplikasi: PosU Kasir Pintar (Vercel App)

Luaran Utama (Output): Pull Request #1 (GitHub)