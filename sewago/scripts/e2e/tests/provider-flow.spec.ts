import { test, expect, request } from '@playwright/test';

test('provider registration and create service', async ({ page, baseURL }) => {
  const email = `prov_${Date.now()}@ex.com`;
  await page.goto('/auth/register?role=provider');
  await page.getByPlaceholder('Name').fill('E2E Provider');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Phone').fill('9822222222');
  await page.getByPlaceholder('Password').fill('pass');
  await page.getByRole('button', { name: /register/i }).click();
  await page.waitForURL('**/services');

  // Call seed to ensure a sample service exists and role is provider
  const ctx = await request.newContext();
  await ctx.post(`${(new URL(baseURL!)).origin.replace(/:\d+$/, ':4100')}/api/admin/seed`, { headers: { 'X-Seed-Key': 'dev-seed-key' } });

  // Minimal create service via API if UI is missing
  const token = await page.evaluate(() => localStorage.getItem('sewago_access'));
  const res = await ctx.post(`${(new URL(baseURL!)).origin.replace(/:\d+$/, ':4100')}/api/services`, {
    data: { title: 'Test Service', category: 'cleaning', description: 'desc', basePrice: 999, images: [], location: 'Kathmandu' },
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
});


