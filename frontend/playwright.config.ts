import { defineConfig, devices } from '@playwright/test';

const PORT = 5180;

// End-to-end tests: real app in a real browser, API stubbed with page.route
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Keep evidence of every failure: open with `npx playwright show-report`
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    // MSW off and a fake API origin: every API call goes through page.route
    env: {
      VITE_USE_MOCKS: 'false',
      VITE_API_URL: 'http://api.e2e.test',
    },
  },
});
