import { test, expect } from '../../fixtures/auth.fixture.js';

// Run with: npx playwright test test-isolation --repeat-each=5

test.describe('Favorites Feature', () => {
  test('should add a pet to favorites', async ({ userPage }) => {
    await userPage.goto('/pets');
    await userPage.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.status() === 200
    );

    const firstFavoriteButton = userPage.locator('[data-testid^="favorite-button-"]').first();
    const responsePromise = userPage.waitForResponse(
      (resp) => resp.url().includes('/api/favorites') && resp.status() === 201
    );
    await firstFavoriteButton.click();
    await responsePromise;

    await expect(firstFavoriteButton).toContainText('❤️');
  });

  test('should show empty favorites on dashboard', async ({ userPage }) => {
    await userPage.goto('/dashboard');

    const favoriteCards = userPage.locator('[data-testid^="favorite-"]');
    await expect(favoriteCards).toHaveCount(0);
  });
});
