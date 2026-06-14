import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads and shows Overview heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible({ timeout: 10000 });
  });

  test('shows stat cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('TOTAL SPENT')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('REMAINING')).toBeVisible();
    await expect(page.getByText('TOP CATEGORY')).toBeVisible();
    await expect(page.getByText('BUDGET USED')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('navigates to Transactions page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /transactions/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible({ timeout: 8000 });
  });

  test('navigates to Budget page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /budget/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Budget' })).toBeVisible({ timeout: 8000 });
  });

  test('navigates to Reports page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /reports/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Transactions page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    await page.getByRole('heading', { name: 'Transactions' }).waitFor({ timeout: 10000 });
  });

  test('shows Add button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add/i })).toBeVisible({ timeout: 8000 });
  });

  test('shows search input', async ({ page }) => {
    await expect(page.getByPlaceholder('Search...')).toBeVisible({ timeout: 8000 });
  });

  test('shows month navigator', async ({ page }) => {
    await expect(page.getByText(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i).first()).toBeVisible({ timeout: 8000 });
  });
});

test.describe('404 page', () => {
  test('shows not found message for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
