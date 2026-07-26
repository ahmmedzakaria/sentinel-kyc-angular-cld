import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('unauthenticated visitors are redirected to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logging in with the demo account reaches the dashboard, and logout returns to /login', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('you@example.com').fill('amina.osei@sentinel-kyc.com');
    await page.getByPlaceholder('••••••••').fill('Password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('button', { name: 'AO' })).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('registering a new account logs the user in automatically', async ({ page }) => {
    await page.goto('/register');

    await page.getByPlaceholder('Jane Doe').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill(`test.${Date.now()}@example.com`);
    await page.getByPlaceholder('At least 8 characters').fill('supersecret1');
    await page.getByPlaceholder('••••••••').fill('supersecret1');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
