
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  StarIcon, 
  ShieldCheckIcon, 
  CheckIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { isFeatureEnabled } from '@/lib/feature-flags';

// Mock data - replace with actual data fetching
const getService = async (slug: string) => {
  // This would normally fetch from your API/database
  const services = [
    {
      _id: '1',
      name: 'House Cleaning',
      slug: 'house-cleaning',
      description: 'Professional house cleaning service with experienced cleaners',
      category: 'Cleaning',
      price: { min: 2000, max: 5000, unit: 'per session' },
      duration: '2-4 hours',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      features: [
        'Deep cleaning of all rooms',
        'Kitchen and bathroom sanitization',
        'Floor mopping and vacuuming',
        'Dusting and window cleaning',
        'Eco-friendly cleaning products'
      ],
      requirements: [
        'Access to water and electricity',
        'Parking space for cleaning equipment'
      ],
      hasWarranty: true,
      warrantyDays: 30,
      isVerified: true,
      reviewStats: {
        averageRating: 4.7,
        totalReviews: 234
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Electrical Work',
      slug: 'electrical-work',
      description: 'Licensed electricians for all electrical installations and repairs',
      category: 'Electrical',
      price: { min: 1500, max: 8000, unit: 'per service' },
      duration: '1-3 hours',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      features: [
        'Wiring installation and repair',
        'Switch and outlet installation',
        'Ceiling fan installation',
        'Electrical troubleshooting',
        'Safety inspection included'
      ],
      requirements: [
        'Access to electrical panel',
        'Materials to be provided by customer'
      ],
      hasWarranty: true,
      warrantyDays: 30,
      isVerified: true,
      reviewStats: {
        averageRating: 4.8,
        totalReviews: 156
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  return services.find(s => s.slug === slug);
};

const getServiceReviews = async (serviceId: string) => {
  // Mock reviews - replace with actual data
  return [
    {
      _id: '1',
      serviceId,
      userId: '1',
      bookingId: '1',
      rating: 5,
      title: 'Excellent service!',
      comment: 'The cleaning team was professional and thorough. Highly recommended!',
      customerName: 'Raj P.',
      isVerified: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      _id: '2',
      serviceId,
      userId: '2',
      bookingId: '2',
      rating: 4,
      title: 'Good value for money',
      comment: 'Service was good and completed on time. Will book again.',
      customerName: 'Sita K.',
      isVerified: true,
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-10T14:20:00Z'
    }
  ];
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getService(params.slug);
  
  if (!service) {
    return {
      title: 'Service Not Found - SewaGo',
      description: 'The requested service could not be found.'
    };
  }

  return {
    title: `${service.name} - Professional Service in Nepal | SewaGo`,
    description: `Book ${service.name.toLowerCase()} service in Kathmandu, Lalitpur, and Bhaktapur. ${service.description}. Starting from NPR ${service.price.min}.`,
    keywords: `${service.name}, ${service.category}, service booking, Nepal, Kathmandu`,
    openGraph: {
      title: `${service.name} - SewaGo`,
      description: service.description,
      type: 'website',
      url: `/services/${service.slug}`,
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: {
          '@type': 'Organization',
          name: 'SewaGo',
          url: 'https://sewago.vercel.app'
        },
        areaServed: ['Kathmandu', 'Lalitpur', 'Bhaktapur'],
        offers: {
          '@type': 'Offer',
          price: service.price.min,
          priceCurrency: 'NPR',
          availability: 'InStock'
        },
        aggregateRating: service.reviewStats ? {
          '@type': 'AggregateRating',
          ratingValue: service.reviewStats.averageRating,
          reviewCount: service.reviewStats.totalReviews
        } : undefined
      })
    }
  };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getService(params.slug);
  
  if (!service) {
    notFound();
  }

  const reviews = isFeatureEnabled('REVIEWS_ENABLED') ? await getServiceReviews(service._id) : [];

  const renderStars = (rating: number, size = 'w-5 h-5') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIcon key={star} className={`${size} text-yellow-500`} />
          ) : (
            <StarOutline key={star} className={`${size} text-gray-300`} />
          )
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-gray-900">Services</Link>
          <span>/</span>
          <span className="text-gray-900">{service.name}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                  <p className="text-gray-600">{service.description}</p>
                </div>
                {service.isVerified && (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Verified Provider</span>
                  </div>
                )}
              </div>

              {/* Warranty Badge */}
              {isFeatureEnabled('WARRANTY_BADGE_ENABLED') && service.hasWarranty && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg mb-4">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {service.warrantyDays}-day workmanship warranty included
                  </span>
                </div>
              )}

              {/* Reviews Summary */}
              {isFeatureEnabled('REVIEWS_ENABLED') && service.reviewStats && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(service.reviewStats.averageRating))}
                    <span className="text-lg font-semibold">{service.reviewStats.averageRating}</span>
                  </div>
                  <span className="text-gray-600">
                    ({service.reviewStats.totalReviews} reviews)
                  </span>
                </div>
              )}

              {/* Service Info */}
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CurrencyRupeeIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold">NPR {service.price.min.toLocaleString()} - {service.price.max.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{service.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Availability</p>
                    <p className="font-semibold">7 days a week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">What's Included</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {service.requirements && service.requirements.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {service.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-600">•</span>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews */}
            {isFeatureEnabled('REVIEWS_ENABLED') && reviews.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {renderStars(review.rating, 'w-4 h-4')}
                            <span className="font-medium">{review.customerName}</span>
                            {review.isVerified && (
                              <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <h4 className="font-medium">{review.title}</h4>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                  {service.reviewStats && service.reviewStats.totalReviews > 3 && (
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      View all {service.reviewStats.totalReviews} reviews
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Book This Service</h3>
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  From NPR {service.price.min.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{service.price.unit}</div>
              </div>

              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium">✓ Pay cash after service</p>
                <p className="text-xs text-green-600 mt-1">No advance payment required</p>
              </div>

              <Link
                href={`/book/${service.slug}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center block transition-colors"
              >
                Book Now
              </Link>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>• Free consultation</p>
                <p>• Experienced professionals</p>
                <p>• Quality guarantee</p>
                {service.hasWarranty && <p>• {service.warrantyDays}-day warranty</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
