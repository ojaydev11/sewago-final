import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { SeoJsonLd } from '@/app/components/SeoJsonLd';
import { BookingWizard } from './booking-wizard';

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const service = await db.service.findUnique({
      where: { slug }
    });

    if (!service) {
      return {
        title: 'Service Not Found | SewaGo',
        description: 'The requested service could not be found.',
      };
    }

    return {
      title: `Book ${service.name} | SewaGo`,
      description: `Book ${service.name} - ${service.description}`,
      alternates: {
        canonical: `/book/${service.slug}`,
      },
      openGraph: {
        title: `Book ${service.name}`,
        description: `Book ${service.name} - ${service.description}`,
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
    const service = await db.service.findUnique({
      where: { slug }
    });

    if (!service) {
      notFound();
    }

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'Order',
      name: `Booking for ${service.name}`,
      description: `Booking request for ${service.name}`,
      provider: {
        '@type': 'Organization',
        name: 'SewaGo',
      },
      itemOffered: {
        '@type': 'Service',
        name: service.name,
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
