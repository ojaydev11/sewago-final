import { test, expect, request } from '@playwright/test';

test('payments stubs JSON shape', async ({ baseURL, page }) => {
  const apiBase = `${(new URL(baseURL!)).origin.replace(/:\d+$/, ':4100')}/api`;
  const ctx = await request.newContext();
  // register user
  await page.goto('/auth/register');
  const email = `pay_${Date.now()}@ex.com`;
  await page.getByPlaceholder('Name').fill('Pay User');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Phone').fill('9833333333');
  await page.getByPlaceholder('Password').fill('pass');
  await page.getByRole('button', { name: /register/i }).click();
  await page.waitForURL('**/services');
  const token = await page.evaluate(() => localStorage.getItem('sewago_access'));
  const esewa = await ctx.post(`${apiBase}/payments/esewa/initiate`, { headers: { Authorization: `Bearer ${token}` } });
  expect(esewa.ok()).toBeTruthy();
  const ejson = await esewa.json();
  expect(ejson.ok).toBe(true);
  const khalti = await ctx.post(`${apiBase}/payments/khalti/initiate`, { headers: { Authorization: `Bearer ${token}` } });
  expect(khalti.ok()).toBeTruthy();
  const kjson = await khalti.json();
  expect(kjson.ok).toBe(true);
});


