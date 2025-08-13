"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsConfig {
  enabled: boolean;
  provider: 'vercel' | 'posthog' | 'google' | 'custom';
  trackingId?: string;
  endpoint?: string;
}

// Analytics configuration based on environment
const analyticsConfig: AnalyticsConfig = {
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  provider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as any) || 'vercel',
  trackingId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
};

// Analytics event interface
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

// Analytics class
class Analytics {
  private config: AnalyticsConfig;
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  // Initialize analytics based on provider
  async initialize(): Promise<void> {
    if (!this.config.enabled || this.isInitialized) return;

    try {
      switch (this.config.provider) {
        case 'vercel':
          await this.initializeVercel();
          break;
        case 'posthog':
          await this.initializePostHog();
          break;
        case 'google':
          await this.initializeGoogleAnalytics();
          break;
        case 'custom':
          await this.initializeCustom();
          break;
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }

  // Track page view
  trackPageView(path: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: {
        path,
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        ...properties,
      },
      timestamp: Date.now(),
    };

    this.trackEvent(event);
  }

  // Track custom event
  trackEvent(event: AnalyticsEvent): void {
    if (!this.config.enabled) return;

    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    // Queue event if not initialized
    if (!this.isInitialized) {
      this.queue.push(event);
      return;
    }

    // Send event based on provider
    this.sendEvent(event);
  }

  // Track user action
  trackUserAction(action: string, resource: string, properties?: Record<string, any>): void {
    this.trackEvent({
      name: 'user_action',
      properties: {
        action,
        resource,
        ...properties,
      },
    });
  }

  // Track booking flow
  trackBookingStep(step: string, properties?: Record<string, any>): void {
    this.trackEvent({
      name: 'booking_step',
      properties: {
        step,
        ...properties,
      },
    });
  }

  // Track service interaction
  trackServiceInteraction(serviceId: string, action: string, properties?: Record<string, any>): void {
    this.trackEvent({
      name: 'service_interaction',
      properties: {
        serviceId,
        action,
        ...properties,
      },
    });
  }

  // Send event to analytics provider
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      switch (this.config.provider) {
        case 'vercel':
          await this.sendToVercel(event);
          break;
        case 'posthog':
          await this.sendToPostHog(event);
          break;
        case 'google':
          await this.sendToGoogleAnalytics(event);
          break;
        case 'custom':
          await this.sendToCustom(event);
          break;
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Vercel Analytics
  private async initializeVercel(): Promise<void> {
    // Vercel Analytics is automatically initialized
    console.log('Vercel Analytics initialized');
  }

  private async sendToVercel(event: AnalyticsEvent): Promise<void> {
    // Vercel Analytics tracks automatically
    if (window.va) {
      window.va.track(event.name, event.properties);
    }
  }

  // PostHog Analytics
  private async initializePostHog(): Promise<void> {
    if (!this.config.trackingId) return;

    try {
      const { PostHog } = await import('posthog-js');
      PostHog.init(this.config.trackingId, {
        api_host: 'https://app.posthog.com',
        loaded: (posthog) => {
          console.log('PostHog Analytics initialized');
        },
      });
    } catch (error) {
      console.warn('PostHog initialization failed:', error);
    }
  }

  private async sendToPostHog(event: AnalyticsEvent): Promise<void> {
    if (window.posthog) {
      window.posthog.capture(event.name, event.properties);
    }
  }

  // Google Analytics
  private async initializeGoogleAnalytics(): Promise<void> {
    if (!this.config.trackingId) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', this.config.trackingId);

    console.log('Google Analytics initialized');
  }

  private async sendToGoogleAnalytics(event: AnalyticsEvent): Promise<void> {
    if (window.gtag) {
      window.gtag('event', event.name, event.properties);
    }
  }

  // Custom Analytics
  private async initializeCustom(): Promise<void> {
    if (!this.config.endpoint) return;
    console.log('Custom Analytics initialized');
  }

  private async sendToCustom(event: AnalyticsEvent): Promise<void> {
    if (!this.config.endpoint) return;

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Custom analytics endpoint failed:', error);
    }
  }

  // Process queued events
  async processQueue(): Promise<void> {
    if (!this.isInitialized || this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    for (const event of events) {
      await this.sendEvent(event);
    }
  }
}

// Create analytics instance
const analytics = new Analytics(analyticsConfig);

// Analytics component
export default function AnalyticsComponent(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize analytics
    analytics.initialize().then(() => {
      // Process any queued events
      analytics.processQueue();
    });
  }, []);

  useEffect(() => {
    // Track page views
    if (pathname) {
      analytics.trackPageView(pathname, {
        search: searchParams?.toString(),
      });
    }
  }, [pathname, searchParams]);

  return null;
}

// Export analytics instance and utility functions
export { analytics };

// Utility functions for tracking
export function trackEvent(name: string, properties?: Record<string, any>): void {
  analytics.trackEvent({ name, properties });
}

export function trackUserAction(action: string, resource: string, properties?: Record<string, any>): void {
  analytics.trackUserAction(action, resource, properties);
}

export function trackBookingStep(step: string, properties?: Record<string, any>): void {
  analytics.trackBookingStep(step, properties);
}

export function trackServiceInteraction(serviceId: string, action: string, properties?: Record<string, any>): void {
  analytics.trackServiceInteraction(serviceId, action, properties);
}

// Type declarations for global objects
declare global {
  interface Window {
    va?: {
      track: (eventName: string, properties?: Record<string, any>) => void;
    };
    posthog?: {
      capture: (eventName: string, properties?: Record<string, any>) => void;
    };
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
