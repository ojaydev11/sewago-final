'use client';

import dynamic from 'next/dynamic';

// Dynamically import client-only components to prevent SSR issues
const Analytics = dynamic(() => import('@/components/Analytics'), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false });
const EmergencyServiceButton = dynamic(() => import('@/components/EmergencyServiceButton'), { ssr: false });
const PerformanceMonitor = dynamic(() => import('@/components/ui/PerformanceMonitor'), { ssr: false });

export default function ClientOnlyComponents() {
  return (
    <>
      {/* Google Analytics - disabled to prevent NODE_ENV hydration mismatch */}
      {/* {process.env.NODE_ENV === 'production' && (
        <Analytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'} />
      )} */}
      
      {/* Emergency Service Button - temporarily disabled to fix runtime errors */}
      {/* <EmergencyServiceButton /> */}
      
      {/* Cookie Consent for GDPR compliance - temporarily disabled to fix build errors */}
      {/* <CookieConsent /> */}
      
      {/* Performance Monitor - temporarily disabled to fix runtime errors */}
      {/* <PerformanceMonitor showOnProduction={false} /> */}
    </>
  );
}
