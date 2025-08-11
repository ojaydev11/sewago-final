import { test, expect } from '@playwright/test';

test('i18n toggle and lite mode', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'ने' }).click();
  await page.getByRole('button', { name: 'EN' }).click();
});

test('SEO files and OpenGraph', async ({ page }) => {
  const res1 = await page.request.get('/sitemap.xml');
  expect(res1.ok()).toBeTruthy();
  const res2 = await page.request.get('/robots.txt');
  expect(res2.ok()).toBeTruthy();
  await page.goto('/services');
  const first = page.locator('a[href^="/services/"]').first();
  await first.click();
  await expect(page.locator('meta[property="og:title"]').first()).toBeTruthy();
});


