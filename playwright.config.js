import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Pet Adoption Portal
 *
 * This config is optimized for a full-stack application with:
 * - Frontend: Vue.js on http://localhost:5173
 * - Backend: Express API on http://localhost:3000
 */
export default defineConfig({
  // Test directory - where all test files are located
  testDir: './tests',

  // Maximum time one test can run (30 seconds)
  timeout: 30000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests (0 locally, 2 on CI)
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers
  // Use 1 worker for debugging, use more for faster test execution
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use - 'html' generates a nice HTML report
  // 'list' shows test results in the terminal as they run
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],

  // Output directory for test artifacts (screenshots, videos, traces)
  outputDir: 'test-results',

  // Shared settings for all projects
  use: {
    // Base URL for tests - all page.goto('/path') will use this
    baseURL: 'http://localhost:5173',

    // Collect trace - only retain on failure to avoid clutter in CI artifacts
    trace: 'retain-on-failure',

    // Screenshot - only on failure to avoid clutter in CI artifacts
    screenshot: 'only-on-failure',

    // Video - only retain on failure to avoid clutter in CI artifacts
    video: 'retain-on-failure',

    // Maximum time for actions like click, fill, etc.
    actionTimeout: 10000,

    // Emulate viewport size
    viewport: { width: 1280, height: 720 },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test on Firefox
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // Uncomment to test on WebKit (Safari)
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Uncomment for mobile testing
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Web server configuration
  // This will automatically start your app before running tests
  webServer: [
    {
      command: 'cd server && npm run dev',
      url: 'http://localhost:3000/api/health',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'cd client && npm run dev',
      url: 'http://localhost:5173',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
