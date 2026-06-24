/**
 * Global setup: create the seed test accounts (customer + dispatcher) via
 * the API before any test runs. The accounts use a unique timestamp suffix so
 * parallel CI runs don't collide. Credentials are written to a temp file that
 * the tests read via the E2E_CREDS env var pattern.
 *
 * Assumptions:
 *   - The backend is reachable at API_URL (default http://localhost:8000)
 *   - An admin account already exists (seeded with seed_admin.py)
 */

import * as fs from 'fs';
import * as path from 'path';

const API = process.env.API_URL ?? 'http://localhost:8000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@fieldroute.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'adminpassword';

async function post(path: string, body: object, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`POST ${path} failed ${res.status}: ${err}`);
  }
  return res.json();
}

export default async function globalSetup() {
  const ts = Date.now();
  const customerEmail = `e2e_customer_${ts}@test.com`;
  const customerPassword = 'Test1234!';

  // Register a customer account (self-service)
  await post('/auth/register', {
    email: customerEmail,
    password: customerPassword,
    name: 'E2E Customer',
  });

  // Log in as admin to create a dispatcher
  const adminLogin = await post('/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const adminToken: string = adminLogin.access_token;

  const dispatcherEmail = `e2e_dispatcher_${ts}@test.com`;
  const dispatcherPassword = 'Test1234!';
  await post('/admin/dispatchers', {
    email: dispatcherEmail,
    password: dispatcherPassword,
    name: 'E2E Dispatcher',
  }, adminToken);

  // Persist credentials so tests can read them
  const creds = { customerEmail, customerPassword, dispatcherEmail, dispatcherPassword };
  const credsFile = path.join(__dirname, '.e2e-creds.json');
  fs.writeFileSync(credsFile, JSON.stringify(creds, null, 2));
  process.env.E2E_CREDS_FILE = credsFile;
}
