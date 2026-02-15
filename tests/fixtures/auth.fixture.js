import { test as base } from '@playwright/test';

/**
 * Custom Fixtures for Authentication
 *
 * Fixtures allow you to set up and tear down test state automatically.
 *
 * Usage:
 *   import { test } from './fixtures/auth.fixture.js';
 *   test('my test', async ({ authenticatedPage, adminPage }) => {
 *     // Use authenticatedPage for logged-in user tests
 *     // Use adminPage for admin user tests
 *   });
 */

export const test = base.extend({
  /**
   * Fixture: authenticatedPage
   * Provides a page that's already logged in as a regular user
   */
  authenticatedPage: async ({ page }, use) => {
    // Login as regular user
    await page.goto('/login');
    await page.getByTestId('login-email').fill('user@petadoption.com');
    await page.getByTestId('login-password').fill('user123');
    await page.getByTestId('login-submit').click();

    // Wait for navigation to complete
    await page.waitForURL('/dashboard');

    // Provide the logged-in page to the test
    await use(page);

    // Cleanup happens automatically
  },

  /**
   * Fixture: adminPage
   * Provides a page that's already logged in as an admin
   */
  adminPage: async ({ page }, use) => {
    // Login as admin
    await page.goto('/login');
    await page.getByTestId('login-email').fill('admin@petadoption.com');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    // Wait for navigation to complete
    await page.waitForURL('/dashboard');

    // Provide the logged-in page to the test
    await use(page);

    // Cleanup happens automatically
  },

  /**
   * Fixture: apiContext
   * Provides an authenticated API context for making direct API calls
   * Useful for test setup/teardown without going through the UI
   */
  apiContext: async ({ request }, use) => {
    // Login via API to get token
    const response = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        email: 'user@petadoption.com',
        password: 'user123'
      }
    });

    const { token } = await response.json();

    // Create a new context with auth header
    const context = await request.newContext({
      baseURL: 'http://localhost:3000/api',
      extraHTTPHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });

    await use(context);
  }
});

export { expect } from '@playwright/test';
