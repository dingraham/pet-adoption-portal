import { test, expect } from '@playwright/test';

// Run with: npx playwright test animation-timing --repeat-each=10

test.describe('Animated Panel and Modal Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pets');
    await page.waitForResponse((resp) => resp.url().includes('/api/pets') && resp.status() === 200);
  });

  test('should expand filter panel and apply age filter', async ({ page }) => {
    await page.getByTestId('toggle-filters-button').click();

    const ageFilter = page.getByTestId('filter-age');
    await ageFilter.selectOption('adult', { timeout: 1000 });

    const petCount = await page.getByTestId('pet-count').textContent({ timeout: 1000 });
    expect(Number(petCount)).toBeGreaterThan(0);
  });

  test('should open schedule modal and fill date field', async ({ page }) => {
    await page.locator('[data-testid^="pet-card-"]').first().click();
    await page.waitForResponse((resp) => resp.url().includes('/api/pets/') && resp.status() === 200);

    await page.getByTestId('schedule-appointment-button').click();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await page.locator('input[type="date"]').fill(dateStr, { timeout: 1000 });
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible({ timeout: 1000 });
  });
});
