import { test, expect } from './fixtures/auth';

test.describe('Provider Journey - Service Management & Bookings', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
  });

  test('Provider dashboard and service management flow', async ({ page, loginAs }) => {
    // 🎯 PHASE 1: Provider Login
    console.log('🔐 Phase 1: Provider authentication...');
    
    // Login as provider
    await loginAs('provider');
    
    // Should be on provider dashboard
    await expect(page.locator('h1')).toContainText('Provider Dashboard');
    await page.screenshot({ path: 'e2e/artifacts/provider-dashboard.png', fullPage: true });
    
    // 🎯 PHASE 2: Service Management
    console.log('🛠️ Phase 2: Managing services...');
    
    // Navigate to services management
    await page.click('[data-testid="manage-services"]');
    await page.waitForURL('/provider/services');
    
    // Verify services page
    await expect(page.locator('h1')).toContainText('My Services');
    
    // Check existing services from seed data
    await expect(page.locator('[data-testid="service-list"]')).toContainText('Professional House Cleaning');
    await expect(page.locator('[data-testid="service-list"]')).toContainText('Electrical Repair');
    await page.screenshot({ path: 'e2e/artifacts/provider-services-list.png', fullPage: true });
    
    // Edit existing service
    await page.click('[data-testid="edit-service"]:first-child');
    await page.waitForURL(/\/provider\/services\/.*\/edit/);
    
    // Update service details
    await expect(page.locator('[data-testid="service-title"]')).toHaveValue('Professional House Cleaning');
    
    // Update price
    await page.fill('[data-testid="service-price"]', '2750');
    
    // Update description
    await page.fill('[data-testid="service-description"]', 'Premium house cleaning service with experienced professionals using eco-friendly products. Deep cleaning for all rooms, bathrooms, and kitchen.');
    
    // Add new feature
    await page.click('[data-testid="add-feature"]');
    await page.fill('[data-testid="feature-input"]:last-child', 'COVID-19 sanitization');
    
    // Update availability - add Sunday
    await page.check('[data-testid="availability-sunday"]');
    await page.selectOption('[data-testid="sunday-start-time"]', '10:00');
    await page.selectOption('[data-testid="sunday-end-time"]', '16:00');
    
    await page.screenshot({ path: 'e2e/artifacts/provider-edit-service.png', fullPage: true });
    
    // Save changes
    await page.click('[data-testid="save-service"]');
    
    // Verify update success
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Service updated successfully');
    
    // 🎯 PHASE 3: Create New Service
    console.log('➕ Phase 3: Creating new service...');
    
    // Go back to services list
    await page.goto('/provider/services');
    await page.waitForLoadState('networkidle');
    
    // Click create new service
    await page.click('[data-testid="create-service"]');
    await page.waitForURL('/provider/services/create');
    
    // Fill new service form
    await expect(page.locator('h1')).toContainText('Create New Service');
    
    await page.fill('[data-testid="service-title"]', 'Plumbing Repair & Installation');
    await page.selectOption('[data-testid="service-category"]', 'plumbing');
    await page.fill('[data-testid="service-description"]', 'Professional plumbing services including leak repairs, pipe installation, toilet and sink repairs. 24/7 emergency service available.');
    await page.fill('[data-testid="service-price"]', '1800');
    await page.selectOption('[data-testid="service-duration"]', '90');
    
    // Set location and areas
    await page.selectOption('[data-testid="service-city"]', 'Kathmandu');
    await page.check('[data-testid="area-thamel"]');
    await page.check('[data-testid="area-lazimpat"]');
    await page.check('[data-testid="area-new-baneshwor"]');
    
    // Add features
    await page.fill('[data-testid="feature-input-0"]', 'Licensed plumber');
    await page.click('[data-testid="add-feature"]');
    await page.fill('[data-testid="feature-input-1"]', '24/7 emergency service');
    await page.click('[data-testid="add-feature"]');
    await page.fill('[data-testid="feature-input-2"]', 'Quality guarantee');
    
    // Set availability
    await page.check('[data-testid="availability-monday"]');
    await page.check('[data-testid="availability-tuesday"]');
    await page.check('[data-testid="availability-wednesday"]');
    await page.check('[data-testid="availability-thursday"]');
    await page.check('[data-testid="availability-friday"]');
    
    // Add time slots
    await page.check('[data-testid="timeslot-morning"]');
    await page.check('[data-testid="timeslot-afternoon"]');
    await page.check('[data-testid="timeslot-evening"]');
    
    await page.screenshot({ path: 'e2e/artifacts/provider-create-service.png', fullPage: true });
    
    // Submit new service
    await page.click('[data-testid="create-service-submit"]');
    
    // Verify creation success
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Service created successfully');
    await page.waitForURL('/provider/services');
    
    // Verify new service appears in list
    await expect(page.locator('[data-testid="service-list"]')).toContainText('Plumbing Repair & Installation');
    
    // 🎯 PHASE 4: Incoming Bookings Management
    console.log('📋 Phase 4: Managing incoming bookings...');
    
    // Navigate to bookings
    await page.click('[data-testid="view-bookings"]');
    await page.waitForURL('/provider/bookings');
    
    await expect(page.locator('h1')).toContainText('My Bookings');
    
    // Check if there are any bookings (from customer test or seed data)
    const bookingsList = page.locator('[data-testid="bookings-list"]');
    const bookingsExist = await bookingsList.count() > 0;
    
    if (bookingsExist) {
      await page.screenshot({ path: 'e2e/artifacts/provider-bookings-list.png', fullPage: true });
      
      // Click on first booking to view details
      await page.click('[data-testid="booking-item"]:first-child');
      await page.waitForURL(/\/provider\/bookings\/.*/);
      
      // Verify booking details
      await expect(page.locator('[data-testid="booking-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="customer-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="service-details"]')).toBeVisible();
      
      // Check booking status and available actions
      const bookingStatus = await page.locator('[data-testid="booking-status"]').textContent();
      console.log(`📍 Current booking status: ${bookingStatus}`);
      
      // If booking is confirmed, provider can update status
      if (bookingStatus?.includes('CONFIRMED')) {
        // Update status to "IN_PROGRESS"
        await page.selectOption('[data-testid="status-update"]', 'IN_PROGRESS');
        await page.click('[data-testid="update-status-button"]');
        
        await expect(page.locator('[data-testid="status-update-success"]')).toContainText('Status updated');
        await expect(page.locator('[data-testid="booking-status"]')).toContainText('IN_PROGRESS');
      }
      
      await page.screenshot({ path: 'e2e/artifacts/provider-booking-details.png', fullPage: true });
    } else {
      console.log('📝 No bookings found - this is expected in a fresh test environment');
      await page.screenshot({ path: 'e2e/artifacts/provider-no-bookings.png', fullPage: true });
    }
    
    // 🎯 PHASE 5: Provider Profile Management
    console.log('👤 Phase 5: Managing provider profile...');
    
    // Navigate to profile settings
    await page.goto('/provider/profile');
    await page.waitForLoadState('networkidle');
    
    // Verify profile page
    await expect(page.locator('h1')).toContainText('Provider Profile');
    
    // Check current profile data (from seed)
    await expect(page.locator('[data-testid="business-name"]')).toHaveValue('Test Cleaning Services');
    
    // Update business information
    await page.fill('[data-testid="business-name"]', 'Premium Cleaning & Maintenance Services');
    await page.fill('[data-testid="business-description"]', 'Professional cleaning and maintenance services with over 10 years of experience. We serve residential and commercial clients across Kathmandu valley.');
    
    // Update contact information
    await page.fill('[data-testid="business-phone"]', '+9779801234568');
    await page.fill('[data-testid="business-email"]', 'contact@premiumcleaning.com.np');
    
    // Update working hours
    await page.selectOption('[data-testid="monday-start"]', '08:00');
    await page.selectOption('[data-testid="monday-end"]', '18:00');
    
    // Add certifications
    await page.fill('[data-testid="certifications"]', 'Licensed Cleaning Professional, COVID-19 Safety Certified, Eco-Friendly Cleaning Specialist');
    
    await page.screenshot({ path: 'e2e/artifacts/provider-profile-edit.png', fullPage: true });
    
    // Save profile changes
    await page.click('[data-testid="save-profile"]');
    
    // Verify save success
    await expect(page.locator('[data-testid="profile-save-success"]')).toContainText('Profile updated successfully');
    
    // 🎯 PHASE 6: Analytics and Performance
    console.log('📊 Phase 6: Viewing provider analytics...');
    
    // Navigate to analytics
    await page.goto('/provider/analytics');
    await page.waitForLoadState('networkidle');
    
    const analyticsPage = page.locator('[data-testid="analytics-dashboard"]');
    if (await analyticsPage.isVisible()) {
      // Verify analytics components
      await expect(page.locator('[data-testid="total-bookings"]')).toBeVisible();
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="rating-overview"]')).toBeVisible();
      
      await page.screenshot({ path: 'e2e/artifacts/provider-analytics.png', fullPage: true });
      
      // Check performance metrics
      const totalBookings = await page.locator('[data-testid="total-bookings-count"]').textContent();
      const averageRating = await page.locator('[data-testid="average-rating"]').textContent();
      
      console.log(`📈 Provider Stats: ${totalBookings} bookings, ${averageRating} rating`);
    } else {
      console.log('📊 Analytics dashboard not available - implementing basic version');
    }
    
    // 🎯 PHASE 7: Currency and Localization Check
    console.log('💰 Phase 7: Verifying NPR currency formatting...');
    
    // Go back to services list
    await page.goto('/provider/services');
    await page.waitForLoadState('networkidle');
    
    // Verify NPR currency formatting in provider view
    const servicePrices = page.locator('[data-testid="service-price"]');
    const priceCount = await servicePrices.count();
    
    for (let i = 0; i < Math.min(priceCount, 3); i++) {
      const price = await servicePrices.nth(i).textContent();
      expect(price).toMatch(/NPR\s[\d,]+/);
      console.log(`💵 Service ${i + 1} price: ${price}`);
    }
    
    // Test language switching if available
    const langSwitcher = page.locator('[data-testid="language-switcher"]');
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      await page.click('[data-testid="language-ne"]');
      await page.waitForTimeout(1000);
      
      // Take screenshot in Nepali
      await page.screenshot({ path: 'e2e/artifacts/provider-nepali-dashboard.png', fullPage: true });
      
      // Switch back to English
      await langSwitcher.click();
      await page.click('[data-testid="language-en"]');
    }
    
    console.log('✅ Provider journey completed successfully!');
  });

  test('Provider onboarding and verification flow', async ({ page, loginAs }) => {
    console.log('🎓 Testing provider onboarding process...');
    
    // Login as provider
    await loginAs('provider');
    
    // Check if onboarding is needed
    await page.goto('/provider/onboarding');
    await page.waitForLoadState('networkidle');
    
    const onboardingPage = page.locator('[data-testid="onboarding-container"]');
    if (await onboardingPage.isVisible()) {
      // Step 1: Business Information
      await expect(page.locator('h2')).toContainText('Business Information');
      
      await page.fill('[data-testid="onboarding-business-name"]', 'Elite Home Services');
      await page.selectOption('[data-testid="onboarding-business-type"]', 'sole-proprietorship');
      await page.fill('[data-testid="onboarding-years-experience"]', '8');
      
      await page.click('[data-testid="onboarding-next"]');
      
      // Step 2: Service Categories
      await expect(page.locator('h2')).toContainText('Service Categories');
      
      await page.check('[data-testid="category-house-cleaning"]');
      await page.check('[data-testid="category-electrical-work"]');
      await page.check('[data-testid="category-plumbing"]');
      
      await page.click('[data-testid="onboarding-next"]');
      
      // Step 3: Documents Upload
      await expect(page.locator('h2')).toContainText('Verification Documents');
      
      // In real test, would upload actual files
      // await page.setInputFiles('[data-testid="business-license"]', 'test-files/business-license.pdf');
      // await page.setInputFiles('[data-testid="identity-document"]', 'test-files/citizenship.jpg');
      
      await page.click('[data-testid="onboarding-submit"]');
      
      // Verify submission
      await expect(page.locator('[data-testid="onboarding-success"]')).toContainText('Onboarding completed');
      
      await page.screenshot({ path: 'e2e/artifacts/provider-onboarding-complete.png', fullPage: true });
    }
    
    console.log('✅ Provider onboarding test completed');
  });

  test('Provider training and certification', async ({ page, loginAs }) => {
    console.log('🎯 Testing provider training system...');
    
    // Login as provider
    await loginAs('provider');
    
    // Navigate to training
    await page.goto('/provider/training');
    await page.waitForLoadState('networkidle');
    
    const trainingPage = page.locator('[data-testid="training-dashboard"]');
    if (await trainingPage.isVisible()) {
      // Check available courses
      await expect(page.locator('h1')).toContainText('Training & Certification');
      
      // View available courses
      const courses = page.locator('[data-testid="training-course"]');
      const courseCount = await courses.count();
      
      if (courseCount > 0) {
        // Click on first course
        await courses.first().click();
        await page.waitForURL(/\/provider\/training\/.*/);
        
        // Verify course content
        await expect(page.locator('[data-testid="course-content"]')).toBeVisible();
        
        // Complete a lesson if available
        const startButton = page.locator('[data-testid="start-lesson"]');
        if (await startButton.isVisible()) {
          await startButton.click();
          
          // Take course progress screenshot
          await page.screenshot({ path: 'e2e/artifacts/provider-training-course.png', fullPage: true });
        }
      }
      
      await page.screenshot({ path: 'e2e/artifacts/provider-training-dashboard.png', fullPage: true });
    }
    
    console.log('✅ Provider training test completed');
  });
});