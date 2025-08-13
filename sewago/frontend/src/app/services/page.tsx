"use client";
import Link from 'next/link';

// Mock services data for now - will be replaced with API call
const mockServices = [
  {
    id: '1',
    name: 'House Cleaning',
    slug: 'house-cleaning',
    description: 'Professional house cleaning services including dusting, vacuuming, and sanitizing.',
    basePrice: 50,
    category: 'cleaning',
    image: '/icons/cleaning.svg',
  },
  {
    id: '2',
    name: 'Electrical Repair',
    slug: 'electrical-repair',
    description: 'Expert electrical repair and maintenance for your home or office.',
    basePrice: 80,
    category: 'electrical',
    image: '/icons/electrical.svg',
  },
  {
    id: '3',
    name: 'Gardening & Landscaping',
    slug: 'gardening',
    description: 'Landscaping and garden maintenance services to keep your outdoor space beautiful.',
    basePrice: 60,
    category: 'gardening',
    image: '/icons/gardening.svg',
  },
  {
    id: '4',
    name: 'Plumbing Services',
    slug: 'plumbing',
    description: 'Professional plumbing repair and installation services.',
    basePrice: 70,
    category: 'plumbing',
    image: '/icons/plumbing.svg',
  },
  {
    id: '5',
    name: 'Carpentry Work',
    slug: 'carpentry',
    description: 'Custom carpentry and woodwork services for your home.',
    basePrice: 90,
    category: 'carpentry',
    image: '/icons/carpentry.svg',
  },
  {
    id: '6',
    name: 'Painting Services',
    slug: 'painting',
    description: 'Interior and exterior painting services for homes and offices.',
    basePrice: 55,
    category: 'painting',
    image: '/icons/painting.svg',
  },
];

const categories = [
  { id: 'all', name: 'All Services', count: mockServices.length },
  { id: 'cleaning', name: 'Cleaning', count: mockServices.filter(s => s.category === 'cleaning').length },
  { id: 'electrical', name: 'Electrical', count: mockServices.filter(s => s.category === 'electrical').length },
  { id: 'gardening', name: 'Gardening', count: mockServices.filter(s => s.category === 'gardening').length },
  { id: 'plumbing', name: 'Plumbing', count: mockServices.filter(s => s.category === 'plumbing').length },
  { id: 'carpentry', name: 'Carpentry', count: mockServices.filter(s => s.category === 'carpentry').length },
  { id: 'painting', name: 'Painting', count: mockServices.filter(s => s.category === 'painting').length },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover a wide range of professional services to meet all your home and business needs.
            From cleaning to repairs, we've got you covered.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category.id === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-6 h-6 text-indigo-600"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {service.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    Rs. {service.basePrice}
                  </div>
                  <Link
                    href={`/book/${service.slug}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-600 mb-6">
              Contact us to discuss custom service requirements or special requests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/provider/register"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


