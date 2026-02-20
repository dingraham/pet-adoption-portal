import { test, expect } from '@playwright/test';

/**
 * FLAKE TRIGGER: Race Condition - Missing Network Wait
 *
 * This test applies a filter but doesn't wait for the API response
 * before asserting. Sometimes the old data is still displayed when
 * the assertion runs, causing intermittent failures.
 *
 * Run with: npx playwright test race-condition --repeat-each=10
 */

test.describe('Pet Filtering Results', () => {
  test('should show correct count after filtering by species', async ({ page }) => {
    await page.goto('/pets');

    // Wait for initial load
    await page.waitForResponse((resp) => resp.url().includes('/api/pets') && resp.status() === 200);

    // Get the initial count before filtering
    const initialCount = await page.getByTestId('pet-count').textContent();

    // Apply the species filter
    await page.getByTestId('filter-species').selectOption('cat');

    // BUG: No waitForResponse here! The assertion may run before
    // the filtered API response comes back, seeing the OLD count.
    const filteredCount = await page.getByTestId('pet-count').textContent();

    // This will sometimes pass (if API is fast) and sometimes fail
    // (if the old count is still displayed)
    expect(Number(filteredCount)).toBeLessThan(Number(initialCount));
  });
});
