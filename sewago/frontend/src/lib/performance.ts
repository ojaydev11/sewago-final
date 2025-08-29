'use client';
<<<<<<< HEAD
=======
import 'client-only';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245

import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    const trackWebVitals = () => {
      // First Contentful Paint
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fcp = entry.startTime;
          console.log('FCP:', fcp);
          
          // Send to analytics if FCP is poor (>2.5s)
          if (fcp > 2500) {
            console.warn('Poor FCP detected:', fcp);
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        let lcp = 0;
        for (const entry of entryList.getEntries()) {
          if (entry.startTime > lcp) {
            lcp = entry.startTime;
          }
        }
        console.log('LCP:', lcp);
        
        // Send to analytics if LCP is poor (>4s)
        if (lcp > 4000) {
          console.warn('Poor LCP detected:', lcp);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
<<<<<<< HEAD
          const fid = entry.processingStart - entry.startTime;
          console.log('FID:', fid);
          
          // Send to analytics if FID is poor (>300ms)
          if (fid > 300) {
            console.warn('Poor FID detected:', fid);
=======
          const firstInputEntry = entry as PerformanceEventTiming;
          if (firstInputEntry.processingStart) {
            const fid = firstInputEntry.processingStart - firstInputEntry.startTime;
            console.log('FID:', fid);
            
            // Send to analytics if FID is poor (>300ms)
            if (fid > 300) {
              console.warn('Poor FID detected:', fid);
            }
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
          }
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let cls = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
<<<<<<< HEAD
          if (!entry.hadRecentInput) {
            cls += (entry as any).value;
=======
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
            cls += layoutShiftEntry.value;
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
          }
        }
        console.log('CLS:', cls);
        
        // Send to analytics if CLS is poor (>0.1)
        if (cls > 0.1) {
          console.warn('Poor CLS detected:', cls);
        }
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Track Time to First Byte
    const trackTTFB = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        console.log('TTFB:', ttfb);
        
        // Send to analytics if TTFB is poor (>600ms)
        if (ttfb > 600) {
          console.warn('Poor TTFB detected:', ttfb);
        }
      }
    };

    // Track resource loading performance
    const trackResourceTiming = () => {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          const duration = resource.duration;
          const size = resource.transferSize;
          
          // Log slow resources (>2s)
          if (duration > 2000) {
            console.warn('Slow resource detected:', {
              name: resource.name,
              duration,
              size: size ? `${(size / 1024).toFixed(2)}KB` : 'unknown'
            });
          }
        }
      }).observe({ entryTypes: ['resource'] });
    };

    // Track long tasks
    const trackLongTasks = () => {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const longTask = entry as PerformanceEntry;
          console.log('Long task detected:', longTask.duration);
          
          // Send to analytics if task is very long (>50ms)
          if (longTask.duration > 50) {
            console.warn('Very long task detected:', longTask.duration);
          }
        }
      }).observe({ entryTypes: ['longtask'] });
    };

    // Initialize performance monitoring
    if ('PerformanceObserver' in window) {
      trackWebVitals();
      trackResourceTiming();
      trackLongTasks();
      
      // TTFB tracking
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackTTFB);
      } else {
        trackTTFB();
      }
    }

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log('Page load time:', loadTime);
      
      // Send to analytics if load time is poor (>3s)
      if (loadTime > 3000) {
        console.warn('Poor page load time detected:', loadTime);
      }
    });

    // Track memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      });
    }

  }, []);

  return null;
}

// Utility function to measure function performance
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    
    return result;
  }) as T;
}

// Utility function to debounce performance-heavy operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Utility function to throttle performance-heavy operations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
