import * as fs from 'fs';
import { Page } from '@playwright/test';

export interface Creds {
  customerEmail: string;
  customerPassword: string;
  dispatcherEmail: string;
  dispatcherPassword: string;
}

export function loadCreds(): Creds {
  const file = process.env.E2E_CREDS_FILE ?? require('path').join(__dirname, '../.e2e-creds.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  // Wait for redirect away from login
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10_000 });
}
