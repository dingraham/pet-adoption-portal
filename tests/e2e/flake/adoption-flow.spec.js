import { expect, test } from '@playwright/test';

// Run with: npx playwright test adoption-flow --repeat-each=10

test.describe('Adoption Application', () => {
  test('should login and navigate through to adoption application', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-email').fill('user@petadoption.com');
    await page.getByTestId('login-password').fill('user123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/dashboard/);

    await page.goto('/pets');

    await page.locator('[data-testid^="pet-card-"]').first().click({ timeout: 300 });

    // Auto-wait for the detail page to render instead of racing its response.
    const startButton = page.getByTestId('start-application-button');
    await expect(startButton).toBeVisible();
    await startButton.click();
    await page.waitForURL(/\/apply\//);

    await expect(page.getByText('Step 1 of 5')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Personal Information');
  });
});
