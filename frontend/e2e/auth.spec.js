import { test, expect } from '@playwright/test';

test.describe('Authentication Flow E2E', () => {
  test('should display login form and validate credentials', async ({ page }) => {
    // Intercept auth endpoints to avoid flaky cross-network dependencies
    await page.route('**/api/**/auth/me', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Not authenticated' }) });
    });
    await page.route('**/api/**/auth/login', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Invalid credentials' }) });
    });

    await page.goto('/login');

    // Verify title and input elements are mounted
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 15000 });
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 15000 });

    // Fill invalid credentials
    await emailInput.fill('invalid@nonexistent.com');
    await passwordInput.fill('wrongpassword');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify error feedback appears
    await expect(
      page.locator('text=Invalid credentials').or(page.locator('text=failed')).or(page.locator('.sonner-toast'))
    ).toBeVisible({ timeout: 15000 });
  });

  test('should allow navigation to register page', async ({ page }) => {
    await page.route('**/api/**/auth/me', async (route) => {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Not authenticated' }) });
    });

    await page.goto('/login');
    const registerLink = page.locator('a[href="/register"]').or(page.locator('text=Sign up')).or(page.locator('text=Register'));
    await expect(registerLink.first()).toBeVisible({ timeout: 15000 });
    await registerLink.first().click();
    await expect(page).toHaveURL(/.*register.*/, { timeout: 15000 });
  });
});
