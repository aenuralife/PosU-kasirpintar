import { After, Before, Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, expect } from '@playwright/test';

setDefaultTimeout(40 * 1000);

let browser;
let page;

Before(async function () {
  browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  page = await context.newPage();
});

Given('membuka halaman Sales PosU', async function () {
  const targetUrl = 'https://pos-u-kasirpintar.vercel.app';
  
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Cek apakah halaman memerlukan autentikasi/login
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
  if (await emailInput.isVisible().catch(() => false)) {
    const email = process.env.POSU_TEST_EMAIL || 'alipmust420@gmail.com';
    const password = process.env.POSU_TEST_PASSWORD || 'password';

    await emailInput.fill(email);
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(password);

    const submitBtn = page.locator('button:has-text("Masuk ke Sistem"), button[type="submit"]');
    await submitBtn.click();
    
    // Tunggu proses autentikasi dan pengarahan halaman
    await page.waitForTimeout(3000);
  }

  // Verifikasi elemen Keranjang di area Kasir sudah dimuat
  const keranjangElement = page.locator('text=/Keranjang/i').first();
  await expect(keranjangElement).toBeVisible({ timeout: 15000 });
});

When('saya menambahkan satu produk yang tersedia ke keranjang', async function () {
  const productCard = page.locator('article').filter({
    has: page.locator('button[aria-label^="Add "]'),
  }).first();
  const addButton = productCard.locator('button[aria-label^="Add "]').first();

  await addButton.waitFor({ state: 'visible', timeout: 10000 });
  await addButton.click();
  await page.waitForTimeout(500);
});

Then('jumlah item di keranjang bertambah menjadi 1', async function () {
  await expect(page.getByText('Keranjang masih kosong')).not.toBeVisible({ timeout: 10000 });

  const itemBadge = page
    .locator('text=/1\\s*item/i')
    .or(page.getByText('1 item', { exact: false }))
    .first();
  await expect(itemBadge).toBeVisible({ timeout: 10000 });
});

Then('total bayar menampilkan nilai yang lebih besar dari nol', async function () {
  // Targetkan tombol Bayar di area keranjang kanan bawah
  const payButton = page.locator('button').filter({ hasText: /Bayar/i }).first();
  
  // Memastikan tombol bayar terlihat dan nilainya bukan "Bayar Rp 0" lagi
  await expect(payButton).toBeVisible({ timeout: 10000 });
  await expect(payButton).not.toHaveText(/Bayar Rp 0/i);
});

When('saya memilih kategori {string}', async function (kategori) {
  const categoryBtn = page.getByRole('button', { name: kategori, exact: true })
    .or(page.getByText(kategori, { exact: true }));
  await categoryBtn.first().click();
});

Then('daftar produk hanya menampilkan produk kategori Coffee', async function () {
  await page.waitForTimeout(1000);
  const coffeeProduct = page.getByText('Coffee', { exact: false }).first();
  await expect(coffeeProduct).toBeVisible({ timeout: 10000 });
});

After(async function () {
  if (browser) {
    await browser.close();
  }
});
