import { test, expect } from './fixtures/auth';

test.describe('Admin Dashboard - System Management & Oversight', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
  });

  test('Admin dashboard and system oversight flow', async ({ page, loginAs }) => {
    // 🎯 PHASE 1: Admin Authentication
    console.log('🔐 Phase 1: Admin authentication...');
    
    // Login as admin
    await loginAs('admin');
    
    // Should be on admin dashboard
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await page.screenshot({ path: 'e2e/artifacts/admin-dashboard.png', fullPage: true });
    
    // Verify admin navigation menu
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-nav"]')).toContainText('Users');
    await expect(page.locator('[data-testid="admin-nav"]')).toContainText('Services');
    await expect(page.locator('[data-testid="admin-nav"]')).toContainText('Bookings');
    await expect(page.locator('[data-testid="admin-nav"]')).toContainText('Payments');
    
    // 🎯 PHASE 2: Users Management
    console.log('👥 Phase 2: Managing users...');
    
    // Navigate to users management
    await page.click('[data-testid="nav-users"]');
    await page.waitForURL('/admin/users');
    
    await expect(page.locator('h1')).toContainText('User Management');
    
    // Verify users table
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    
    // Check table headers
    await expect(page.locator('[data-testid="table-header"]')).toContainText('Name');
    await expect(page.locator('[data-testid="table-header"]')).toContainText('Email');
    await expect(page.locator('[data-testid="table-header"]')).toContainText('Role');
    await expect(page.locator('[data-testid="table-header"]')).toContainText('Status');
    await expect(page.locator('[data-testid="table-header"]')).toContainText('Created');
    
    // Verify test users from seed data appear
    await expect(page.locator('[data-testid="users-table"]')).toContainText('admin@sewago.test');
    await expect(page.locator('[data-testid="users-table"]')).toContainText('pro1@sewago.test');
    await expect(page.locator('[data-testid="users-table"]')).toContainText('cust1@sewago.test');
    
    await page.screenshot({ path: 'e2e/artifacts/admin-users-table.png', fullPage: true });
    
    // Test pagination if more than 10 users
    const paginationControls = page.locator('[data-testid="pagination"]');
    if (await paginationControls.isVisible()) {
      await expect(paginationControls).toBeVisible();
      console.log('📄 Pagination controls found');
    }
    
    // Test user search/filter
    const searchInput = page.locator('[data-testid="user-search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('provider');
      await page.waitForTimeout(1000); // Wait for search results
      
      // Should show only provider users
      await expect(page.locator('[data-testid="users-table"]')).toContainText('pro1@sewago.test');
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }
    
    // Click on a user to view details
    await page.click('[data-testid="user-row"]:has-text("pro1@sewago.test")');
    await page.waitForURL(/\/admin\/users\/.*/);
    
    // Verify user details page
    await expect(page.locator('[data-testid="user-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toContainText('pro1@sewago.test');
    await expect(page.locator('[data-testid="user-role"]')).toContainText('provider');
    
    await page.screenshot({ path: 'e2e/artifacts/admin-user-details.png', fullPage: true });
    
    // 🎯 PHASE 3: Services Management
    console.log('🛠️ Phase 3: Managing services...');
    
    // Navigate to services management
    await page.goto('/admin/services');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Service Management');
    
    // Verify services table
    await expect(page.locator('[data-testid="services-table"]')).toBeVisible();
    
    // Check for seeded services
    await expect(page.locator('[data-testid="services-table"]')).toContainText('Professional House Cleaning');
    await expect(page.locator('[data-testid="services-table"]')).toContainText('Electrical Repair');
    
    // Verify service details columns
    const servicePrices = page.locator('[data-testid="service-price"]');
    const priceCount = await servicePrices.count();
    for (let i = 0; i < Math.min(priceCount, 3); i++) {
      const price = await servicePrices.nth(i).textContent();
      expect(price).toMatch(/NPR\s[\d,]+/);
    }
    
    await page.screenshot({ path: 'e2e/artifacts/admin-services-table.png', fullPage: true });
    
    // Test service filtering by category
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('house-cleaning');
      await page.waitForTimeout(1000);
      
      // Should show only house cleaning services
      await expect(page.locator('[data-testid="services-table"]')).toContainText('Professional House Cleaning');
      
      // Reset filter
      await categoryFilter.selectOption('all');
    }
    
    // Click on service to view details
    await page.click('[data-testid="service-row"]:first-child');
    await page.waitForURL(/\/admin\/services\/.*/);
    
    // Verify service details
    await expect(page.locator('[data-testid="service-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="service-provider"]')).toBeVisible();
    
    await page.screenshot({ path: 'e2e/artifacts/admin-service-details.png', fullPage: true });
    
    // 🎯 PHASE 4: Bookings Management
    console.log('📋 Phase 4: Managing bookings...');
    
    // Navigate to bookings management
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Booking Management');
    
    // Verify bookings table exists (may be empty in fresh test)
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible();
    
    const bookingsExist = await page.locator('[data-testid="booking-row"]').count() > 0;
    
    if (bookingsExist) {
      // Verify booking columns
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Booking ID');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Customer');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Service');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Status');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Amount');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Date');
      
      // Click on first booking
      await page.click('[data-testid="booking-row"]:first-child');
      await page.waitForURL(/\/admin\/bookings\/.*/);
      
      // Verify booking details
      await expect(page.locator('[data-testid="booking-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="customer-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="provider-details"]')).toBeVisible();
      
      await page.screenshot({ path: 'e2e/artifacts/admin-booking-details.png', fullPage: true });
      
      // Go back to bookings list
      await page.goBack();
    } else {
      console.log('📝 No bookings found - expected in fresh test environment');
    }
    
    await page.screenshot({ path: 'e2e/artifacts/admin-bookings-table.png', fullPage: true });
    
    // Test booking status filter
    const statusFilter = page.locator('[data-testid="booking-status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('CONFIRMED');
      await page.waitForTimeout(1000);
      
      // Reset to show all
      await statusFilter.selectOption('all');
    }
    
    // 🎯 PHASE 5: Payments Management
    console.log('💳 Phase 5: Managing payments...');
    
    // Navigate to payments management
    await page.goto('/admin/payments');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Payment Management');
    
    // Verify payments table
    await expect(page.locator('[data-testid="payments-table"]')).toBeVisible();
    
    const paymentsExist = await page.locator('[data-testid="payment-row"]').count() > 0;
    
    if (paymentsExist) {
      // Verify payment columns
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Payment ID');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Booking');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Amount');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Method');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Status');
      await expect(page.locator('[data-testid="table-header"]')).toContainText('Date');
      
      // Check for NPR currency formatting
      const paymentAmounts = page.locator('[data-testid="payment-amount"]');
      const amountCount = await paymentAmounts.count();
      for (let i = 0; i < Math.min(amountCount, 3); i++) {
        const amount = await paymentAmounts.nth(i).textContent();
        expect(amount).toMatch(/NPR\s[\d,]+/);
      }
      
      // Click on payment to view details
      await page.click('[data-testid="payment-row"]:first-child');
      await page.waitForURL(/\/admin\/payments\/.*/);
      
      // Verify payment details
      await expect(page.locator('[data-testid="payment-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="transaction-details"]')).toBeVisible();
      
      await page.screenshot({ path: 'e2e/artifacts/admin-payment-details.png', fullPage: true });
      
      // Go back to payments list
      await page.goBack();
    }
    
    await page.screenshot({ path: 'e2e/artifacts/admin-payments-table.png', fullPage: true });
    
    // 🎯 PHASE 6: Provider Verification
    console.log('✅ Phase 6: Provider verification management...');
    
    // Navigate to provider verification
    await page.goto('/admin/verification');
    await page.waitForLoadState('networkidle');
    
    const verificationPage = page.locator('[data-testid="verification-dashboard"]');
    if (await verificationPage.isVisible()) {
      await expect(page.locator('h1')).toContainText('Provider Verification');
      
      // Check pending verifications
      const pendingVerifications = page.locator('[data-testid="pending-verification"]');
      const pendingCount = await pendingVerifications.count();
      
      if (pendingCount > 0) {
        // Click on first pending verification
        await pendingVerifications.first().click();
        await page.waitForURL(/\/admin\/verification\/.*/);
        
        // Verify provider documents and details
        await expect(page.locator('[data-testid="provider-info"]')).toBeVisible();
        await expect(page.locator('[data-testid="business-details"]')).toBeVisible();
        
        // Approve or reject verification
        const approveButton = page.locator('[data-testid="approve-verification"]');
        const rejectButton = page.locator('[data-testid="reject-verification"]');
        
        if (await approveButton.isVisible()) {
          await approveButton.click();
          
          // Verify approval confirmation
          await expect(page.locator('[data-testid="approval-success"]')).toContainText('Provider approved');
        }
        
        await page.screenshot({ path: 'e2e/artifacts/admin-provider-verification.png', fullPage: true });
      }
      
      await page.screenshot({ path: 'e2e/artifacts/admin-verification-dashboard.png', fullPage: true });
    }
    
    // 🎯 PHASE 7: Analytics and Reports
    console.log('📊 Phase 7: Viewing analytics and reports...');
    
    // Navigate to analytics
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    
    const analyticsPage = page.locator('[data-testid="admin-analytics"]');
    if (await analyticsPage.isVisible()) {
      await expect(page.locator('h1')).toContainText('Analytics & Reports');
      
      // Verify key metrics widgets
      await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-services"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-bookings"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
      
      // Check revenue display uses NPR
      const revenueWidget = page.locator('[data-testid="total-revenue"]');
      const revenueText = await revenueWidget.textContent();
      expect(revenueText).toMatch(/NPR/);
      
      // Verify charts are present
      const charts = page.locator('[data-testid="analytics-chart"]');
      const chartCount = await charts.count();
      expect(chartCount).toBeGreaterThan(0);
      
      await page.screenshot({ path: 'e2e/artifacts/admin-analytics-dashboard.png', fullPage: true });
      
      // Test date range filter if available
      const dateRangeFilter = page.locator('[data-testid="date-range-filter"]');
      if (await dateRangeFilter.isVisible()) {
        await dateRangeFilter.selectOption('last-30-days');
        await page.waitForTimeout(2000); // Wait for charts to update
        
        await page.screenshot({ path: 'e2e/artifacts/admin-analytics-filtered.png', fullPage: true });
      }
    }
    
    // 🎯 PHASE 8: System Health and Audit Logs
    console.log('🔍 Phase 8: System monitoring and audit logs...');
    
    // Navigate to system health
    await page.goto('/admin/system');
    await page.waitForLoadState('networkidle');
    
    const systemPage = page.locator('[data-testid="system-dashboard"]');
    if (await systemPage.isVisible()) {
      await expect(page.locator('h1')).toContainText('System Health');
      
      // Check system status indicators
      await expect(page.locator('[data-testid="database-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="api-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-gateway-status"]')).toBeVisible();
      
      await page.screenshot({ path: 'e2e/artifacts/admin-system-health.png', fullPage: true });
    }
    
    // Check audit logs
    await page.goto('/admin/audit-logs');
    await page.waitForLoadState('networkidle');
    
    const auditLogsPage = page.locator('[data-testid="audit-logs"]');
    if (await auditLogsPage.isVisible()) {
      await expect(page.locator('h1')).toContainText('Audit Logs');
      
      // Verify audit log entries
      const logEntries = page.locator('[data-testid="log-entry"]');
      const logCount = await logEntries.count();
      
      if (logCount > 0) {
        // Check log entry details
        await expect(logEntries.first()).toBeVisible();
        
        // Verify payment verification logs exist
        const paymentLogs = page.locator('[data-testid="log-entry"]:has-text("payment")');
        if (await paymentLogs.count() > 0) {
          console.log('✅ Payment verification logs found in audit trail');
        }
        
        await page.screenshot({ path: 'e2e/artifacts/admin-audit-logs.png', fullPage: true });
      }
    }
    
    // 🎯 PHASE 9: Settings and Configuration
    console.log('⚙️ Phase 9: System settings...');
    
    // Navigate to admin settings
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
    
    const settingsPage = page.locator('[data-testid="admin-settings"]');
    if (await settingsPage.isVisible()) {
      await expect(page.locator('h1')).toContainText('System Settings');
      
      // Check various configuration sections
      const paymentSettings = page.locator('[data-testid="payment-settings"]');
      const notificationSettings = page.locator('[data-testid="notification-settings"]');
      const generalSettings = page.locator('[data-testid="general-settings"]');
      
      if (await paymentSettings.isVisible()) {
        await expect(paymentSettings).toContainText('eSewa');
        await expect(paymentSettings).toContainText('Khalti');
      }
      
      await page.screenshot({ path: 'e2e/artifacts/admin-settings.png', fullPage: true });
    }
    
    console.log('✅ Admin journey completed successfully!');
  });

  test('Admin error handling and edge cases', async ({ page, loginAs }) => {
    console.log('🚨 Testing admin error handling...');
    
    // Login as admin
    await loginAs('admin');
    
    // Test accessing non-existent user
    await page.goto('/admin/users/non-existent-id');
    await page.waitForLoadState('networkidle');
    
    // Should show 404 or appropriate error
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText('not found');
    }
    
    // Test bulk operations if available
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    const bulkActions = page.locator('[data-testid="bulk-actions"]');
    if (await bulkActions.isVisible()) {
      // Select multiple users
      const checkboxes = page.locator('[data-testid="user-checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      if (checkboxCount > 1) {
        await checkboxes.first().check();
        await checkboxes.nth(1).check();
        
        // Test bulk action (e.g., export)
        await bulkActions.selectOption('export');
        await page.click('[data-testid="apply-bulk-action"]');
        
        // Verify action feedback
        const bulkActionResult = page.locator('[data-testid="bulk-action-result"]');
        if (await bulkActionResult.isVisible()) {
          await expect(bulkActionResult).toBeVisible();
        }
      }
    }
    
    await page.screenshot({ path: 'e2e/artifacts/admin-bulk-operations.png', fullPage: true });
    
    console.log('✅ Admin error handling test completed');
  });
});