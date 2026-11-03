import { test, expect } from '@playwright/test';

test.describe('Skenario Transaksi Kasir', () => {

  // Setup: Robot akan selalu melakukan login otomatis sebelum test utama berjalan
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Ganti kredensial ini sesuai dengan akun di database Supabase Anda
    await page.getByPlaceholder('Masukkan email').fill('kasir@toko.com');
    await page.getByPlaceholder('Masukkan password').fill('password123');
    await page.getByRole('button', { name: /masuk/i }).click();

    // Memastikan kasir sudah masuk ke halaman utama/sales
    await expect(page).toHaveURL('/');
  });

  test('tambah produk ke keranjang dan berhasil checkout', async ({ page }) => {
    // Langkah 1: Mencari dan mengklik produk pertama di katalog
    // Catatan: Jika tombol atau kartu produk Anda tidak menggunakan class 'product-card', 
    // ubah teks '.product-card' di bawah menjadi class atau nama elemen yang sesuai di React Anda.
    const productCard = page.locator('.product-card').first();
    await productCard.click();

    // Langkah 2: Memastikan produk masuk ke daftar keranjang di sidebar kanan
    // Sesuaikan class '.cart-item' dengan struktur UI keranjang Anda
    const cartItem = page.locator('.cart-item').first();
    await expect(cartItem).toBeVisible();

    // Langkah 3: Menekan tombol bayar/checkout
    const payButton = page.getByRole('button', { name: /bayar/i });
    await payButton.click();

    // Langkah 4: Memastikan modal/pesan sukses muncul setelah transaksi tersimpan ke Supabase
    // Sesuaikan teks /berhasil/i dengan pesan notifikasi aktual di aplikasi Anda
    const successMessage = page.getByText(/berhasil/i);
    await expect(successMessage).toBeVisible();
  });

});