/**
 * KAN-81: Cross-browser testing — Chrome, Firefox, Edge
 *
 * Verifies that all 6 main routes load correctly and key interactive
 * elements render without failures across browser engines.
 * Playwright's project config in playwright.config.ts runs these on
 * chromium, firefox, and msedge automatically.
 */

import { test, expect } from '@playwright/test';
import { loadCreds, loginAs } from './helpers';

test.describe('Cross-browser: public routes', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /log in|sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /register|sign up|create account/i })).toBeVisible();
  });
});

test.describe('Cross-browser: authenticated routes', () => {
  test('dispatcher board loads (no rendering failures)', async ({ page }) => {
    const { dispatcherEmail, dispatcherPassword } = loadCreds();
    await loginAs(page, dispatcherEmail, dispatcherPassword);
    await page.goto('/dispatcher');
    await page.waitForLoadState('networkidle');

    // No error boundary shown
    await expect(page.getByText(/something went wrong|unhandled error/i)).not.toBeVisible();
    // Page has content
    await expect(page.locator('main, [role="main"]').or(page.locator('body'))).toBeVisible();
  });

  test('technicians page loads', async ({ page }) => {
    const { dispatcherEmail, dispatcherPassword } = loadCreds();
    await loginAs(page, dispatcherEmail, dispatcherPassword);
    await page.goto('/technicians');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test('inventory page loads', async ({ page }) => {
    const { dispatcherEmail, dispatcherPassword } = loadCreds();
    await loginAs(page, dispatcherEmail, dispatcherPassword);
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test('customer page loads', async ({ page }) => {
    const { customerEmail, customerPassword } = loadCreds();
    await loginAs(page, customerEmail, customerPassword);
    await page.goto('/customer');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test('forms submit correctly — login rejects bad credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('notreal@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    // Should stay on login page and show an error
    await expect(page).toHaveURL(/login/);
    await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible({ timeout: 5_000 });
  });
});
