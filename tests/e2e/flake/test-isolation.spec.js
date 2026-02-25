import { test, expect } from '../../fixtures/auth.fixture.js';

// Run with: npx playwright test test-isolation --repeat-each=5

test.describe('Favorites Feature', () => {
  test('Test A - can add a pet to favorites', async ({ userPage }) => {
    await userPage.goto('/pets');
    await userPage.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.status() === 200
    );

    const firstFavoriteButton = userPage.locator('[data-testid^="favorite-button-"]').first();
    await firstFavoriteButton.click();
    await userPage.waitForResponse(
      (resp) => resp.url().includes('/api/favorites') && resp.status() === 200
    );

    await expect(firstFavoriteButton).toContainText('❤️');
  });

  test('Test B - dashboard shows empty favorites', async ({ userPage }) => {
    await userPage.goto('/dashboard');

    const favoriteCards = userPage.locator('[data-testid^="favorite-"]');
    await expect(favoriteCards).toHaveCount(0);
  });
});
