import { test, expect } from '@playwright/test';

// Run with: npx playwright test race-condition --repeat-each=10

test.describe('Pet Filtering Results', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pets');
    await page.waitForResponse((resp) => resp.url().includes('/api/pets') && resp.status() === 200);
  });

  test('should show fewer results after filtering by species', async ({ page }) => {
    const initialCount = await page.getByTestId('pet-count').textContent();

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.status() === 200
    );
    await page.getByTestId('filter-species').selectOption('cat');
    await responsePromise;

    await expect(page.getByTestId('pet-count')).not.toHaveText(initialCount);
  });

  test('should show only cats after filtering', async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.status() === 200
    );
    await page.getByTestId('filter-species').selectOption('cat');
    const response = await responsePromise;
    const { pets } = await response.json();

    expect(pets.every((pet) => pet.species === 'cat')).toBe(true);
    await expect(page.locator('[data-testid^="pet-breed-"]')).toHaveCount(pets.length);
  });
});
