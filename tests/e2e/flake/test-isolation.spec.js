import { test, expect } from '../../fixtures/auth.fixture.js';

/**
 * FLAKE TRIGGER: Shared State Between Tests (Test Isolation)
 *
 * These tests share state through the database. Test A adds a favorite,
 * and Test B expects a clean state. When run together, Test B sees
 * leftover data from Test A. When run alone, Test B passes.
 *
 * Run with: npx playwright test test-isolation --repeat-each=5
 */

test.describe('Favorites Feature', () => {
  test('Test A - can add a pet to favorites', async ({ userPage }) => {
    await userPage.goto('/pets');

    // Wait for pets to load
    await userPage.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.status() === 200
    );

    // Add the first pet to favorites
    const firstFavoriteButton = userPage.locator('[data-testid^="favorite-button-"]').first();
    await firstFavoriteButton.click();

    // Wait for the favorites API call to complete
    await userPage.waitForResponse(
      (resp) => resp.url().includes('/api/favorites') && resp.status() === 200
    );

    // Verify the heart changed (favorite was added)
    await expect(firstFavoriteButton).toContainText('❤️');
  });

  test('Test B - dashboard shows empty favorites for new session', async ({ userPage }) => {
    // BUG: This test assumes a clean state, but Test A may have
    // already added a favorite. Since both tests use the same
    // user account (user@petadoption.com), the favorite persists
    // in the database between tests.
    await userPage.goto('/dashboard');

    // Expect no favorites - but Test A may have added one!
    const favoriteCards = userPage.locator('[data-testid^="favorite-"]');
    await expect(favoriteCards).toHaveCount(0);
  });
});
