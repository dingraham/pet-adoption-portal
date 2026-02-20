import { test, expect } from '@playwright/test';

/**
 * EXAMPLE TEST FILE - Playwright Basics
 *
 * This file demonstrates common Playwright patterns.
 * Read through the comments to understand how each feature works.
 *
 * DO NOT RUN THIS FILE YET - It's for learning purposes only!
 */

// ============================================================================
// BASIC TEST STRUCTURE
// ============================================================================

/**
 * Test suites use test.describe()
 * Tests use test()
 */
test.describe('Example Test Suite', () => {
  /**
   * HOOKS
   * beforeEach, afterEach, beforeAll, afterAll
   */
  test.beforeEach(async ({ page }) => {
    // The 'page' object is automatically injected as a fixture
    await page.goto('/');
  });

  /**
   * BASIC TEST
   * Playwright tests are async functions
   */
  test('demonstrates basic navigation', async ({ page }) => {
    // Navigate to a page
    await page.goto('/login');

    // Check URL
    await expect(page).toHaveURL(/login/);

    // Check page title
    await expect(page).toHaveTitle(/Pet Adoption/);
  });

  // ============================================================================
  // LOCATORS - Finding Elements
  // ============================================================================

  test('demonstrates locators', async ({ page }) => {
    await page.goto('/login');

    /**
     * LOCATOR STRATEGIES
     *
     * Locators are references to elements that can be reused.
     * They are lazy - they don't find the element until you interact with it.
     */

    // 1. By test ID (recommended)
    const emailInput = page.getByTestId('login-email');

    // 2. By role (accessibility-friendly)
    const submitButton = page.getByRole('button', { name: 'Login' });

    // 3. By text
    const registerLink = page.getByText("Don't have an account?");

    // 4. By label (for form inputs)
    const passwordInput = page.getByLabel('Password');

    // 5. By placeholder
    const searchByPlaceholder = page.getByPlaceholder('you@example.com');

    // 6. CSS selector
    // const element = page.locator('.some-class');
  });

  // ============================================================================
  // INTERACTIONS
  // ============================================================================

  test('demonstrates interactions', async ({ page }) => {
    await page.goto('/login');

    // Fill input
    await page.getByTestId('login-email').fill('user@example.com');

    // Click button
    await page.getByTestId('login-submit').click();

    // Check checkbox
    // await page.getByRole('checkbox').check();

    // Select from dropdown
    // await page.getByTestId('filter-species').selectOption('dog');

    // Clear input
    // await page.getByTestId('search-input').clear();
  });

  // ============================================================================
  // ASSERTIONS
  // ============================================================================

  test('demonstrates assertions', async ({ page }) => {
    await page.goto('/login');

    // Visible/Hidden
    await expect(page.getByTestId('login-form')).toBeVisible();

    // Text content
    await expect(page.locator('h2')).toContainText('Login');

    // Count elements
    // await expect(page.locator('.pet-card')).toHaveCount(5);

    // Attribute value
    // await expect(page.getByTestId('login-email')).toHaveAttribute('type', 'email');

    // Disabled state
    // await expect(page.getByTestId('submit-button')).toBeDisabled();
  });

  // ============================================================================
  // WAITING
  // ============================================================================

  test('demonstrates waiting', async ({ page }) => {
    await page.goto('/pets');

    /**
     * PLAYWRIGHT AUTO-WAITS
     * Playwright automatically waits for:
     * - Element to be visible
     * - Element to be enabled
     * - Element to be stable (not animating)
     */

    // This will automatically wait for the input to be ready
    await page.getByTestId('search-input').fill('Luna');

    // Wait for specific URL
    // await page.waitForURL('/dashboard');

    // Wait for API response
    // const responsePromise = page.waitForResponse(
    //   response => response.url().includes('/api/pets') && response.status() === 200
    // );
    // await page.getByTestId('filter-species').selectOption('dog');
    // const response = await responsePromise;

    // Wait for selector (rarely needed due to auto-wait)
    // await page.waitForSelector('[data-testid="pet-card-1"]');

    // Wait for load state
    // await page.waitForLoadState('networkidle');
  });

  // ============================================================================
  // NETWORK INTERCEPTION
  // ============================================================================

  test('demonstrates network interception', async ({ page }) => {
    // Intercept API call and modify response
    await page.route('**/api/pets*', async (route) => {
      const response = await route.fetch();
      const body = await response.json();

      // Modify the response
      body.pets = body.pets.slice(0, 3); // Only return first 3 pets

      await route.fulfill({
        response,
        json: body,
      });
    });

    await page.goto('/pets');
  });

  // ============================================================================
  // MULTIPLE ELEMENTS
  // ============================================================================

  test('demonstrates working with multiple elements', async ({ page }) => {
    await page.goto('/pets');

    // Get all matching elements
    const petCards = page.locator('[data-testid^="pet-card-"]');

    // Count them
    const count = await petCards.count();
    expect(count).toBeGreaterThan(0);

    // Iterate through them using .nth() or .all()
    for (let i = 0; i < (await petCards.count()); i++) {
      const card = petCards.nth(i);
      await expect(card).toBeVisible();
    }
  });

  // ============================================================================
  // DEBUGGING
  // ============================================================================

  test('demonstrates debugging', async ({ page }) => {
    await page.goto('/login');

    // Add a breakpoint in your test
    // Run with: npm run test:debug
    // await page.pause(); // Opens Playwright Inspector

    // Take screenshot
    // await page.screenshot({ path: 'screenshot.png' });

    // Get element text (for debugging)
    // const text = await page.locator('h2').textContent();
    // console.log('Heading text:', text);

    // Print page HTML (for debugging)
    // const html = await page.content();
    // console.log(html);
  });

  // ============================================================================
  // SKIP / ONLY
  // ============================================================================

  test.skip('this test will be skipped', async ({ page }) => {
    // Use test.skip() to skip a test
  });

  test.skip('only this test will run (use test.only to enable)', async ({ page }) => {
    // Use test.only() to run only this test
    // NOTE: Remove .only before committing!
  });
});

// ============================================================================
// USING FIXTURES (CUSTOM CONTEXTS)
// ============================================================================

/**
 * Fixtures are defined in tests/fixtures/auth.fixture.js
 * They provide reusable test setup like pre-authenticated pages
 */
import { test as authTest } from '../fixtures/auth.fixture.js';

authTest.describe('Tests with authenticated user', () => {
  authTest('can access dashboard when logged in', async ({ userPage }) => {
    // userPage is already logged in as a regular user
    await userPage.goto('/dashboard');
    await expect(userPage).toHaveURL(/dashboard/);
  });

  authTest('admin can access admin panel', async ({ adminPage }) => {
    // adminPage is already logged in as admin
    await adminPage.goto('/admin');
    await expect(adminPage).toHaveURL(/admin/);
  });
});

/**
 * KEY CONCEPTS:
 *
 * 1. Tests are async/await - remember to use 'await'
 * 2. Locators are lazy and reusable
 * 3. Use getByTestId(), getByRole(), getByText() to find elements
 * 4. Auto-waiting is built-in for most actions
 * 5. Fixtures provide reusable test setup
 * 6. Use page.route() for network interception
 * 7. Use page.pause() for debugging
 */
