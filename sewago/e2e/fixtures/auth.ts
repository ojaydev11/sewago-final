import { test as base, expect } from '@playwright/test';

// Test accounts from seed data
export const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@sewago.test',
    password: 'Admin!2345',
    role: 'admin'
  },
  provider: {
    email: 'pro1@sewago.test',
    password: 'Pro!2345',
    role: 'provider'
  },
  customer: {
    email: 'cust1@sewago.test',
    password: 'Cust!2345',
    role: 'user'
  }
};

export type TestAccount = keyof typeof TEST_ACCOUNTS;

// Extend base test to include authentication helpers
export const test = base.extend<{
  loginAs: (account: TestAccount) => Promise<void>;
  logout: () => Promise<void>;
}>({
  loginAs: async ({ page }, use) => {
    const loginAs = async (account: TestAccount) => {
      const accountData = TEST_ACCOUNTS[account];
      
      // Go to login page
      await page.goto('/auth/login');
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', accountData.email);
      await page.fill('[data-testid="password-input"]', accountData.password);
      
      // Submit form
      await page.click('[data-testid="login-button"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 });
      
      // Verify login success
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      console.log(`✅ Logged in as ${account}: ${accountData.email}`);
    };
    
    await use(loginAs);
  },

  logout: async ({ page }, use) => {
    const logout = async () => {
      // Click user menu
      await page.click('[data-testid="user-menu"]');
      
      // Click logout
      await page.click('[data-testid="logout-button"]');
      
      // Wait for redirect to home page
      await page.waitForURL('/', { timeout: 5000 });
      
      console.log('✅ Logged out successfully');
    };
    
    await use(logout);
  }
});

export { expect } from '@playwright/test';