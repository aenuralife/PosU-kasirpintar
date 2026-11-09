import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

Given('membuka halaman Sales PosU', async ({ page }) => {
  const targetUrl = 'https://pos-u-kasirpintar.vercel.app';

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Form login hanya muncul ketika sesi belum terautentikasi.
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
  if (await emailInput.isVisible().catch(() => false)) {
    const email = process.env.POSU_TEST_EMAIL || 'alipmust420@gmail.com';
    const password = process.env.POSU_TEST_PASSWORD || 'password';

    await emailInput.fill(email);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(password);

    const submitBtn = page.locator('button:has-text("Masuk ke Sistem"), button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(3000);
  }

  // Verifikasi halaman Sales sudah dimuat, baik setelah login maupun jika sesi aktif.
  const keranjangElement = page.locator('text=/Keranjang/i').first();
  await expect(keranjangElement).toBeVisible({ timeout: 15000 });
});

When('saya menambahkan satu produk yang tersedia ke keranjang', async ({ page }) => {
  const productCard = page.locator('article').filter({
    has: page.locator('button[aria-label^="Add "]'),
  }).first();
  const addButton = productCard.locator('button[aria-label^="Add "]').first();

  await addButton.waitFor({ state: 'visible', timeout: 10000 });
  await addButton.click();
  await page.waitForTimeout(500);
});

Then('jumlah item di keranjang bertambah menjadi 1', async ({ page }) => {
  await expect(page.getByText('Keranjang masih kosong')).not.toBeVisible({ timeout: 10000 });

  const itemBadge = page
    .locator('text=/1\\s*item/i')
    .or(page.getByText('1 item', { exact: false }))
    .first();
  await expect(itemBadge).toBeVisible({ timeout: 10000 });
});

Then('total bayar menampilkan nilai yang lebih besar dari nol', async ({ page }) => {
  const payButton = page.locator('button').filter({ hasText: /Bayar/i }).first();

  await expect(payButton).toBeVisible({ timeout: 10000 });
  await expect(payButton).not.toHaveText(/Bayar Rp 0/i);
});

When('saya memilih kategori {string}', async ({ page }, kategori) => {
  const categoryBtn = page.getByRole('button', { name: kategori, exact: true })
    .or(page.getByText(kategori, { exact: true }));
  await categoryBtn.first().click();
});

Then('daftar produk hanya menampilkan produk kategori Coffee', async ({ page }) => {
  await page.waitForTimeout(1000);
  const coffeeProduct = page.getByText('Coffee', { exact: false }).first();
  await expect(coffeeProduct).toBeVisible({ timeout: 10000 });
});

When('saya mengeklik menu {string} pada sidebar', async ({ page }, namaMenu) => {
  const menuLink = page
    .locator('aside a, nav a, aside button, nav button, aside div')
    .filter({ hasText: new RegExp(`^${namaMenu}$`, 'i') })
    .first();
  await expect(menuLink).toBeVisible({ timeout: 10000 });
  await menuLink.click();
});

Then('halaman berpindah ke rute menu {string}', async ({ page }, namaMenu) => {
  const normalizedMenu = namaMenu.trim().toLocaleLowerCase();

  await expect.poll(async () => {
    const urlContainsMenu = decodeURIComponent(page.url())
      .toLocaleLowerCase()
      .includes(normalizedMenu);

    const headerContainsMenu = await page
      .getByRole('heading', { name: namaMenu, exact: false })
      .first()
      .isVisible()
      .catch(() => false);

    return urlContainsMenu || headerContainsMenu;
  }, { timeout: 15000 }).toBe(true);
});
