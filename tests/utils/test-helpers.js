/**
 * Test Helper Utilities
 *
 * Common helper functions used across multiple tests
 */

/**
 * Generate a unique email for test users
 * Useful for registration tests to avoid duplicates
 */
export function generateUniqueEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generate test user data
 */
export function generateUserData(overrides = {}) {
  return {
    firstName: 'Test',
    lastName: 'User',
    email: generateUniqueEmail(),
    phone: '555-1234',
    password: 'TestPass123!',
    ...overrides
  };
}

/**
 * Generate application data
 * Useful for filling out adoption application forms
 */
export function generateApplicationData(overrides = {}) {
  // Calculate a date that makes the applicant 25 years old
  const birthDate = new Date();
  birthDate.setFullYear(birthDate.getFullYear() - 25);
  const dateOfBirth = birthDate.toISOString().split('T')[0];

  return {
    firstName: 'Test',
    lastName: 'Applicant',
    email: generateUniqueEmail(),
    phone: '555-1234',
    address: '123 Test St, Test City, TC 12345',
    dateOfBirth,
    housingType: 'house',
    ownOrRent: 'own',
    hasYard: 'yes',
    householdMembers: '2',
    previousPets: 'I have had dogs and cats for the past 10 years.',
    veterinarianName: 'Dr. Smith',
    veterinarianPhone: '555-5678',
    whyThisPet: 'This pet seems like a perfect match for our family.',
    activityLevel: 'moderate',
    hoursAlone: '4-6',
    financiallyPrepared: true,
    signature: 'Test Applicant',
    agreedToTerms: true,
    ...overrides
  };
}

/**
 * Wait for API response
 * Similar to cy.intercept() in Cypress
 */
export async function waitForAPIResponse(page, urlPattern, callback) {
  const responsePromise = page.waitForResponse(
    response => response.url().includes(urlPattern) && response.status() === 200
  );

  await callback();

  return await responsePromise;
}

/**
 * Reset database to seed state
 * Useful for test isolation
 */
export async function resetDatabase(request) {
  // This would call a test-only endpoint to reset the database
  // You'd need to add this endpoint to your server for testing
  // For now, this is a placeholder
  console.log('Database reset would happen here');
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page, name) {
  await page.screenshot({
    path: `screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  });
}
