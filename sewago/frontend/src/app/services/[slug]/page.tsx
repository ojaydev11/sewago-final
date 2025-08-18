import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SeoJsonLd } from '@/app/components/SeoJsonLd';
import { ServiceDetailClient } from './service-detail.client';

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const serviceResp = await api.get('/services', { params: { q: slug } });
    const list: Array<Record<string, unknown>> = Array.isArray(serviceResp.data) ? serviceResp.data : (serviceResp.data?.services ?? []);
    const service = list.find((s) => String((s['slug'] ?? s['_id']) as string) === slug) as {
      title: string;
      description: string;
      category: string;
      slug: string;
      imageUrl?: string;
      priceRange?: { min: number; max: number };
    } | undefined;

    if (!service) {
      return {
        title: 'Service Not Found | SewaGo',
        description: 'The requested service could not be found.',
      };
    }

    return {
      title: `${service.title} | SewaGo`,
      description: service.description,
      alternates: {
        canonical: `/services/${service.slug}`,
        languages: process.env.NEXT_PUBLIC_I18N_ENABLED === 'true' ? {
          'en': `/en/services/${service.slug}`,
          'ne': `/ne/services/${service.slug}`,
        } : undefined,
      },
      openGraph: {
        title: service.title,
        description: service.description,
        url: `/services/${service.slug}`,
        images: service.imageUrl ? [{ url: service.imageUrl }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: service.title,
        description: service.description,
        images: service.imageUrl ? [service.imageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Service | SewaGo',
      description: 'Service details',
    };
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  try {
    const { slug } = await params;
    const serviceResp = await api.get('/services', { params: { q: slug } });
    const list: Array<Record<string, unknown>> = Array.isArray(serviceResp.data) ? serviceResp.data : (serviceResp.data?.services ?? []);
    const service = list.find((s) => String((s['slug'] ?? s['_id']) as string) === slug) as {
      id?: string;
      title: string;
      description: string;
      category: string;
      slug: string;
      imageUrl?: string;
      priceRange?: { min: number; max: number };
    } | undefined;

    if (!service) {
      notFound();
    }

    // Get reviews for this service (placeholder until backend reviews endpoint is wired)
    type ReviewForClient = { id: string; rating: number; createdAt: string; user: { name: string }; comment?: string };
    const reviews: ReviewForClient[] = [];

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length 
      : 0;

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      description: service.description,
      category: service.category,
      provider: {
        '@type': 'Organization',
        name: 'SewaGo',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Nepal',
      },
      ...(service.priceRange && {
        offers: {
          '@type': 'Offer',
          priceCurrency: 'NPR',
          price: service.priceRange.min,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      }),
      ...(reviews.length > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: averageRating,
          reviewCount: reviews.length,
        },
      }),
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <SeoJsonLd data={jsonLdData} />
        <ServiceDetailClient 
          service={service} 
          reviews={reviews}
          averageRating={averageRating}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching service:', error);
    notFound();
  }
}
