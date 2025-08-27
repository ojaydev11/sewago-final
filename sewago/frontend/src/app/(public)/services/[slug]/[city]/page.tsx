
import { Metadata } from 'next';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPinIcon, 
  StarIcon,
  PhoneIcon,
  CheckIcon 
} from '@heroicons/react/24/solid';

const CITIES = ['kathmandu', 'lalitpur', 'bhaktapur'] as const;
const SERVICES = [
  {
    slug: 'house-cleaning',
    name: 'House Cleaning',
    description: 'Professional house cleaning service',
    category: 'Cleaning',
    price: { min: 2000, max: 5000 },
    features: ['Deep cleaning', 'Sanitization', 'Eco-friendly products']
  },
  {
    slug: 'electrical-work',
    name: 'Electrical Work',
    description: 'Licensed electricians for all electrical needs',
    category: 'Electrical',
    price: { min: 1500, max: 8000 },
    features: ['Wiring', 'Installation', 'Troubleshooting']
  }
];

const CITY_INFO = {
  kathmandu: {
    name: 'Kathmandu',
    description: 'Nepal\'s capital and largest city',
    areas: ['Thamel', 'Baluwatar', 'New Baneshwor', 'Kalanki', 'Koteshwor']
  },
  lalitpur: {
    name: 'Lalitpur',
    description: 'Historic city known for its arts and culture',
    areas: ['Patan', 'Jawalakhel', 'Sanepa', 'Kupondole', 'Pulchowk']
  },
  bhaktapur: {
    name: 'Bhaktapur',
    description: 'Ancient city with rich cultural heritage',
    areas: ['Durbar Square', 'Thimi', 'Madhyapur', 'Suryabinayak', 'Changunarayan']
  }
};

export async function generateStaticParams() {
  const params = [];
  for (const service of SERVICES) {
    for (const city of CITIES) {
      params.push({
        slug: service.slug,
        city: city
      });
    }
  }
  return params;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string; city: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const service = SERVICES.find(s => s.slug === resolvedParams.slug);
  const cityInfo = CITY_INFO[resolvedParams.city as keyof typeof CITY_INFO];
  
  if (!service || !cityInfo) {
    return {
      title: 'Service Not Found - SewaGo',
      description: 'The requested service could not be found.'
    };
  }

  const title = `${service.name} in ${cityInfo.name} - Professional Service | SewaGo`;
  const description = `Book ${service.name.toLowerCase()} service in ${cityInfo.name}, Nepal. ${service.description}. Starting from NPR ${service.price.min}. Available in all areas of ${cityInfo.name}.`;

  return {
    title,
    description,
    keywords: `${service.name}, ${cityInfo.name}, ${service.category}, service booking, Nepal`,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/services/${service.slug}/${resolvedParams.city}`,
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `${service.name} in ${cityInfo.name}`,
        description: service.description,
        provider: {
          '@type': 'Organization',
          name: 'SewaGo',
          url: 'https://sewago.vercel.app'
        },
        areaServed: {
          '@type': 'City',
          name: cityInfo.name,
          addressCountry: 'NP'
        },
        offers: {
          '@type': 'Offer',
          price: service.price.min,
          priceCurrency: 'NPR',
          availability: 'InStock'
        }
      })
    }
  };
}

export default async function ServiceCityPage({ 
  params 
}: { 
  params: Promise<{ slug: string; city: string }> 
}) {
  const resolvedParams = await params;
  const service = SERVICES.find(s => s.slug === resolvedParams.slug);
  const cityInfo = CITY_INFO[resolvedParams.city as keyof typeof CITY_INFO];
  
  if (!service || !cityInfo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-gray-900">Services</Link>
          <span>/</span>
          <Link href={`/services/${service.slug}`} className="hover:text-gray-900">{service.name}</Link>
          <span>/</span>
          <span className="text-gray-900">{cityInfo.name}</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {service.name} in {cityInfo.name}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Professional {service.name.toLowerCase()} service available across {cityInfo.name}. 
                {cityInfo.description}.
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-gray-600">(200+ reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">Available in all areas</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href={`/book/${service.slug}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Book Now
                </Link>
                <Link
                  href="tel:+977-9800000000"
                  className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <PhoneIcon className="w-4 h-4" />
                  Call Now
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Service Areas in {cityInfo.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                {cityInfo.areas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">
                Why Choose Our {service.name} Service in {cityInfo.name}?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">What's Included</h3>
                  <div className="space-y-2">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Local Advantages</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Local {cityInfo.name} professionals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Quick response time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Familiar with local requirements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm">30-day warranty</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Frequently Asked Questions - {service.name} in {cityInfo.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">How do I book {service.name.toLowerCase()} service in {cityInfo.name}?</h3>
                  <p className="text-gray-600 text-sm">
                    Simply click the "Book Now" button, select your preferred date and time, 
                    and provide your {cityInfo.name} address. Our team will contact you to confirm.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">What areas of {cityInfo.name} do you serve?</h3>
                  <p className="text-gray-600 text-sm">
                    We provide {service.name.toLowerCase()} service across all areas of {cityInfo.name}, 
                    including {cityInfo.areas.slice(0, 3).join(', ')}, and more.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">How much does {service.name.toLowerCase()} cost in {cityInfo.name}?</h3>
                  <p className="text-gray-600 text-sm">
                    Our {service.name.toLowerCase()} service in {cityInfo.name} starts from NPR {service.price.min.toLocaleString()}. 
                    Final pricing depends on the scope of work and specific requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Get {service.name} in {cityInfo.name}</h3>
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  From NPR {service.price.min.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Starting price</div>
              </div>

              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium">✓ Pay cash after service</p>
                <p className="text-xs text-green-600 mt-1">No advance payment required</p>
              </div>

              <Link
                href={`/book/${service.slug}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center block transition-colors mb-3"
              >
                Book {service.name}
              </Link>

              <Link
                href="tel:+977-9800000000"
                className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium text-center block transition-colors flex items-center justify-center gap-2"
              >
                <PhoneIcon className="w-4 h-4" />
                Call Now
              </Link>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>• Available in {cityInfo.name}</p>
                <p>• Licensed professionals</p>
                <p>• 30-day warranty</p>
                <p>• Cash on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
