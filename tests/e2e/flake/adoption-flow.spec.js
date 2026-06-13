import { expect, test } from '@playwright/test';

// Run with: npx playwright test adoption-flow --repeat-each=10

test.describe('Adoption Application', () => {
  test('should login and navigate through to adoption application', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-email').fill('user@petadoption.com');
    await page.getByTestId('login-password').fill('user123');
    await page.getByTestId('login-submit').click();

    // Wait for the SPA route to settle rather than racing a short hardcoded timeout.
    await page.waitForURL(/dashboard/);

    // Navigate through the app and wait for the list to actually render .
    await page.getByTestId('nav-browse-pets').click();
    await page.waitForURL(/\/pets/);
    await expect(page.getByTestId('pets-grid')).toBeVisible();

    // Auto-wait for the card, then for the detail route to settle.
    await page.locator('[data-testid^="pet-card-"]').first().click();
    await page.waitForURL(/\/pets\/\d+/);

    // Auto-wait for the detail page to render before clicking through.
    const startButton = page.getByTestId('start-application-button');
    await expect(startButton).toBeVisible();
    await startButton.click();
    await page.waitForURL(/\/apply\//);

    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Personal Information');
  });
});
