import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api-and-unit',
      testMatch: /.*\.unit\.spec\.ts/,
    },
    {
      name: 'e2e',
      testMatch: /.*\.e2e\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
