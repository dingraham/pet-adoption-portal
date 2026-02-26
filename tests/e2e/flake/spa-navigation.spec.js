import { test, expect } from '@playwright/test';

// Run with: npx playwright test spa-navigation --repeat-each=10

test.describe('Multi-Step SPA Navigation Flow', () => {
  test('should login and navigate through to adoption application', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-email').fill('user@petadoption.com');
    await page.getByTestId('login-password').fill('user123');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/dashboard/, { timeout: 500 });

    await page.goto('/pets');
    await page.waitForResponse((resp) => resp.url().includes('/api/pets') && resp.status() === 200);

    await page.locator('[data-testid^="pet-card-"]').first().click();

    await page.getByTestId('start-application-button').click({ timeout: 300 });

    await expect(page.getByText('Step 1 of 5')).toBeVisible({ timeout: 300 });
    await expect(page.locator('h2')).toContainText('Personal Information', { timeout: 1000 });
  });
});
