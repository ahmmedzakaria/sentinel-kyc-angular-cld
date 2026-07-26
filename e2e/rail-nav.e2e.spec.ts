import { expect, test } from '@playwright/test';
import { loginAsDemoUser } from './helpers';

test.describe('Rail navigation (5-level tree)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page);
  });

  test('drilling into Banking > Core Banking > Operation opens the mega panel, and selecting a wired feature navigates', async ({
    page
  }) => {
    // Level 1 -> 2
    await page.getByRole('button', { name: 'Banking' }).click();
    await expect(page.getByRole('button', { name: 'Core Banking' })).toBeVisible();

    // Level 2 -> 3
    await page.getByRole('button', { name: 'Core Banking' }).click();
    await expect(page.getByText('Operation', { exact: true })).toBeVisible();
    await expect(page.getByText('Setup', { exact: true })).toBeVisible();
    await expect(page.getByText('Report', { exact: true })).toBeVisible();

    // Level 3 -> mega panel
    await page.getByText('Operation', { exact: true }).hover();
    await expect(page.getByText('Customer Management')).toBeVisible();

    // Customer Search is wired to the People CRUD route
    await page.getByText('Customer Search', { exact: true }).click();
    await expect(page).toHaveURL(/customers\/list/);
  });

  test('Expand to level 3 opens every group and module at once', async ({ page }) => {
    await page.getByRole('button', { name: 'Expand to level 3' }).click();
    await expect(page.getByRole('button', { name: 'Core Banking' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retail POS' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Collapse to level 3' })).toBeVisible();
  });

  test('theme picker updates the active accent', async ({ page }) => {
    await page.getByRole('button', { name: /Light/ }).click();
    await page.getByText('Navy Banking').click();

    await expect(page.locator('body')).toHaveAttribute('data-theme', 'navy');
    await expect(page.locator('body')).toHaveClass(/dark/);
  });
});
