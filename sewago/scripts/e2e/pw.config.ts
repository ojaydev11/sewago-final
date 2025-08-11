import { defineConfig, devices } from '@playwright/test';

const apiPort = process.env.E2E_BACKEND_PORT || process.env.API_PORT || '4100';
const webPort = process.env.E2E_FRONTEND_PORT || process.env.WEB_PORT || '3001';
const FRONT = process.env.E2E_FRONTEND_ORIGIN || `http://localhost:${webPort}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: '../../artifacts/e2e/report' }]],
  use: {
    baseURL: FRONT,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: '../../artifacts/e2e',
});


