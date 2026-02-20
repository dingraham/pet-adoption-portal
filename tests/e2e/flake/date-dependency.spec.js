import { test, expect } from "@playwright/test";

/**
 * FLAKE TRIGGER: Non-Deterministic Data / Date Dependencies
 *
 * This test makes assertions based on data ordering that isn't
 * guaranteed, or depends on the current date/time in ways that
 * can break across different environments or time zones.
 *
 * Run with: npx playwright test date-dependency --repeat-each=10
 */

test.describe("Pet Listing Order and Data", () => {
  test("should display the newest pet first", async ({ page }) => {
    await page.goto("/pets");

    // Wait for pets to load
    const response = await page.waitForResponse(
      (resp) => resp.url().includes("/api/pets") && resp.status() === 200,
    );
    const data = await response.json();

    // BUG: Asserting a specific pet name as "first" based on seed data ordering.
    // This is fragile because:
    // 1. If anyone adds a newer pet, this breaks
    // 2. If the default sort order changes, this breaks
    // 3. If the seed data dates are modified, this breaks
    const firstPetName = await page
      .locator('[data-testid^="pet-name-"]')
      .first()
      .textContent();
    expect(firstPetName).toBe("Scout");
  });

  test("should show correct pet age display", async ({ page }) => {
    await page.goto("/pets");

    await page.waitForResponse(
      (resp) => resp.url().includes("/api/pets") && resp.status() === 200,
    );

    // BUG: Asserting an exact count of pets that match a filter.
    // This is brittle because:
    // 1. The count depends on the exact seed data state
    // 2. Other tests might have modified the database
    // 3. Any data migration or seed update breaks this
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/pets") && resp.url().includes("age=adult"),
    );
    await page.getByTestId("toggle-filters-button").click();
    await page.getByTestId("filter-age").selectOption("adult");
    await responsePromise;

    // Hardcoded expected count based on current seed data
    await expect(page.getByTestId("pet-count")).toHaveText("8");
  });
});
