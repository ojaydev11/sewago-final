import { test, expect, request, chromium } from '@playwright/test';

test('user books, chat realtime, provider completes, user reviews', async ({ page, baseURL, browser }) => {
  const apiBase = `${(new URL(baseURL!)).origin.replace(/:\d+$/, ':4100')}/api`;
  const ctx = await request.newContext();
  await ctx.post(`${apiBase}/admin/seed`, { headers: { 'X-Seed-Key': 'dev-seed-key' } });
  // Login as seeded user
  await page.goto('/auth/login');
  await page.getByPlaceholder('Email or Phone').fill('user1@example.com');
  await page.getByPlaceholder('Password').fill('password123');
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL('**/services');

  // Open a service and book
  await page.goto('/services');
  await page.locator('a[href^="/services/"]').first().click();
  await page.getByRole('button', { name: /book now/i }).click();

  // Open dashboards to ensure booking appears
  await page.goto('/dashboard/user');
  await expect(page.getByText(/pending|completed|accepted/)).toBeVisible();

  // Provider context
  const providerContext = await browser.newContext();
  const providerPage = await providerContext.newPage();
  await providerPage.goto('/auth/login');
  await providerPage.getByPlaceholder('Email or Phone').fill('provider1@example.com');
  await providerPage.getByPlaceholder('Password').fill('password123');
  await providerPage.getByRole('button', { name: /login/i }).click();
  await providerPage.waitForURL('**/services');
  await providerPage.goto('/dashboard/provider');

  // Navigate to chat room artificially: get latest booking id from API
  const tokenUser = await page.evaluate(() => localStorage.getItem('sewago_access'));
  const bookingsRes = await ctx.get(`${apiBase}/bookings/me`, { headers: { Authorization: `Bearer ${tokenUser}` } });
  const bookings = await bookingsRes.json();
  const bookingId = bookings[0]._id as string;
  await page.goto(`/chat/${bookingId}`);
  await providerPage.goto(`/chat/${bookingId}`);

  // Send message and assert it appears
  await page.getByPlaceholder('Type a message').fill('Hello from user');
  await page.getByRole('button', { name: /send/i }).click();
  await expect(providerPage.getByText('Hello from user')).toBeVisible();

  // Provider completes
  await providerPage.goto('/dashboard/provider');
  await providerPage.getByRole('button', { name: /mark completed/i }).first().click();

  // User leaves review via API for simplicity
  const reviewRes = await ctx.post(`${apiBase}/reviews`, {
    data: { bookingId, rating: 5, comment: 'great' },
    headers: { Authorization: `Bearer ${tokenUser}` },
  });
  expect(reviewRes.ok()).toBeTruthy();
});


