'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

interface AnalyticsProps {
  measurementId: string;
}

export default function Analytics({ measurementId }: AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

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

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: {
        custom_parameter_1: 'service_type',
        custom_parameter_2: 'location',
        custom_parameter_3: 'user_type'
      }
    });

    return () => {
      document.head.removeChild(script);
    };
  }, [measurementId]);

  useEffect(() => {
    // Track page views on route changes
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      
      window.gtag('config', measurementId, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.origin + url
      });

      // Track custom events for better insights
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: url,
        page_referrer: document.referrer,
        custom_parameter_1: getServiceTypeFromPath(pathname),
        custom_parameter_2: getLocationFromPath(pathname),
        custom_parameter_3: getUserType()
      });
    }
  }, [pathname, searchParams, measurementId]);

  // Helper functions for custom parameters
  const getServiceTypeFromPath = (path: string) => {
    if (path.includes('/services')) {
      if (path.includes('/electrician')) return 'electrical';
      if (path.includes('/plumber')) return 'plumbing';
      if (path.includes('/cleaner')) return 'cleaning';
      if (path.includes('/tutor')) return 'tutoring';
      return 'general_services';
    }
    return 'other';
  };

  const getLocationFromPath = (path: string) => {
    if (path.includes('kathmandu')) return 'kathmandu';
    if (path.includes('pokhara')) return 'pokhara';
    if (path.includes('lalitpur')) return 'lalitpur';
    if (path.includes('bhaktapur')) return 'bhaktapur';
    return 'nepal';
  };

  const getUserType = () => {
    // This could be enhanced with actual user authentication logic
    const userType = localStorage.getItem('user_type') || 'guest';
    return userType;
  };

  // Track custom events
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        custom_parameter_1: getServiceTypeFromPath(pathname),
        custom_parameter_2: getLocationFromPath(pathname),
        custom_parameter_3: getUserType()
      });
    }
  };

  // Expose tracking function globally for other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).trackSewaGoEvent = trackEvent;
    }
  }, [pathname]);

  // Track important user interactions
  useEffect(() => {
    const trackUserInteractions = () => {
      // Track form submissions
      document.addEventListener('submit', (e) => {
        const form = e.target as HTMLFormElement;
        if (form.id === 'contact-form') {
          trackEvent('form_submit', {
            form_name: 'contact_form',
            form_location: pathname
          });
        }
      });

      // Track button clicks
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          const button = target.tagName === 'BUTTON' ? target : target.closest('button');
          const buttonText = button?.textContent?.trim();
          const buttonClass = button?.className;
          
          if (buttonText && buttonClass) {
            trackEvent('button_click', {
              button_text: buttonText,
              button_class: buttonClass,
              page_location: pathname
            });
          }
        }
      });

      // Track external links
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link && link.hostname !== window.location.hostname) {
          trackEvent('external_link_click', {
            link_url: link.href,
            link_text: link.textContent?.trim(),
            page_location: pathname
          });
        }
      });
    };

    if (process.env.NODE_ENV === 'production') {
      trackUserInteractions();
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

// Utility function for other components to use
export const trackSewaGoEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};
