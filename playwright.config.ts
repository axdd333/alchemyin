import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 45_000,
  expect: {
    timeout: 8_000
  },
  use: {
    baseURL: 'http://127.0.0.1:4173/alchemyin/',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/alchemyin/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1536, height: 960 }
      }
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7']
      }
    }
  ]
});
