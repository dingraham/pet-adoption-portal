import { test, expect } from '../../fixtures/auth.fixture.js';

// Run with: npx playwright test appointments

test.describe('Appointments', () => {
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
