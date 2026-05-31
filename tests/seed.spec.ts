import { test, expect } from '@playwright/test';

/**
 * Smoke Test / Agent Seed File
 *
 * Doubles as (1) a fast smoke test confirming the full stack is up and serving
 * seeded data, and (2) the seed file the Playwright MCP test-generator agent
 * references (see .claude/agents/playwright-test-generator.md) as the setup
 * baseline for tests it generates. Keep the filename `seed.spec.ts` stable for
 * that reason.
 */
test.describe('Smoke test', () => {
  test('app loads and serves seeded pet data', async ({ page }) => {
    // Verify the app is running and the home page loads
    await page.goto('/');
    await expect(page).toHaveTitle(/Pet Adoption/);

    // Verify the API is reachable
    const response = await page.request.get('http://localhost:3000/api/health');
    expect(response.status()).toBe(200);

    // Verify the pets page loads with data.
    // Register the response wait BEFORE navigating, otherwise the /api/pets
    // call can resolve during goto() before the listener attaches (a race).
    const petsResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.status() === 200
    );
    await page.goto('/pets');
    await petsResponse;
    await expect(page.locator('[data-testid^="pet-card-"]').first()).toBeVisible();
  });
});
