import { test, expect } from '@playwright/test';

/**
 * FLAKE TRIGGER: Animation/Transition Timing
 *
 * This test interacts with elements during CSS transitions or
 * animations. The progress bar and filter panel have transitions
 * that can interfere with assertions and clicks.
 *
 * Run with: npx playwright test animation-timing --repeat-each=10
 */

test.describe('Pet Page Interactions', () => {

  test('should toggle filter panel and apply filters', async ({ page }) => {
    await page.goto('/pets');

    // Wait for initial load
    await page.waitForResponse(resp =>
      resp.url().includes('/api/pets') && resp.status() === 200
    );

    // Click "More Filters" to expand the filter panel
    await page.getByTestId('toggle-filters-button').click();

    // BUG: Immediately try to interact with the expanded filters
    // without waiting for the expansion animation to complete.
    // The element might exist in DOM but not be fully visible/stable.
    const ageFilter = page.getByTestId('filter-age');

    // Force a click without waiting for the element to be stable
    // This can fail if the filter panel is still animating
    await ageFilter.selectOption('adult', { timeout: 1000 });

    // Also immediately read the results while the page might still be updating
    const petCount = await page.getByTestId('pet-count').textContent({ timeout: 1000 });
    expect(Number(petCount)).toBeGreaterThan(0);
  });

  test('should navigate to pet detail and verify image gallery', async ({ page }) => {
    await page.goto('/pets');

    // Wait for pets to load
    await page.waitForResponse(resp =>
      resp.url().includes('/api/pets') && resp.status() === 200
    );

    // Click the first pet card
    await page.locator('[data-testid^="pet-card-"]').first().click();

    // BUG: Don't wait for the page to finish loading/animating.
    // Immediately try to click thumbnail images which may still be loading.
    const thumbnails = page.locator('img.w-20');

    // Try to get count immediately - images might not be rendered yet
    const count = await thumbnails.count();
    expect(count).toBeGreaterThan(1);

    // Click second thumbnail without ensuring images are loaded
    await thumbnails.nth(1).click({ timeout: 1000 });
  });

});
