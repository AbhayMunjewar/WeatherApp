import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:4173';

// Grant geolocation permissions for all tests so the dashboard fetch logic runs
// against the mocked weather API calls instead of failing early.
test.use({
  baseURL: BASE_URL,
  geolocation: { latitude: 37.7749, longitude: -122.4194 },
  permissions: ['geolocation']
});

test.describe('Weather app error handling banners', () => {
  test('dashboard surfaces API failure and retry issues a new request', async ({ page }) => {
    let requestCount = 0;
    await page.route('https://api.openweathermap.org/**', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'not found' }) });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('isAuthenticated', 'true');
    });
    await page.goto('/dashboard');

    const banner = page.getByText('We hit a snag.');
    await expect(banner).toBeVisible();
    await expect(page.getByText('We could not load weather for your current location. Please search manually.').first()).toBeVisible();

    const tryAgainButton = page.getByRole('button', { name: 'Try Again' });
    await Promise.all([
      page.waitForRequest((req) => req.url().includes('api.openweathermap.org/data/2.5/weather')),
      tryAgainButton.click()
    ]);

    expect(requestCount).toBeGreaterThan(1);
  });

  test('search results banner appears for gibberish city and retry CTA re-runs search', async ({ page }) => {
    const targetCity = 'asdfasdf';

    await page.route('https://api.openweathermap.org/**', async (route) => {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'not found' }) });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('isAuthenticated', 'true');
    });
    await page.goto(`/search?city=${targetCity}`);

    await expect(page.getByText(`Can't locate "${targetCity}"`)).toBeVisible();
    await expect(page.getByText(`Location "${targetCity}" not found. Try a broader city or proper postal format.`)).toBeVisible();

    const trySample = page.getByRole('button', { name: 'Try Sample City' });
    await Promise.all([
      page.waitForURL('**/search?city=San%20Francisco'),
      trySample.click()
    ]);

    await expect(page.getByText(`Can't locate "San Francisco"`)).toBeVisible();

    const backToDashboard = page.getByRole('button', { name: 'Back to Dashboard' });
    await Promise.all([
      page.waitForURL('**/dashboard'),
      backToDashboard.click()
    ]);
  });
});
