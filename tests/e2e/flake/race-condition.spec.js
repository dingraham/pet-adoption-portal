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

    const filteredCount = await page.getByTestId('pet-count').textContent();
    expect(Number(filteredCount)).toBeLessThan(Number(initialCount));
  });

  test('should show only cats after filtering', async ({ page }) => {
    await page.getByTestId('filter-species').selectOption('cat');

    const petBreeds = await page.locator('[data-testid^="pet-breed-"]').allTextContents();

    expect(petBreeds.length).toBeGreaterThan(0);
    const catBreeds = ['persian', 'siamese', 'maine coon', 'bengal', 'ragdoll', 'british shorthair', 'abyssinian'];
    for (const breed of petBreeds) {
      expect(catBreeds).toContainEqual(breed.toLowerCase());
    }
  });
});
