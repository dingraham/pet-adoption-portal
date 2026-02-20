import { test, expect } from '../../fixtures/auth.fixture.js';

/**
 * FLAKE TRIGGER: Hardcoded Timeout Instead of Proper Wait
 *
 * This test uses waitForTimeout (a fixed delay) instead of waiting
 * for the actual navigation/response to complete. On slow CI machines
 * or under load, the hardcoded wait isn't long enough.
 *
 * Run with: npx playwright test hardcoded-waits --repeat-each=10
 */

test.describe('User Login and Dashboard', () => {
  test('should display user dashboard after login', async ({ page }) => {
    await page.goto('/login');

    // Fill in login credentials
    await page.getByTestId('login-email').fill('user@petadoption.com');
    await page.getByTestId('login-password').fill('user123');
    await page.getByTestId('login-submit').click();

    // BUG: Using a hardcoded wait instead of waiting for navigation.
    // 300ms might be enough locally but not on a slow CI runner.
    await page.waitForTimeout(300);

    // This assertion flakes because the redirect may not have completed yet
    await expect(page).toHaveURL(/dashboard/);

    // Verify dashboard content is visible
    await expect(page.getByText('My Favorites')).toBeVisible();
  });
});
