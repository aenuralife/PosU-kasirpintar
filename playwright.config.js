import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'features/step_definitions/**/*.js',
});

export default defineConfig({
  testDir,
  reporter: 'html',
  use: {
    video: 'on',
    screenshot: 'on',
    headless: process.env.CI ? true : false,
  },
});
