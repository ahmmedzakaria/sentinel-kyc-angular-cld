import { Page } from '@playwright/test';

export async function loginAsDemoUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill('amina.osei@sentinel-kyc.com');
  await page.getByPlaceholder('••••••••').fill('Password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/dashboard/);
}
