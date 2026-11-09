// Generated from: features\pos_navigation.feature
import { test } from "playwright-bdd";

test.describe('Navigasi menu PosU', () => {

  test.beforeEach('Latar Belakang', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('membuka halaman Sales PosU', null, { page }); 
  });
  
  test('Membuka menu Products', async ({ When, Then, page }) => { 
    await When('saya mengeklik menu "Products" pada sidebar', null, { page }); 
    await Then('halaman berpindah ke rute menu "Products"', null, { page }); 
  });

  test('Membuka menu Customers', async ({ When, Then, page }) => { 
    await When('saya mengeklik menu "Customers" pada sidebar', null, { page }); 
    await Then('halaman berpindah ke rute menu "Customers"', null, { page }); 
  });

  test('Membuka menu Orders', async ({ When, Then, page }) => { 
    await When('saya mengeklik menu "Orders" pada sidebar', null, { page }); 
    await Then('halaman berpindah ke rute menu "Orders"', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features\\pos_navigation.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":7,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Dengan membuka halaman Sales PosU","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"Ketika saya mengeklik menu \"Products\" pada sidebar","stepMatchArguments":[{"group":{"start":20,"value":"\"Products\"","children":[{"start":21,"value":"Products","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Maka halaman berpindah ke rute menu \"Products\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Products\"","children":[{"start":32,"value":"Products","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":15,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Dengan membuka halaman Sales PosU","isBg":true,"stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"Ketika saya mengeklik menu \"Customers\" pada sidebar","stepMatchArguments":[{"group":{"start":20,"value":"\"Customers\"","children":[{"start":21,"value":"Customers","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":17,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Maka halaman berpindah ke rute menu \"Customers\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Customers\"","children":[{"start":32,"value":"Customers","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":20,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Dengan membuka halaman Sales PosU","isBg":true,"stepMatchArguments":[]},{"pwStepLine":21,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"Ketika saya mengeklik menu \"Orders\" pada sidebar","stepMatchArguments":[{"group":{"start":20,"value":"\"Orders\"","children":[{"start":21,"value":"Orders","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Maka halaman berpindah ke rute menu \"Orders\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Orders\"","children":[{"start":32,"value":"Orders","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end