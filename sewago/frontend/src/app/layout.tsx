import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';

import Analytics from '@/components/Analytics';
import CookieConsent from '@/components/CookieConsent';
import EmergencyServiceButton from '@/components/EmergencyServiceButton';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactQueryProvider } from '@/providers/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ['latin'] });

const siteUrl = (process.env as any).NEXT_PUBLIC_SITE_URL || 'https://sewago-final.vercel.app';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'SewaGo - Local Services in Nepal',
    description: 'Connect with verified local service providers in Nepal. Professional electricians, plumbers, cleaners, and tutors available in Kathmandu, Pokhara, and across Nepal.',
    keywords: 'local services Nepal, electrician Kathmandu, plumber Pokhara, cleaner Lalitpur, tutor Nepal, home services, professional services, verified providers, SewaGo, सेवागो',
    authors: [{ name: 'SewaGo Team' }],
    creator: 'SewaGo',
    publisher: 'SewaGo',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: siteUrl,
      languages: {
        'en': `${siteUrl}/en`,
      },
    },
    openGraph: {
      title: 'SewaGo - Local Services in Nepal',
      description: 'Connect with verified local service providers in Nepal. Professional services for every home.',
      url: siteUrl,
      siteName: 'SewaGo',
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'SewaGo - Local Services in Nepal',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SewaGo - Local Services in Nepal',
      description: 'Connect with verified local service providers in Nepal. Professional services for every home.',
      images: [`${siteUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  };
}

// Prevent static generation - return empty array to force dynamic rendering
export async function generateStaticParams() {
  return [];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Character encoding and language */}
        <meta charSet="utf-8" />
        <meta name="language" content="en" />
        <meta name="geo.region" content="NP" />
        <meta name="geo.country" content="Nepal" />
        <meta name="geo.placename" content="Kathmandu" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" type="image/svg+xml" href="/branding/sewago-favicon.svg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#DC143C" />
        <meta name="msapplication-TileColor" content="#DC143C" />
        
        {/* Viewport and mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Enhanced accessibility and performance */}
        <meta name="color-scheme" content="dark light" />
        <meta name="supported-color-schemes" content="dark light" />
        {/* Only prefetch API endpoints, remove unused preloads to fix warnings */}
        <link rel="prefetch" href="/api/services" />
        
        {/* Security headers - X-Frame-Options removed as it's set via HTTP headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SewaGo",
              "alternateName": "सेवागो",
              "url": siteUrl,
              "logo": `${siteUrl}/branding/sewago-logo.svg`,
              "sameAs": [
                "https://facebook.com/sewago",
                "https://twitter.com/sewago",
                "https://instagram.com/sewago",
                "https://linkedin.com/company/sewago"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+977-9800000000",
                "contactType": "customer service",
                "areaServed": "NP",
                "availableLanguage": ["English", "Nepali", "Newari"]
              }
            })
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Google Analytics - only in production */}
        {process.env.NODE_ENV === 'production' && (
          <Suspense fallback={null}>
            <Analytics measurementId={(process.env as any).NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'} />
          </Suspense>
        )}
        
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ReactQueryProvider>
              <main className="min-h-screen bg-gray-50">
                {children}
              </main>
              
              {/* Emergency Service Button */}
              <EmergencyServiceButton />
              
              {/* Cookie Consent for GDPR compliance */}
              <CookieConsent />
              
              {/* Toast notifications */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </ReactQueryProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
