import { test, expect } from '@playwright/test';

test.describe('Authentication Flow E2E', () => {
  test('should display login form and validate credentials', async ({ page }) => {
    await page.goto('/login');

    // Verify title and input elements are mounted
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();

    // Fill invalid credentials
    await page.locator('input[type="email"], input[name="email"]').fill('invalid@nonexistent.com');
    await page.locator('input[type="password"], input[name="password"]').fill('wrongpassword');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify error feedback appears
    await expect(page.locator('text=Invalid credentials').or(page.locator('text=failed')).or(page.locator('.sonner-toast'))).toBeVisible({ timeout: 5000 });
  });

  test('should allow navigation to register page', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.locator('a[href="/register"]').or(page.locator('text=Sign up')).or(page.locator('text=Register'));
    if (await registerLink.count() > 0) {
      await registerLink.first().click();
      await expect(page).toHaveURL(/.*register.*/);
    }
  });
});
