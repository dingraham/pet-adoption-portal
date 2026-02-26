import { test, expect } from '@playwright/test';

// Run with: npx playwright test race-condition --repeat-each=10

test.describe('Pet Filtering Results', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pets');
    await page.waitForResponse((resp) => resp.url().includes('/api/pets') && resp.status() === 200);
  });

  test('should show fewer results after filtering by species', async ({ page }) => {
    const initialCount = await page.getByTestId('pet-count').textContent();
    await page.getByTestId('filter-species').selectOption('cat');
    const petCount = await page.getByTestId('pet-count').textContent();
    expect(Number(petCount)).toBeLessThan(Number(initialCount));
  });

  test('should show only cats after filtering', async ({ page }) => {
    const initialBreedCount = await page.locator('[data-testid^="pet-breed-"]').count();
    await page.getByTestId('filter-species').selectOption('cat');
    const breeds = await page.locator('[data-testid^="pet-breed-"]').allTextContents();
    expect(breeds.length).toBeLessThan(initialBreedCount);
  });
});
