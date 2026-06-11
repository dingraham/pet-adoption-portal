import { test, expect } from '../../fixtures/auth.fixture.js';

// Run with: npx playwright test appointments

test.describe('Appointments', () => {
  // Pin the locale so the rendered date format is stable across machines
  // (otherwise a Norwegian-locale laptop renders 15.01.2024 instead of 1/15/2024).
  test.use({ locale: 'en-US' });

  test.beforeEach(async ({ apiContext }) => {
    // Ensure there is a scheduled appointment with a known date to display.
    await apiContext
      .post('/appointments', { data: { petId: '1', date: '2024-01-15', time: '10:00 AM' } })
      .catch(() => {});
  });

  test('should show the scheduled appointment', async ({ userPage }) => {
    await userPage.goto('/dashboard');
    await userPage.getByRole('button', { name: /Appointments/ }).click();

    await expect(userPage.getByText('1/15/2024')).toBeVisible();
  });
});
