import { test, expect } from '@playwright/test';

/**
 * Seed Test - Environment Bootstrap for Playwright Agents
 *
 * This test verifies the app is running and accessible before
 * the Planner, Generator, or Healer agents begin their work.
 */
test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // Verify the app is running and the home page loads
    await page.goto('/');
    await expect(page).toHaveTitle(/Pet Adoption/);

    // Verify the API is reachable
    const response = await page.request.get('http://localhost:3000/api/health');
    expect(response.status()).toBe(200);

    // Verify the pets page loads with data
    await page.goto('/pets');
    await page.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.status() === 200
    );
    await expect(page.locator('[data-testid^="pet-card-"]').first()).toBeVisible();
  });
});
