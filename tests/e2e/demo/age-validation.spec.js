import { test, expect } from '../../fixtures/auth.fixture.js';

test.describe('Adoption Application - Age Verification', () => {

  test('should prevent users under 18 from proceeding with application', async ({ userPage }) => {
    // Navigate to the pets page and select the first available pet
    await userPage.goto('/pets');
    const firstPetCard = userPage.locator('[data-testid^="pet-card-"]').first();
    await firstPetCard.click();

    // Click "Start Adoption Application"
    await userPage.getByTestId('start-application-button').click();

    // Verify we're on Step 1
    await expect(userPage.getByText('Step 1 of 5')).toBeVisible();
    await expect(userPage.getByText('Personal Information')).toBeVisible();

    // Fill in Step 1: Personal Information
    const inputs = userPage.locator('input[type="text"]');
    await inputs.nth(0).fill('Jane');       // First Name
    await inputs.nth(1).fill('Smith');      // Last Name
    await userPage.locator('input[type="email"]').fill('jane.smith@example.com');
    await userPage.locator('input[type="tel"]').fill('555-0123');
    await inputs.nth(2).fill('123 Main St, Springfield, IL'); // Address

    // Set date of birth to make applicant 17 years old
    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
    const dob = seventeenYearsAgo.toISOString().split('T')[0];
    await userPage.locator('input[type="date"]').fill(dob);

    // Try to proceed to Step 2
    await userPage.getByRole('button', { name: 'Next' }).click();

    // Should see age validation error - users under 18 cannot adopt
    await expect(userPage.getByText('You must be 18 or older to adopt')).toBeVisible();

    // Should still be on Step 1 (not allowed to proceed)
    await expect(userPage.getByText('Step 1 of 5')).toBeVisible();
  });

});
