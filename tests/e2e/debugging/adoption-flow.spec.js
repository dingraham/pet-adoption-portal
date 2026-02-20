import { test, expect } from '../../fixtures/auth.fixture.js';

test.describe('Adoption Application Flow', () => {
  test('should progress through adoption form steps', async ({ userPage }) => {
    // Navigate to pets page and select the first available pet
    await userPage.goto('/pets');
    await userPage.locator('[data-testid^="pet-card-"]').first().click();

    // Start the adoption application
    await userPage.getByTestId('start-application-button').click();

    // Verify we're on Step 1
    await expect(userPage.getByText('Step 1 of 5')).toBeVisible();
    await expect(userPage.locator('h2')).toContainText('Personal Information');

    // Fill in Step 1: Personal Information
    const textInputs = userPage.locator('input[type="text"]');
    await textInputs.nth(0).fill('John'); // First Name
    await textInputs.nth(1).fill('Doe'); // Last Name
    await userPage.locator('input[type="email"]').fill('john.doe@example.com');
    await userPage.locator('input[type="tel"]').fill('555-9876');
    await textInputs.nth(2).fill('456 Oak Avenue, Portland, OR'); // Address

    // Set date of birth to make applicant 25 years old
    const twentyFiveYearsAgo = new Date();
    twentyFiveYearsAgo.setFullYear(twentyFiveYearsAgo.getFullYear() - 25);
    const dob = twentyFiveYearsAgo.toISOString().split('T')[0];
    await userPage.locator('input[type="date"]').fill(dob);

    // Click Next to proceed to Step 2
    await userPage.getByRole('button', { name: 'Next' }).click();

    // Verify Step 2 loaded
    await expect(userPage.getByText('Step 2 of 5')).toBeVisible();
    await expect(userPage.locator('.step-heading')).toContainText('Living Arrangements');
  });
});
