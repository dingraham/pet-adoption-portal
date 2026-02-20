import { test, expect } from '@playwright/test';

test.describe('Pet Species Filtering', () => {
  test('should display only dogs when filtering by species', async ({ page }) => {
    await page.goto('/pets');

    // Wait for the initial pet list to load
    await page.waitForResponse((resp) => resp.url().includes('/api/pets') && resp.status() === 200);

    // Select "Dogs" from the species filter and wait for filtered results
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/pets') && resp.url().includes('species=dog')
    );
    await page.getByTestId('filter-species').selectOption('dog');
    const response = await responsePromise;
    const data = await response.json();

    // Verify the API returned results
    expect(data.pets.length).toBeGreaterThan(0);

    // Every returned pet should be a dog
    for (const pet of data.pets) {
      expect(pet.species).toBe('dog');
    }

    // Verify the UI count matches the API response
    await expect(page.getByTestId('pet-count')).toHaveText(String(data.totalCount));
  });
});
