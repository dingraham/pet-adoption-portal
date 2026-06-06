import { test, expect } from '../../fixtures/auth.fixture.js';

// Run with: npx playwright test pet-browsing --repeat-each=10

test.describe('Pet Browsing', () => {
  test.beforeEach(async ({ userPage }) => {
    await userPage.goto('/pets');
    await userPage.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.status() === 200
    );
  });

  test('should read the name of the first pet', async ({ userPage }) => {
    const petName = await userPage.getByRole('heading', { level: 3 }).textContent();
    expect(petName).toBeTruthy();
  });

  test('should click the adoption button on the detail page', async ({ userPage }) => {
    await userPage.locator('[data-testid^="pet-card-"]').first().click();
    await userPage.waitForResponse(
      (resp) => resp.url().includes('/api/pets/') && resp.status() === 200
    );

    await userPage.getByRole('button').first().click();
    await expect(userPage).toHaveURL(/\/apply\//);
  });
});
