import { test, expect } from '@playwright/test';

test.describe('Pet Search', () => {
  test('should find pets by name when searching', async ({ page }) => {
    await page.goto('/pets');

    // Wait for pet list to load
    await page.waitForResponse((resp) => resp.url().includes('/api/pets') && resp.status() === 200);

    // Search for "Luna" - a known dog in the shelter
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.url().includes('search=Luna')
    );
    await page.getByTestId('search-input').fill('Luna');
    const response = await responsePromise;

    // Verify the search returned a successful response
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Luna should be in the results
    expect(data.pets.length).toBeGreaterThan(0);
    const petNames = data.pets.map((pet) => pet.name);
    expect(petNames).toContain('Luna');
  });
});
