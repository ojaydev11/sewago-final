import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SeoJsonLd } from '@/app/components/SeoJsonLd';
import { BookingWizard } from './booking-wizard';

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const serviceResp = await api.get('/services', { params: { q: slug } });
    const list = Array.isArray(serviceResp.data) ? serviceResp.data : (serviceResp.data?.services ?? []);
    const service = list.find((s: { slug?: string }) => s?.slug === slug);

    if (!service) {
      return {
        title: 'Service Not Found | SewaGo',
        description: 'The requested service could not be found.',
      };
    }

    return {
      title: `Book ${service.title} | SewaGo`,
      description: `Book ${service.title} - ${service.description}`,
      alternates: {
        canonical: `/book/${service.slug}`,
      },
      openGraph: {
        title: `Book ${service.title}`,
        description: `Book ${service.title} - ${service.description}`,
        url: `/book/${service.slug}`,
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Book Service | SewaGo',
      description: 'Book your service',
    };
  }
}

export default async function BookingPage({ params }: ServiceDetailPageProps) {
  try {
    const { slug } = await params;
    const serviceResp = await api.get('/services', { params: { q: slug } });
    const list = Array.isArray(serviceResp.data) ? serviceResp.data : (serviceResp.data?.services ?? []);
    const service = list.find((s: { slug?: string }) => s?.slug === slug);

    if (!service) {
      notFound();
    }

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'Order',
      name: `Booking for ${service.title}`,
      description: `Booking request for ${service.title}`,
      provider: {
        '@type': 'Organization',
        name: 'SewaGo',
      },
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
        category: service.category,
      },
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <SeoJsonLd data={jsonLdData} />
        <BookingWizard service={service} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching service for booking:', error);
    notFound();
  }
}
