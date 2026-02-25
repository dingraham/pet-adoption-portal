import { test, expect } from '@playwright/test';

// Run with: npx playwright test element-ambiguity --repeat-each=10

test.describe('Pet Browsing with Ambiguous Selectors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pets');
    await page.waitForResponse((resp) => resp.url().includes('/api/pets') && resp.status() === 200);
  });

  test('should read the name of the first pet', async ({ page }) => {
    const petName = await page.getByRole('heading', { level: 3 }).textContent();
    expect(petName).toBeTruthy();
  });

  test('should click a pet card image and reach the detail page', async ({ page }) => {
    await page.locator('img').first().click();
    await expect(page).toHaveURL(/\/pets\/\d+/);
  });

  test('should click the adoption button on the detail page', async ({ page }) => {
    await page.locator('[data-testid^="pet-card-"]').first().click();
    await page.waitForResponse((resp) => resp.url().includes('/api/pets/') && resp.status() === 200);

    await page.getByRole('button').first().click();
    await expect(page).toHaveURL(/\/apply\//, { timeout: 3000 });
  });
});
