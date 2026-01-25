import { test, expect } from '@playwright/test';

/**
 * EXAMPLE TEST FILE - Playwright Basics for Cypress Users
 *
 * This file demonstrates common Playwright patterns and how they compare to Cypress.
 * Read through the comments to understand the key differences and similarities.
 *
 * DO NOT RUN THIS FILE YET - It's for learning purposes only!
 */

// ============================================================================
// BASIC TEST STRUCTURE
// ============================================================================

/**
 * Test suites in Playwright use test.describe() - similar to Cypress's describe()
 * Tests use test() - similar to Cypress's it()
 */
test.describe('Example Test Suite', () => {

  /**
   * HOOKS - Just like Cypress
   * beforeEach, afterEach, beforeAll, afterAll all work the same way
   */
  test.beforeEach(async ({ page }) => {
    // The 'page' object is Playwright's equivalent to Cypress's cy
    // It's automatically injected as a fixture
    await page.goto('/');
  });

  /**
   * BASIC TEST
   * Notice: Playwright tests are async functions
   * Cypress: it('test name', () => { ... })
   * Playwright: test('test name', async ({ page }) => { ... })
   */
  test('demonstrates basic navigation', async ({ page }) => {
    // Navigate to a page
    // Cypress: cy.visit('/login')
    // Playwright: await page.goto('/login')
    await page.goto('/login');

    // Assertions - very similar to Cypress
    // Cypress: cy.url().should('include', '/login')
    // Playwright: await expect(page).toHaveURL(/login/)
    await expect(page).toHaveURL(/login/);

    // Check page title
    await expect(page).toHaveTitle(/Pet Adoption/);
  });

  // ============================================================================
  // LOCATORS - Key Difference from Cypress!
  // ============================================================================

  test('demonstrates locators (Playwright\'s approach to finding elements)', async ({ page }) => {
    await page.goto('/login');

    /**
     * LOCATOR STRATEGIES
     *
     * Cypress uses commands like cy.get(), cy.contains(), etc.
     * Playwright uses LOCATORS which are references to elements that can be reused
     *
     * Locators are lazy - they don't find the element until you interact with it
     * This means they're more resilient to page changes
     */

    // 1. By test ID (recommended!)
    // Cypress: cy.get('[data-testid="login-email"]')
    // Playwright: page.getByTestId('login-email')
    const emailInput = page.getByTestId('login-email');

    // 2. By role (accessibility-friendly)
    // Great for buttons, links, inputs, etc.
    const submitButton = page.getByRole('button', { name: 'Login' });

    // 3. By text
    // Cypress: cy.contains('Don't have an account?')
    // Playwright: page.getByText('Don't have an account?')
    const registerLink = page.getByText('Don\'t have an account?');

    // 4. By label (for form inputs)
    // Finds input associated with a label
    const passwordInput = page.getByLabel('Password');

    // 5. By placeholder
    const searchByPlaceholder = page.getByPlaceholder('you@example.com');

    // NOTE: You can also use CSS selectors (but test IDs are better!)
    // const element = page.locator('.some-class');
  });

  // ============================================================================
  // INTERACTIONS - Similar to Cypress but with await
  // ============================================================================

  test('demonstrates interactions', async ({ page }) => {
    await page.goto('/login');

    // Fill input
    // Cypress: cy.get('[data-testid="login-email"]').type('user@example.com')
    // Playwright: await page.getByTestId('login-email').fill('user@example.com')
    await page.getByTestId('login-email').fill('user@example.com');

    // Click button
    // Cypress: cy.get('[data-testid="login-submit"]').click()
    // Playwright: await page.getByTestId('login-submit').click()
    await page.getByTestId('login-submit').click();

    // Check checkbox
    // await page.getByRole('checkbox').check();

    // Select from dropdown
    // await page.getByTestId('filter-species').selectOption('dog');

    // Clear input
    // await page.getByTestId('search-input').clear();
  });

  // ============================================================================
  // ASSERTIONS - More explicit in Playwright
  // ============================================================================

  test('demonstrates assertions', async ({ page }) => {
    await page.goto('/login');

    // Visible/Hidden
    // Cypress: cy.get('[data-testid="login-form"]').should('be.visible')
    // Playwright: await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('login-form')).toBeVisible();

    // Text content
    // Cypress: cy.get('h2').should('contain', 'Login')
    // Playwright: await expect(page.locator('h2')).toContainText('Login')
    await expect(page.locator('h2')).toContainText('Login');

    // Count elements
    // Cypress: cy.get('.pet-card').should('have.length', 5)
    // Playwright: await expect(page.locator('.pet-card')).toHaveCount(5)
    // await expect(page.locator('.pet-card')).toHaveCount(5);

    // Attribute value
    // await expect(page.getByTestId('login-email')).toHaveAttribute('type', 'email');

    // Disabled state
    // await expect(page.getByTestId('submit-button')).toBeDisabled();
  });

  // ============================================================================
  // WAITING - Auto-waiting is a BIG advantage in Playwright!
  // ============================================================================

  test('demonstrates waiting (Playwright auto-waits!)', async ({ page }) => {
    await page.goto('/pets');

    /**
     * PLAYWRIGHT AUTO-WAITS!
     * Unlike Cypress which sometimes needs cy.wait(), Playwright automatically waits for:
     * - Element to be visible
     * - Element to be enabled
     * - Element to be stable (not animating)
     *
     * This means most of the time you DON'T need explicit waits!
     */

    // This will automatically wait for the button to be clickable
    await page.getByTestId('search-input').fill('Luna');

    // Wait for specific URL
    // await page.waitForURL('/dashboard');

    // Wait for API response (like cy.intercept())
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
  // NETWORK INTERCEPTION - Different from Cypress!
  // ============================================================================

  test('demonstrates network interception', async ({ page }) => {
    /**
     * ROUTE INTERCEPTION
     * Cypress: cy.intercept()
     * Playwright: page.route()
     */

    // Intercept API call and modify response
    await page.route('**/api/pets*', async (route) => {
      const response = await route.fetch();
      const body = await response.json();

      // Modify the response
      body.pets = body.pets.slice(0, 3); // Only return first 3 pets

      await route.fulfill({
        response,
        json: body
      });
    });

    await page.goto('/pets');
  });

  // ============================================================================
  // MULTIPLE ELEMENTS - forEach equivalent
  // ============================================================================

  test('demonstrates working with multiple elements', async ({ page }) => {
    await page.goto('/pets');

    // Get all matching elements
    const petCards = page.locator('[data-testid^="pet-card-"]');

    // Count them
    const count = await petCards.count();
    expect(count).toBeGreaterThan(0);

    // Iterate through them
    // Cypress: cy.get('.pet-card').each(($el) => { ... })
    // Playwright: Use .nth() or .all()
    for (let i = 0; i < await petCards.count(); i++) {
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
  // SKIP / ONLY - Same as Cypress!
  // ============================================================================

  test.skip('this test will be skipped', async ({ page }) => {
    // Cypress: it.skip()
    // Playwright: test.skip()
  });

  test.only('only this test will run if uncommented', async ({ page }) => {
    // Cypress: it.only()
    // Playwright: test.only()
    // NOTE: Remove .only before committing!
  });

});

// ============================================================================
// USING FIXTURES (CUSTOM CONTEXTS)
// ============================================================================

/**
 * Fixtures are like custom Cypress commands but more powerful
 * They're defined in tests/fixtures/auth.fixture.js
 */
import { test as authTest } from '../fixtures/auth.fixture.js';

authTest.describe('Tests with authenticated user', () => {

  authTest('can access dashboard when logged in', async ({ authenticatedPage }) => {
    // authenticatedPage is already logged in as a regular user!
    // No need to go through login flow
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage).toHaveURL(/dashboard/);
  });

  authTest('admin can access admin panel', async ({ adminPage }) => {
    // adminPage is already logged in as admin!
    await adminPage.goto('/admin');
    await expect(adminPage).toHaveURL(/admin/);
  });

});

/**
 * KEY TAKEAWAYS FOR CYPRESS USERS:
 *
 * 1. Tests are async/await - remember to use 'await'!
 * 2. Locators are lazy and reusable
 * 3. Use getByTestId(), getByRole(), getByText() instead of .get()
 * 4. Auto-waiting is built-in - no need for most cy.wait()
 * 5. Fixtures replace custom commands
 * 6. Multiple browsers out of the box
 * 7. Better parallelization
 * 8. Faster execution
 * 9. Better debugging tools (Playwright Inspector)
 * 10. Can test outside the browser (API testing)
 */
