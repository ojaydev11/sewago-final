import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { prisma } from '@/lib/db';

// Fetch services from database
async function getServices() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    // Return empty array if database is not connected
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 mr-2" />
              <span>Our Services</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Professional <span className="text-gradient-secondary">Services</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              From home cleaning to professional repairs, find the perfect service for your needs. 
              All our providers are verified and trusted. 🇳🇵
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for services..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:bg-white transition-all duration-300"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {services.length === 0 ? (
            // Empty state
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                No Services Available
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                We're currently setting up our service catalog. Please check back soon or contact us for immediate assistance.
              </p>
              <Link 
                href="/contact" 
                className="btn-primary text-lg px-8 py-4"
              >
                Contact Support
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Popular <span className="text-gradient-primary">Services</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  From home cleaning to professional repairs, find the perfect service for your needs
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service: any) => (
                  <div key={service.id} className="service-card group hover:shadow-xl transition-all duration-300">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl group-hover:scale-110 transition-transform duration-300">
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-red-600">
                          Rs. {service.basePrice}
                        </span>
                        <span className="text-sm text-gray-500">Starting from</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="capitalize">{service.category}</span>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-500" />
                          <span>4.8</span>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/services/${service.slug}`}
                        className="w-full btn-primary text-center py-3 group-hover:scale-105 transition-transform duration-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Need a Custom Service?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Don't see what you're looking for? Contact us and we'll help arrange custom services 
            from our network of professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Contact Us
            </Link>
            <Link 
              href="/provider/register" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


