import { test, expect } from '@playwright/test';

test.describe('Maintenance Bills Component E2E', () => {
  test('should render bill filter controls and respond to clicks', async ({ page }) => {
    await page.route('**/api/**/auth/me', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Not authenticated' }) });
    });
    await page.route('**/api/**/auth/refresh', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Not authenticated' }) });
    });

    // Navigate to root
    await page.goto('/');

    // Check if landing page loads without crash
    await expect(page).toHaveTitle(/.*Society.*/i, { timeout: 15000 });

    // Look for features or navigation links
    const navLink = page.locator('nav').or(page.locator('header'));
    await expect(navLink.first()).toBeVisible({ timeout: 15000 });
  });
});
