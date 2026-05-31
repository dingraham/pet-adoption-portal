import { test, expect } from '../../fixtures/auth.fixture.js';

// Run with: npx playwright test element-ambiguity --repeat-each=10

test.describe('Pet Browsing with Ambiguous Selectors', () => {
  test.beforeEach(async ({ userPage }) => {
    await userPage.goto('/pets');
    // Web-first wait: auto-retries until the list has rendered. Avoids the
    // goto/waitForResponse race (the response can fire before the listener attaches).
    await expect(userPage.getByTestId('pets-grid')).toBeVisible();
  });

  test('should read the name of the first pet', async ({ userPage }) => {
    const petName = await userPage
      .locator('[data-testid^="pet-card-"]')
      .first()
      .getByRole('heading')
      .textContent();
    expect(petName).toBeTruthy();
  });

  test('should click the adoption button on the detail page', async ({ userPage }) => {
    await userPage.locator('[data-testid^="pet-card-"]').first().click();

    // Auto-wait for the detail page to render instead of racing its response.
    const startButton = userPage.getByTestId('start-application-button');
    await expect(startButton).toBeVisible();
    await startButton.click();
    await expect(userPage).toHaveURL(/\/apply\//);
  });
});
