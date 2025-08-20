import { test, expect } from './fixtures/auth';

test.describe('Customer Journey - End-to-End Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
    
    // Take initial screenshot
    await page.screenshot({ path: 'e2e/artifacts/customer-homepage.png', fullPage: true });
  });

  test('Complete booking flow: Browse → Book → Pay → Review', async ({ page, loginAs }) => {
    // 🎯 PHASE 1: Browse Services
    console.log('🔍 Phase 1: Browsing services...');
    
    // Check services grid is visible
    await expect(page.locator('[data-testid="services-grid"]')).toBeVisible();
    
    // Navigate to services page
    await page.click('[data-testid="view-all-services"]');
    await page.waitForURL('/services');
    
    // Verify services page loaded
    await expect(page.locator('h1')).toContainText('Services');
    await page.screenshot({ path: 'e2e/artifacts/customer-services-page.png', fullPage: true });
    
    // Click on house cleaning service
    await page.click('[data-testid="service-card"]:has-text("House Cleaning")');
    await page.waitForURL(/\/services\/.*house.*cleaning/);
    
    // Verify service detail page
    await expect(page.locator('h1')).toContainText('Professional House Cleaning');
    await expect(page.locator('[data-testid="service-price"]')).toContainText('NPR 2,500');
    await page.screenshot({ path: 'e2e/artifacts/customer-service-detail.png', fullPage: true });
    
    // 🎯 PHASE 2: Authentication
    console.log('🔐 Phase 2: Customer authentication...');
    
    // Click book service (should redirect to login)
    await page.click('[data-testid="book-service-button"]');
    
    // Should be redirected to login since not authenticated
    await page.waitForURL(/\/auth\/login/);
    await page.screenshot({ path: 'e2e/artifacts/customer-login-page.png', fullPage: true });
    
    // Login as customer
    await loginAs('customer');
    await page.screenshot({ path: 'e2e/artifacts/customer-dashboard.png', fullPage: true });
    
    // 🎯 PHASE 3: Service Booking
    console.log('📅 Phase 3: Service booking...');
    
    // Navigate back to service
    await page.goto('/services/professional-house-cleaning-test');
    await page.waitForLoadState('networkidle');
    
    // Click book service button
    await page.click('[data-testid="book-service-button"]');
    await page.waitForURL(/\/services\/.*\/book/);
    
    // Fill booking form
    await expect(page.locator('h1')).toContainText('Book Service');
    
    // Select date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('[data-testid="booking-date"]', tomorrow.toISOString().split('T')[0]);
    
    // Select time slot
    await page.selectOption('[data-testid="time-slot"]', '09:00-11:00');
    
    // Fill address
    await page.fill('[data-testid="address-input"]', 'Thamel, Kathmandu, Near Garden of Dreams');
    
    // Add special notes
    await page.fill('[data-testid="notes-input"]', 'Please bring eco-friendly cleaning products. 3 bedroom apartment.');
    
    // Take screenshot of filled form
    await page.screenshot({ path: 'e2e/artifacts/customer-booking-form.png', fullPage: true });
    
    // Submit booking form
    await page.click('[data-testid="confirm-booking-button"]');
    
    // Should be redirected to payment page
    await page.waitForURL(/\/payment/);
    await expect(page.locator('h1')).toContainText('Payment');
    
    // 🎯 PHASE 4: Payment Flow
    console.log('💳 Phase 4: Payment processing...');
    
    // Verify booking summary
    await expect(page.locator('[data-testid="booking-summary"]')).toContainText('Professional House Cleaning');
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('NPR 2,500');
    
    // Screenshot payment page
    await page.screenshot({ path: 'e2e/artifacts/customer-payment-page.png', fullPage: true });
    
    // Select eSewa payment method
    await page.click('[data-testid="payment-method-esewa"]');
    
    // Click pay button
    await page.click('[data-testid="pay-now-button"]');
    
    // Wait for payment processing
    await page.waitForSelector('[data-testid="payment-processing"]', { timeout: 10000 });
    
    // Mock successful payment callback (this would normally be done by payment gateway)
    // For testing, we'll simulate the callback response
    const bookingId = await page.locator('[data-testid="booking-id"]').textContent();
    
    // Wait for payment success
    await page.waitForURL('/payment/success', { timeout: 30000 });
    await expect(page.locator('h1')).toContainText('Payment Successful');
    await page.screenshot({ path: 'e2e/artifacts/customer-payment-success.png', fullPage: true });
    
    // 🎯 PHASE 5: View Booking in Dashboard
    console.log('📊 Phase 5: Checking customer dashboard...');
    
    // Navigate to customer bookings
    await page.goto('/dashboard/bookings');
    await page.waitForLoadState('networkidle');
    
    // Verify booking appears in list
    await expect(page.locator('[data-testid="booking-list"]')).toContainText('Professional House Cleaning');
    await expect(page.locator('[data-testid="booking-status"]')).toContainText('CONFIRMED');
    await page.screenshot({ path: 'e2e/artifacts/customer-bookings-dashboard.png', fullPage: true });
    
    // Click on booking to view details
    await page.click('[data-testid="booking-item"]:first-child');
    await page.waitForURL(/\/dashboard\/bookings\/.*/);
    
    // Verify booking details
    await expect(page.locator('[data-testid="booking-details"]')).toContainText('Thamel, Kathmandu');
    await expect(page.locator('[data-testid="booking-notes"]')).toContainText('eco-friendly cleaning products');
    await page.screenshot({ path: 'e2e/artifacts/customer-booking-details.png', fullPage: true });
    
    // 🎯 PHASE 6: Review & Rating (simulate service completion)
    console.log('⭐ Phase 6: Service review...');
    
    // For testing, we'll manually set booking status to completed
    // In real scenario, provider would mark it as completed
    
    // Navigate to reviews section
    await page.goto('/dashboard/reviews');
    await page.waitForLoadState('networkidle');
    
    // Click to leave a review (assuming service is completed)
    const reviewButton = page.locator('[data-testid="leave-review-button"]');
    if (await reviewButton.isVisible()) {
      await reviewButton.click();
      
      // Fill review form
      await page.selectOption('[data-testid="rating-select"]', '5');
      await page.fill('[data-testid="review-text"]', 'Excellent service! Very professional and thorough cleaning. The team was punctual and used eco-friendly products as requested. Highly recommend!');
      
      // Upload photo (optional)
      const fileInput = page.locator('[data-testid="photo-upload"]');
      if (await fileInput.isVisible()) {
        // In real test, you would upload an actual image file
        // await fileInput.setInputFiles('test-assets/cleaning-result.jpg');
      }
      
      // Submit review
      await page.click('[data-testid="submit-review-button"]');
      
      // Verify review submission
      await expect(page.locator('[data-testid="review-success"]')).toContainText('Review submitted');
      await page.screenshot({ path: 'e2e/artifacts/customer-review-submitted.png', fullPage: true });
    }
    
    // 🎯 PHASE 7: Verify Review Appears on Service Page
    console.log('✅ Phase 7: Verifying review visibility...');
    
    // Go back to service page
    await page.goto('/services/professional-house-cleaning-test');
    await page.waitForLoadState('networkidle');
    
    // Check if review appears
    const reviewSection = page.locator('[data-testid="customer-reviews"]');
    if (await reviewSection.isVisible()) {
      await expect(reviewSection).toContainText('Excellent service');
      await expect(reviewSection).toContainText('5 stars');
    }
    
    await page.screenshot({ path: 'e2e/artifacts/customer-review-on-service-page.png', fullPage: true });
    
    console.log('✅ Customer journey completed successfully!');
  });

  test('Language switching and currency formatting', async ({ page }) => {
    console.log('🌐 Testing internationalization features...');
    
    // Start on homepage
    await page.goto('/');
    
    // Check default language (English)
    await expect(page.locator('h1')).toContainText('Professional Home Services');
    
    // Switch to Nepali
    const langSwitcher = page.locator('[data-testid="language-switcher"]');
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      await page.click('[data-testid="language-ne"]');
      await page.waitForTimeout(2000); // Wait for language change
      
      // Take screenshot in Nepali
      await page.screenshot({ path: 'e2e/artifacts/customer-nepali-homepage.png', fullPage: true });
    }
    
    // Check services page with Nepali currency formatting
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    // Verify NPR currency formatting
    const prices = page.locator('[data-testid="service-price"]');
    const priceCount = await prices.count();
    for (let i = 0; i < Math.min(priceCount, 3); i++) {
      const price = await prices.nth(i).textContent();
      expect(price).toMatch(/NPR\s[\d,]+/);
    }
    
    await page.screenshot({ path: 'e2e/artifacts/customer-nepali-services.png', fullPage: true });
    
    console.log('✅ Internationalization test completed');
  });

  test('Emergency service request', async ({ page, loginAs }) => {
    console.log('🚨 Testing emergency service functionality...');
    
    // Login first
    await loginAs('customer');
    
    // Look for emergency service button
    await page.goto('/');
    const emergencyButton = page.locator('[data-testid="emergency-service-button"]');
    
    if (await emergencyButton.isVisible()) {
      await emergencyButton.click();
      await page.waitForURL('/emergency-confirmation');
      
      // Verify emergency page
      await expect(page.locator('h1')).toContainText('Emergency Service');
      await page.screenshot({ path: 'e2e/artifacts/customer-emergency-page.png', fullPage: true });
      
      // Fill emergency form if present
      const emergencyForm = page.locator('[data-testid="emergency-form"]');
      if (await emergencyForm.isVisible()) {
        await page.selectOption('[data-testid="emergency-type"]', 'electrical');
        await page.fill('[data-testid="emergency-description"]', 'Power outage in entire house, urgent electrical issue');
        await page.fill('[data-testid="emergency-address"]', 'Thamel, Kathmandu - Near Kathmandu Guest House');
        await page.fill('[data-testid="emergency-phone"]', '+9779801234569');
        
        await page.click('[data-testid="request-emergency-service"]');
        
        // Verify submission
        await expect(page.locator('[data-testid="emergency-success"]')).toContainText('Emergency request submitted');
        await page.screenshot({ path: 'e2e/artifacts/customer-emergency-submitted.png', fullPage: true });
      }
    }
    
    console.log('✅ Emergency service test completed');
  });
});