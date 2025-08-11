import { test, expect } from '@playwright/test';

test('register and login user', async ({ page }) => {
  const email = `e2e_${Date.now()}@ex.com`;
  await page.goto('/auth/register');
  await page.getByPlaceholder('Name').fill('E2E User');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Phone').fill('9811111111');
  await page.getByPlaceholder('Password').fill('pass');
  await page.getByRole('button', { name: /register/i }).click();
  await page.waitForURL('**/services');

  // logout by clearing token and go to login
  await page.addInitScript(() => localStorage.removeItem('sewago_access'));
  await page.goto('/auth/login');
  await page.getByPlaceholder('Email or Phone').fill(email);
  await page.getByPlaceholder('Password').fill('pass');
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL('**/services');
});


