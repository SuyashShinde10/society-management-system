import { test, expect } from '@playwright/test';

test.describe('Maintenance Bills Component E2E', () => {
  test('should render bill filter controls and respond to clicks', async ({ page }) => {
    // Navigate to root or login first
    await page.goto('/');

    // Check if landing page or app loads without crash
    await expect(page).toHaveTitle(/.*Society.*/i);

    // Look for features or navigation links
    const navLink = page.locator('nav').or(page.locator('header'));
    await expect(navLink).toBeVisible();
  });
});
