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
    // Ambiguous: this testid prefix matches every pet-name on the page (~12), so
    // .textContent() triggers a strict-mode violation. Even getByTestId selectors
    // need .first()/scoping when the prefix isn't unique.
    const petName = await userPage.locator('[data-testid^="pet-name-"]').textContent();
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
