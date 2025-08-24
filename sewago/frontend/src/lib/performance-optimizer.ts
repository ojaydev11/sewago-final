/**
 * Performance optimization utilities for smart features
 */

// Lazy loading utilities for AI components
export const lazyLoadAIComponent = (importFn: () => Promise<any>) => {
  return React.lazy(() => 
    importFn().catch(error => {
      console.error('Failed to load AI component:', error);
      // Fallback component
      return {
        default: () => React.createElement('div', {
          className: 'text-center py-4 text-gray-500'
        }, 'AI feature temporarily unavailable')
      };
    })
  );
};

// Debounce utility for API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Throttle utility for high-frequency events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory-efficient cache with TTL
class TTLCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private defaultTTL: number;

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
    this.cleanup();
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton cache instances for different data types
export const searchCache = new TTLCache<any>(10 * 60 * 1000); // 10 minutes
export const notificationCache = new TTLCache<any>(5 * 60 * 1000); // 5 minutes
export const voiceCache = new TTLCache<any>(2 * 60 * 1000); // 2 minutes

// Request deduplication
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    const promise = requestFn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Image optimization utilities
export const optimizeImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality = 80
): string => {
  if (!url) return '';
  
  // If using a CDN like Cloudinary or similar
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('f', 'auto'); // Auto format
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

// Bundle size analyzer
export const trackBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (entries.length > 0) {
        const navigation = entries[0];
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        
        console.log('Performance Metrics:', {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadTime,
          transferSize: navigation.transferSize,
          encodedBodySize: navigation.encodedBodySize,
          decodedBodySize: navigation.decodedBodySize
        });
      }
    });
  }
};

// Preload critical resources
export const preloadResource = (href: string, as: string, type?: string): void => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
};

// Prefetch resources for better UX
export const prefetchResource = (href: string): void => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  document.head.appendChild(link);
};

// Service Worker utilities for AI features
export const registerAIServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw-ai.js');
      console.log('AI Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('AI Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Network-aware loading
export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
  }
  return null;
};

// Adaptive loading based on network conditions
export const shouldReduceFeatures = (): boolean => {
  const networkInfo = getNetworkInfo();
  if (!networkInfo) return false;
  
  return (
    networkInfo.saveData ||
    networkInfo.effectiveType === 'slow-2g' ||
    networkInfo.effectiveType === '2g' ||
    (networkInfo.effectiveType === '3g' && networkInfo.rtt > 300)
  );
};

// Virtual scrolling utilities for large datasets
export const calculateVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan = 5
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan);
  
  return { startIndex, endIndex, visibleCount };
};

// Error boundary for AI features
export const createErrorBoundary = (fallbackComponent: React.ComponentType) => {
  return class AIErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
      console.error('AI Feature Error:', error, errorInfo);
      
      // Report to monitoring service
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'exception', {
          description: error.message,
          fatal: false,
          custom_map: { feature: 'ai' }
        });
      }
    }

    render() {
      if (this.state.hasError) {
        return React.createElement(fallbackComponent);
      }

      return this.props.children;
    }
  };
};

// WebAssembly utilities for AI processing
export const loadWebAssemblyModule = async (wasmPath: string) => {
  try {
    if ('WebAssembly' in window) {
      const wasmModule = await WebAssembly.instantiateStreaming(
        fetch(wasmPath),
        {
          // Import object if needed
        }
      );
      return wasmModule.instance;
    }
    throw new Error('WebAssembly not supported');
  } catch (error) {
    console.error('Failed to load WASM module:', error);
    return null;
  }
};

// Performance monitoring for AI features
export class AIPerformanceMonitor {
  private metrics = new Map<string, number[]>();
  private observers = new Map<string, PerformanceObserver>();

  startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      const timings = this.metrics.get(label)!;
      timings.push(duration);
      
      // Keep only last 100 measurements
      if (timings.length > 100) {
        timings.shift();
      }
      
      return duration;
    };
  }

  getMetrics(label: string) {
    const timings = this.metrics.get(label) || [];
    if (timings.length === 0) return null;
    
    const sorted = [...timings].sort((a, b) => a - b);
    
    return {
      count: timings.length,
      min: Math.min(...timings),
      max: Math.max(...timings),
      avg: timings.reduce((a, b) => a + b, 0) / timings.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    return result;
  }

  observeWebVitals() {
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          } else if (entry.entryType === 'first-input') {
            console.log('FID:', (entry as any).processingStart - entry.startTime);
          } else if (entry.entryType === 'layout-shift') {
            console.log('CLS:', (entry as any).value);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        console.warn('Some performance metrics not supported:', error);
      }
    }
  }
}

export const aiPerformanceMonitor = new AIPerformanceMonitor();

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  trackBundleSize();
  aiPerformanceMonitor.observeWebVitals();
}

import React from 'react';