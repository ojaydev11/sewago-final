'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsProps {
  measurementId: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export default function Analytics({ measurementId }: AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize Google Analytics with error handling
    if (typeof window !== 'undefined' && measurementId && !window.gtag) {
      try {
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        script.onload = () => {
          // Initialize gtag only after script loads
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(...args: any[]) { 
            window.dataLayer?.push(args); 
          };

          // Configure gtag
          window.gtag?.('js', new Date());
          window.gtag?.('config', measurementId, {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true,
          });
        };
        script.onerror = () => {
          console.warn('Failed to load Google Analytics');
        };
        document.head.appendChild(script);
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
      }
    }
  }, [measurementId]);

  // Track page views when route changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.origin + url,
          page_path: pathname,
        });
      } catch (error) {
        console.warn('Analytics page view tracking failed:', error);
      }
    }
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}

// Export utility function for manual event tracking
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    } catch (error) {
      console.warn('Event tracking failed:', error);
    }
  }
}
