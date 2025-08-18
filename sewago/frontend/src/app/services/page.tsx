import { Suspense } from 'react';
import { Metadata } from 'next';
import { api } from '@/lib/api';
import { SeoJsonLd } from '@/app/components/SeoJsonLd';
import { ServicesClient } from './services.client';
import { QuoteEstimator } from './quote-estimator.client';
import { SewaAIWidget } from '@/app/components/SewaAIWidget';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Services | SewaGo',
  description: 'Find and book trusted local services in Nepal: plumbing, electrical, cleaning, moving, repairs, gardening.',
  robots: 'index, follow',
  alternates: {
    canonical: '/services',
    languages: process.env.NEXT_PUBLIC_I18N_ENABLED === 'true' ? {
      'en': '/en/services',
      'ne': '/ne/services',
    } : undefined,
  },
  openGraph: {
    title: 'SewaGo Services',
    description: 'Discover reliable local services by category and city.',
    url: '/services',
    images: [{ url: '/api/og/services' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SewaGo Services',
    description: 'Discover reliable local services by category and city.',
    images: ['/api/og/services'],
  },
};

type ServiceListItem = { title: string; description: string; category: string; id?: string; slug?: string };

export default async function ServicesPage() {
  let services: ServiceListItem[] = [];
  try {
    const resp = await api.get('/services');
    services = Array.isArray(resp.data) ? resp.data : (resp.data?.services ?? []);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to fetch services from backend, using fallback:', error);
  }

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'SewaGo Service Catalog',
    itemListElement: services.map((service: { title: string; description: string; category: string }, index: number) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
        category: service.category,
      },
      position: index + 1,
    })),
    potentialAction: {
      '@type': 'SearchAction',
      target: '/services?q={search_term}',
      'query-input': 'required name=search_term',
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Service
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with trusted local professionals for all your home and business needs
        </p>
      </div>

      <SeoJsonLd data={jsonLdData} />

      <Suspense fallback={<div className="text-center py-8">Loading services...</div>}>
        <ServicesClient initialServices={services} />
      </Suspense>

      {process.env.NEXT_PUBLIC_QUOTE_ESTIMATOR_ENABLED === 'true' && (
        <QuoteEstimator />
      )}

      {process.env.NEXT_PUBLIC_SEWAAI_ENABLED === 'true' && (
        <SewaAIWidget />
      )}
    </div>
  );
}


