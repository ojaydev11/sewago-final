import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Mock service data for now - will be replaced with API call
  const service = {
    name: 'Service',
    description: 'Service description',
  };

  return {
    title: `${service.name} - SewaGo`,
    description: service.description,
    openGraph: {
      title: service.name,
      description: service.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: service.name,
      description: service.description,
    },
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  
  // Mock service data for now - will be replaced with API call
  const service = {
    name: 'Service Name',
    description: 'This is a service description that provides details about what the service offers.',
    basePrice: 50,
    category: 'cleaning',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
          <p className="text-gray-600">{service.description}</p>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{service.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Base Price</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">Rs. {service.basePrice}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Book This Service</h2>
              <p className="text-gray-600 mb-4">
                Ready to get started? Book this service now and we'll connect you with a qualified provider.
              </p>
              <Link
                href={`/book/${slug}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Services */}
        <div className="text-center">
          <Link
            href="/services"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to Services
          </Link>
        </div>
      </div>
    </div>
  );
}
