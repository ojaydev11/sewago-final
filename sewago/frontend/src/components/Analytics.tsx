'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsProps {
  measurementId: string;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    performance: Performance;
  }
}

export default function Analytics({ measurementId }: AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize Google Analytics
    if (typeof window !== 'undefined' && !window.gtag) {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(...args: any[]) { 
        window.dataLayer.push(args); 
      };

      // Configure gtag
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: false, // We'll send this manually
      });

      // Track initial page view
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: pathname,
      });
    }
  }, [measurementId]);

  // Track page views when route changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.origin + url,
        page_path: pathname,
        page_query: searchParams?.toString() || '',
      });
    }
  }, [pathname, searchParams]);

  // Track performance metrics
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const trackPerformance = () => {
        // Wait for performance metrics to be available
        setTimeout(() => {
          const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            const metrics = {
              dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
              tcp_connection: navigation.connectEnd - navigation.connectStart,
              server_response: navigation.responseEnd - navigation.requestStart,
              dom_loading: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              dom_complete: navigation.loadEventEnd - navigation.loadEventStart,
              total_load_time: navigation.loadEventEnd - navigation.navigationStart,
            };

            // Send performance metrics to GA
            if (window.gtag) {
              window.gtag('event', 'performance_metrics', {
                event_category: 'Performance',
                event_label: pathname,
                value: Math.round(metrics.total_load_time),
                custom_map: {
                  dns_lookup: metrics.dns_lookup,
                  tcp_connection: metrics.tcp_connection,
                  server_response: metrics.server_response,
                  dom_loading: metrics.dom_loading,
                  dom_complete: metrics.dom_complete,
                },
              });
            }
          }
        }, 1000);
      };

      // Track performance on initial load
      if (document.readyState === 'complete') {
        trackPerformance();
      } else {
        window.addEventListener('load', trackPerformance);
        return () => window.removeEventListener('load', trackPerformance);
      }
    }
  }, [pathname]);

  // Track user engagement
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      let startTime = Date.now();
      let isActive = true;

      const trackEngagement = () => {
        if (isActive) {
          const timeSpent = Date.now() - startTime;
          
          // Track time spent on page every 30 seconds
          if (timeSpent > 30000) {
            window.gtag('event', 'user_engagement', {
              event_category: 'Engagement',
              event_label: pathname,
              value: Math.round(timeSpent / 1000), // Time in seconds
            });
            startTime = Date.now();
          }
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          isActive = false;
          // Track when user leaves the page
          const timeSpent = Date.now() - startTime;
          if (timeSpent > 5000) { // Only track if they spent more than 5 seconds
            window.gtag('event', 'page_exit', {
              event_category: 'Engagement',
              event_label: pathname,
              value: Math.round(timeSpent / 1000),
            });
          }
        } else {
          isActive = true;
          startTime = Date.now();
        }
      };

      const interval = setInterval(trackEngagement, 30000);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [pathname]);

  // Track errors
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const handleError = (event: ErrorEvent) => {
        window.gtag('event', 'exception', {
          description: event.message,
          fatal: false,
          error_file: event.filename,
          error_line: event.lineno,
          error_column: event.colno,
          page_path: pathname,
        });
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        window.gtag('event', 'exception', {
          description: event.reason?.toString() || 'Unhandled Promise Rejection',
          fatal: false,
          page_path: pathname,
        });
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, [pathname]);

  // Track custom events
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const trackCustomEvent = (event: CustomEvent) => {
        const { action, category, label, value } = event.detail;
        
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value,
          page_path: pathname,
        });
      };

      window.addEventListener('gtag-event', trackCustomEvent);
      return () => window.removeEventListener('gtag-event', trackCustomEvent);
    }
  }, [pathname]);

  // Track scroll depth
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      let maxScrollDepth = 0;
      const scrollDepthTracked = new Set();

      const trackScrollDepth = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

        // Track scroll depth milestones (25%, 50%, 75%, 100%)
        const milestones = [25, 50, 75, 100];
        milestones.forEach(milestone => {
          if (scrollPercentage >= milestone && !scrollDepthTracked.has(milestone)) {
            scrollDepthTracked.add(milestone);
            window.gtag('event', 'scroll_depth', {
              event_category: 'Engagement',
              event_label: `${milestone}%`,
              value: milestone,
              page_path: pathname,
            });
          }
        });

        maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
      };

      const throttledTrackScroll = throttle(trackScrollDepth, 100);
      window.addEventListener('scroll', throttledTrackScroll);

      return () => window.removeEventListener('scroll', throttledTrackScroll);
    }
  }, [pathname]);

  // Utility function to throttle scroll events
  function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Track form interactions
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const trackFormInteraction = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'FORM') {
          const formId = target.id || 'unknown_form';
          const formAction = target.getAttribute('action') || 'unknown_action';
          
          window.gtag('event', 'form_start', {
            event_category: 'Forms',
            event_label: formId,
            form_action: formAction,
            page_path: pathname,
          });
        }
      };

      const trackFormSubmission = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'FORM') {
          const formId = target.id || 'unknown_form';
          const formAction = target.getAttribute('action') || 'unknown_action';
          
          window.gtag('event', 'form_submit', {
            event_category: 'Forms',
            event_label: formId,
            form_action: formAction,
            page_path: pathname,
          });
        }
      };

      document.addEventListener('focusin', trackFormInteraction);
      document.addEventListener('submit', trackFormSubmission);

      return () => {
        document.removeEventListener('focusin', trackFormInteraction);
        document.removeEventListener('submit', trackFormSubmission);
      };
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

// Export utility function for manual event tracking
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Export utility function for custom event dispatching
export function dispatchGtagEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('gtag-event', {
      detail: { action, category, label, value }
    });
    window.dispatchEvent(event);
  }
}
