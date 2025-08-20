'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * Performance optimization component that handles:
 * - Critical resource hints
 * - Third-party script optimization
 * - Core Web Vitals monitoring
 * - Service Worker registration
 */
export default function PerformanceOptimizer() {
  useEffect(() => {
    // Register service worker for offline functionality and caching
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload critical fonts
      const fontPreloads = [
        '/fonts/inter-var.woff2',
        '/fonts/poppins-regular.woff2',
      ];

      fontPreloads.forEach((font) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // Preload critical API endpoints
      const criticalAPIs = [
        '/api/services',
        '/api/health',
      ];

      criticalAPIs.forEach((api) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = api;
        document.head.appendChild(link);
      });
    };

    // Initialize performance optimizations
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', preloadCriticalResources);
    } else {
      preloadCriticalResources();
    }

    // Monitor Core Web Vitals (only in browser)
    if (typeof window !== 'undefined') {
      const reportWebVitals = (metric: any) => {
        if (process.env.NODE_ENV === 'production') {
          // Send to analytics in production
          console.log('Web Vital:', metric);
          
          // Example: Send to Google Analytics
          if (typeof (window as any).gtag !== 'undefined') {
            (window as any).gtag('event', metric.name, {
              custom_parameter_1: metric.value,
              custom_parameter_2: metric.label,
            });
          }
        }
      };

      // Import and use web-vitals library if available (browser only)
      import('web-vitals')
        .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(reportWebVitals);
          getFID(reportWebVitals);
          getFCP(reportWebVitals);
          getLCP(reportWebVitals);
          getTTFB(reportWebVitals);
        })
        .catch(() => {
          // web-vitals not available, skip monitoring
        });
    }

    // Cleanup function
    return () => {
      // Remove event listeners if needed
    };
  }, []);

  return (
    <>
      {/* DNS Prefetch for external domains */}
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//api.sewago.app" />
      
      {/* Preconnect to critical origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Critical CSS preload */}
      <link rel="preload" href="/styles/critical.css" as="style" />
      
      {/* Service Worker registration script */}
      {process.env.NODE_ENV === 'production' && (
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      )}

      {/* Resource hints for better performance */}
      <link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
      <link rel="modulepreload" href="/_next/static/chunks/framework.js" />
      <link rel="modulepreload" href="/_next/static/chunks/main.js" />
      <link rel="modulepreload" href="/_next/static/chunks/pages/_app.js" />
    </>
  );
}