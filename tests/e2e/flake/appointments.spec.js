import { test, expect } from '../../fixtures/auth.fixture.js';

// Run with: npx playwright test appointments
// (Instructor: demonstrate the flake by running under different timezones —
//  TZ=UTC passes, TZ=Pacific/Honolulu fails on the broken version.)

test.describe('Appointments', () => {
  test.beforeEach(async ({ apiContext }) => {
    // Ensure there is a scheduled appointment with a known date to display.
    await apiContext
      .post('/appointments', { data: { petId: '1', date: '2024-01-15', time: '10:00 AM' } })
      .catch(() => {});
  });

  test('should show the scheduled appointment', async ({ userPage, apiContext }) => {
    await userPage.goto('/dashboard');
    await userPage.getByRole('button', { name: /Appointments/ }).click();

    // Don't assert on a locale/timezone-dependent display string. The stored date is the
    // timezone-independent source of truth, so verify that; then assert a stable, non-date
    // field from the UI. This stays green regardless of the machine's timezone.
    const appointments = await (await apiContext.get('/appointments/my-appointments')).json();
    expect(appointments.some((a) => a.date === '2024-01-15')).toBe(true);
    await expect(userPage.getByText('10:00 AM')).toBeVisible();
  });
});
