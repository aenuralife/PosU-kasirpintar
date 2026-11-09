// Generated from: features\pos_sales.feature
import { test } from "playwright-bdd";

test.describe('Penjualan pada halaman Sales PosU', () => {

  test('Menambahkan produk ke keranjang dan memeriksa total bayar', async ({ Given, When, Then, And, page }) => { 
    await Given('membuka halaman Sales PosU', null, { page }); 
    await When('saya menambahkan satu produk yang tersedia ke keranjang', null, { page }); 
    await Then('jumlah item di keranjang bertambah menjadi 1', null, { page }); 
    await And('total bayar menampilkan nilai yang lebih besar dari nol', null, { page }); 
  });

  test('Memfilter daftar produk berdasarkan kategori', async ({ Given, When, Then, page }) => { 
    await Given('membuka halaman Sales PosU', null, { page }); 
    await When('saya memilih kategori "Coffee"', null, { page }); 
    await Then('daftar produk hanya menampilkan produk kategori Coffee', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features\\pos_sales.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Dengan membuka halaman Sales PosU","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"Ketika saya menambahkan satu produk yang tersedia ke keranjang","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Maka jumlah item di keranjang bertambah menjadi 1","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Dan total bayar menampilkan nilai yang lebih besar dari nol","stepMatchArguments":[]}]},
  {"pwTestLine":13,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":14,"gherkinStepLine":11,"keywordType":"Context","textWithKeyword":"Dengan membuka halaman Sales PosU","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"Ketika saya memilih kategori \"Coffee\"","stepMatchArguments":[{"group":{"start":22,"value":"\"Coffee\"","children":[{"start":23,"value":"Coffee","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Maka daftar produk hanya menampilkan produk kategori Coffee","stepMatchArguments":[]}]},
]; // bdd-data-end