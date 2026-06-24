/**
 * KAN-80: Full dispatch flow E2E test
 *
 * Flow:
 *   1. Customer submits a job
 *   2. Dispatcher sees the job on the board
 *   3. Dispatcher classifies the job (keyword fallback — no AI key needed)
 *   4. Dispatcher opens the assign modal, locks and assigns a technician
 *   5. Customer tracking page shows the job as "assigned"
 *   6. Technician marks the job as "done"
 *   7. Tracking page confirms final status is "done"
 */

import { test, expect } from '@playwright/test';
import { loadCreds, loginAs } from './helpers';

let jobId: number;

test.describe('Full dispatch flow', () => {
  test('1. Customer submits a job', async ({ page }) => {
    const { customerEmail, customerPassword } = loadCreds();
    await loginAs(page, customerEmail, customerPassword);

    await page.goto('/customer');
    await page.waitForLoadState('networkidle');

    // Fill in the job submission form
    const textarea = page.getByRole('textbox', { name: /describe|problem|request/i })
      .or(page.locator('textarea').first());
    await textarea.fill('My kitchen sink has a burst pipe and is leaking badly');

    await page.getByRole('button', { name: /submit/i }).click();

    // Confirm submission succeeded — look for a job ID or success message
    const successText = page.getByText(/job.*submitted|request.*received|job #/i);
    await expect(successText).toBeVisible({ timeout: 10_000 });

    // Capture job ID from the page if displayed
    const idMatch = (await page.content()).match(/job\s*#?\s*(\d+)/i);
    if (idMatch) {
      jobId = parseInt(idMatch[1], 10);
    }
  });

  test('2. Dispatcher sees new job on the board', async ({ page }) => {
    const { dispatcherEmail, dispatcherPassword } = loadCreds();
    await loginAs(page, dispatcherEmail, dispatcherPassword);

    await page.goto('/dispatcher');
    await page.waitForLoadState('networkidle');

    // Board should have at least one job card
    const jobCards = page.locator('[data-testid="job-card"], .job-card').or(
      page.getByRole('article')
    );
    await expect(jobCards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('3. Dispatcher classifies a new job', async ({ page }) => {
    const { dispatcherEmail, dispatcherPassword } = loadCreds();
    await loginAs(page, dispatcherEmail, dispatcherPassword);

    await page.goto('/dispatcher');
    await page.waitForLoadState('networkidle');

    // Find a job with "new" status and click its classify button
    const classifyBtn = page.getByRole('button', { name: /classif/i }).first();
    await expect(classifyBtn).toBeVisible({ timeout: 10_000 });
    await classifyBtn.click();

    // After classification the job status should change to "categorized"
    await expect(
      page.getByText(/categorized/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('4. Dispatcher assigns a technician', async ({ page }) => {
    const { dispatcherEmail, dispatcherPassword } = loadCreds();
    await loginAs(page, dispatcherEmail, dispatcherPassword);

    await page.goto('/dispatcher');
    await page.waitForLoadState('networkidle');

    // Find a categorized job and open its assign modal
    const assignBtn = page.getByRole('button', { name: /assign/i }).first();
    await expect(assignBtn).toBeVisible({ timeout: 10_000 });
    await assignBtn.click();

    // Modal should appear
    const modal = page.getByRole('dialog').or(
      page.locator('[role="dialog"], .modal, [data-testid="assign-modal"]')
    );
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Select first available technician
    const techOption = modal.getByRole('radio').or(modal.getByRole('button', { name: /select|choose/i })).first();
    if (await techOption.isVisible()) {
      await techOption.click();
    }

    // Confirm assignment
    const confirmBtn = modal.getByRole('button', { name: /confirm|assign/i }).last();
    await confirmBtn.click();

    // Modal should close and job status should update to "assigned"
    await expect(modal).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/assigned/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('5. Customer tracking shows assigned status', async ({ page }) => {
    if (!jobId) test.skip();

    await page.goto(`/customer/tracking/${jobId}`);
    await page.waitForLoadState('networkidle');

    // Tracking page shows the job is assigned
    await expect(page.getByText(/assigned/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('6. Technician marks job as done via dispatcher status update', async ({ page }) => {
    const { dispatcherEmail, dispatcherPassword } = loadCreds();
    await loginAs(page, dispatcherEmail, dispatcherPassword);

    await page.goto('/dispatcher');
    await page.waitForLoadState('networkidle');

    // Advance an assigned job through en_route → done
    const enRouteBtn = page.getByRole('button', { name: /en.?route|mark.*(en route|on way)/i }).first();
    if (await enRouteBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await enRouteBtn.click();
      await page.waitForTimeout(500);
    }

    const doneBtn = page.getByRole('button', { name: /mark.*(done|complete)|done/i }).first();
    await expect(doneBtn).toBeVisible({ timeout: 10_000 });
    await doneBtn.click();

    await expect(page.getByText(/done/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('7. Tracking page confirms done status', async ({ page }) => {
    if (!jobId) test.skip();

    await page.goto(`/customer/tracking/${jobId}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/done/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
