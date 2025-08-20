import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Lighthouse Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Homepage Lighthouse audit - Desktop', async ({ page, browserName }) => {
    // Skip in webkit/safari due to lighthouse compatibility
    test.skip(browserName === 'webkit', 'Lighthouse tests not supported in WebKit');
    
    console.log('🔍 Running Lighthouse audit on homepage...');
    
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Run lighthouse audit
    const lighthouseResults = await playAudit({
      page,
      thresholds: {
        performance: 70,        // Target: ≥70 for initial test
        accessibility: 90,
        'best-practices': 80,
        seo: 80,
        pwa: 50  // PWA might be lower initially
      },
      port: 9222,
      opts: {
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
        },
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        }
      }
    });

    // Log results
    console.log('🏠 Homepage Lighthouse Results:');
    console.log(`📊 Performance: ${lighthouseResults.lhr.categories.performance?.score * 100}%`);
    console.log(`♿ Accessibility: ${lighthouseResults.lhr.categories.accessibility?.score * 100}%`);
    console.log(`✅ Best Practices: ${lighthouseResults.lhr.categories['best-practices']?.score * 100}%`);
    console.log(`🔍 SEO: ${lighthouseResults.lhr.categories.seo?.score * 100}%`);

    // Check Core Web Vitals
    const lcp = lighthouseResults.lhr.audits['largest-contentful-paint']?.numericValue;
    const inp = lighthouseResults.lhr.audits['max-potential-fid']?.numericValue; // INP proxy
    const cls = lighthouseResults.lhr.audits['cumulative-layout-shift']?.numericValue;

    console.log('🎯 Core Web Vitals:');
    console.log(`📏 LCP: ${lcp ? (lcp / 1000).toFixed(2) : 'N/A'}s (target: ≤3.0s)`);
    console.log(`⚡ FID: ${inp ? inp.toFixed(0) : 'N/A'}ms (target: ≤200ms)`);
    console.log(`📐 CLS: ${cls ? cls.toFixed(3) : 'N/A'} (target: ≤0.1)`);

    // Assert Core Web Vitals targets
    if (lcp) expect(lcp).toBeLessThan(3000); // 3.0s
    if (cls) expect(cls).toBeLessThan(0.1);
    if (inp) expect(inp).toBeLessThan(200);
  });

  test('Service detail page Lighthouse audit - Mobile', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Lighthouse tests not supported in WebKit');
    
    console.log('🔍 Running mobile Lighthouse audit on service page...');
    
    // Navigate to a service page (using seeded service)
    await page.goto('/services/professional-house-cleaning-test');
    await page.waitForLoadState('networkidle');
    
    // Run mobile lighthouse audit
    const lighthouseResults = await playAudit({
      page,
      thresholds: {
        performance: 65,        // Slightly lower for mobile
        accessibility: 90,
        'best-practices': 80,
        seo: 85,
        pwa: 60
      },
      port: 9222,
      opts: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
        },
        throttling: {
          rttMs: 150,          // Slower mobile network
          throughputKbps: 1638,
          cpuSlowdownMultiplier: 4, // Slower mobile CPU
        }
      }
    });

    console.log('📱 Service Page Mobile Lighthouse Results:');
    console.log(`📊 Performance: ${lighthouseResults.lhr.categories.performance?.score * 100}%`);
    console.log(`♿ Accessibility: ${lighthouseResults.lhr.categories.accessibility?.score * 100}%`);
    console.log(`✅ Best Practices: ${lighthouseResults.lhr.categories['best-practices']?.score * 100}%`);
    console.log(`🔍 SEO: ${lighthouseResults.lhr.categories.seo?.score * 100}%`);
    console.log(`📱 PWA: ${lighthouseResults.lhr.categories.pwa?.score * 100}%`);

    // Check mobile-specific metrics
    const lcp = lighthouseResults.lhr.audits['largest-contentful-paint']?.numericValue;
    const fid = lighthouseResults.lhr.audits['max-potential-fid']?.numericValue;
    const cls = lighthouseResults.lhr.audits['cumulative-layout-shift']?.numericValue;

    console.log('📱 Mobile Core Web Vitals:');
    console.log(`📏 LCP: ${lcp ? (lcp / 1000).toFixed(2) : 'N/A'}s`);
    console.log(`⚡ FID: ${fid ? fid.toFixed(0) : 'N/A'}ms`);
    console.log(`📐 CLS: ${cls ? cls.toFixed(3) : 'N/A'}`);

    // Mobile targets (slightly more lenient)
    if (lcp) expect(lcp).toBeLessThan(4000); // 4.0s for mobile
    if (cls) expect(cls).toBeLessThan(0.1);
    if (fid) expect(fid).toBeLessThan(300);   // 300ms for mobile
  });

  test('Services listing page performance', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Lighthouse tests not supported in WebKit');
    
    console.log('🔍 Running Lighthouse audit on services listing...');
    
    // Navigate to services listing
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    // Run lighthouse audit focused on performance
    const lighthouseResults = await playAudit({
      page,
      thresholds: {
        performance: 70,
        accessibility: 85,
        'best-practices': 75,
        seo: 80
      },
      port: 9222,
      opts: {
        formFactor: 'desktop',
        onlyCategories: ['performance', 'accessibility'] // Focus on key metrics
      }
    });

    const performanceScore = lighthouseResults.lhr.categories.performance?.score * 100;
    console.log(`📋 Services Listing Performance: ${performanceScore}%`);

    // Check image optimization (important for service cards)
    const imageOptimization = lighthouseResults.lhr.audits['uses-optimized-images'];
    const imageFormats = lighthouseResults.lhr.audits['uses-webp-images'];
    
    if (imageOptimization) {
      console.log(`🖼️ Image optimization score: ${imageOptimization.score}`);
    }
    if (imageFormats) {
      console.log(`📷 Modern image formats score: ${imageFormats.score}`);
    }

    // Check for unused CSS/JS
    const unusedCSS = lighthouseResults.lhr.audits['unused-css-rules'];
    const unusedJS = lighthouseResults.lhr.audits['unused-javascript'];
    
    if (unusedCSS?.details?.items?.length > 0) {
      console.log(`🧹 Unused CSS detected: ${unusedCSS.details.items.length} issues`);
    }
    if (unusedJS?.details?.items?.length > 0) {
      console.log(`🧹 Unused JavaScript detected: ${unusedJS.details.items.length} issues`);
    }
  });

  test('Booking flow performance', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Lighthouse tests not supported in WebKit');
    
    console.log('🔍 Running Lighthouse audit on booking page...');
    
    // Navigate to booking page
    await page.goto('/services/professional-house-cleaning-test/book');
    
    // Handle potential auth redirect
    const currentUrl = page.url();
    if (currentUrl.includes('auth/login')) {
      console.log('📝 Booking page requires auth - testing login page performance instead');
    }
    
    await page.waitForLoadState('networkidle');
    
    // Run lighthouse audit
    const lighthouseResults = await playAudit({
      page,
      thresholds: {
        performance: 65,
        accessibility: 95,  // Forms should be highly accessible
        'best-practices': 80,
        seo: 70  // Internal pages can have lower SEO requirements
      },
      port: 9222
    });

    console.log('📝 Booking/Auth Page Results:');
    console.log(`📊 Performance: ${lighthouseResults.lhr.categories.performance?.score * 100}%`);
    console.log(`♿ Accessibility: ${lighthouseResults.lhr.categories.accessibility?.score * 100}%`);

    // Check form accessibility
    const formLabels = lighthouseResults.lhr.audits['label'];
    const formControls = lighthouseResults.lhr.audits['button-name'];
    
    console.log(`🏷️ Form labels score: ${formLabels?.score || 'N/A'}`);
    console.log(`🔘 Button names score: ${formControls?.score || 'N/A'}`);
  });

  test('PWA capabilities assessment', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Lighthouse tests not supported in WebKit');
    
    console.log('📱 Running PWA assessment...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Focus on PWA category
    const lighthouseResults = await playAudit({
      page,
      thresholds: {
        pwa: 50  // Initial PWA target
      },
      port: 9222,
      opts: {
        onlyCategories: ['pwa']
      }
    });

    const pwaScore = lighthouseResults.lhr.categories.pwa?.score * 100;
    console.log(`📱 PWA Score: ${pwaScore}%`);

    // Check key PWA features
    const manifest = lighthouseResults.lhr.audits['installable-manifest'];
    const serviceWorker = lighthouseResults.lhr.audits['service-worker'];
    const offlineSupport = lighthouseResults.lhr.audits['works-offline'];
    const viewport = lighthouseResults.lhr.audits['viewport'];

    console.log('📱 PWA Features:');
    console.log(`📋 Web App Manifest: ${manifest?.score ? '✅' : '❌'}`);
    console.log(`🔧 Service Worker: ${serviceWorker?.score ? '✅' : '❌'}`);
    console.log(`📴 Offline Support: ${offlineSupport?.score ? '✅' : '❌'}`);
    console.log(`📐 Viewport Meta: ${viewport?.score ? '✅' : '❌'}`);
  });
});