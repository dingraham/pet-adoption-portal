import { expect, test } from '../../fixtures/auth.fixture.js';

// Run with: npx playwright test appointments --repeat-each=5

const APPOINTMENT_DATE = '2024-01-15';

test.describe('Appointments', () => {
  test.beforeEach(async ({ apiContext }) => {
    // Ensure there is a scheduled appointment with a known date to display.
    await apiContext.post('/appointments', {
      data: { petId: '1', date: APPOINTMENT_DATE, time: '10:00 AM' },
    });
  });

  test('should show the scheduled appointment', async ({ userPage }) => {
    await userPage.goto('/dashboard');
    await userPage.getByRole('button', { name: /Appointments/ }).click();

    // Don't hardcode a locale/timezone-specific string and don't pin the locale. Derive the
    // expected text the same way the app does (Dashboard.vue renders `new Date(date).toLocaleDateString()`),
    // evaluated in the browser context so the locale and timezone match what's actually rendered.
    const expectedDate = await userPage.evaluate(
      (date) => new Date(date).toLocaleDateString(),
      APPOINTMENT_DATE
    );

    await expect(userPage.getByText(expectedDate)).toBeVisible();
  });
});
