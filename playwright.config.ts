import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration.
 *
 * `webServer` boots the full stack before tests: the backend API (memory driver)
 * on :3001 and the Vite preview server on :4173. The memory driver keeps E2E
 * runs isolated and fast (no external DB needed) — see test-strategy.md.
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm --workspace @qa/backend run dev',
      port: 3001,
      reuseExistingServer: !process.env.CI,
      env: { DATA_DRIVER: 'memory', PORT: '3001' },
      timeout: 60_000,
    },
    {
      command: 'npm --workspace @qa/frontend run build && npm --workspace @qa/frontend run preview -- --port 4173',
      port: 4173,
      reuseExistingServer: !process.env.CI,
      env: { VITE_API_BASE_URL: 'http://localhost:3001/api' },
      timeout: 120_000,
    },
  ],
});
