import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: 'http://localhost:4175',
    channel: 'msedge',
    headless: true,
    serviceWorkers: 'allow',
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --host localhost --port 4175 --strictPort',
    url: 'http://localhost:4175',
    reuseExistingServer: false,
  },
});
