import Link from 'next/link';
import { 
  Search,
  Star,
  Sparkles
} from 'lucide-react';
import { getServices, getStats } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Services | SewaGo',
  description: 'Discover trusted local services in Nepal. From house cleaning to electrical work, find verified professionals for all your needs.',
  keywords: ['services', 'local services', 'Nepal', 'house cleaning', 'electrical work', 'professional services'],
  openGraph: {
    title: 'Professional Services | SewaGo',
    description: 'Discover trusted local services in Nepal. From house cleaning to electrical work, find verified professionals for all your needs.',
    type: 'website',
    url: 'https://sewago-final.vercel.app/services',
    images: [
      {
        url: '/og/services.png',
        width: 1200,
        height: 630,
        alt: 'SewaGo Services'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Services | SewaGo',
    description: 'Discover trusted local services in Nepal. From house cleaning to electrical work, find verified professionals for all your needs.',
    images: ['/og/services.png']
  }
};

export default async function ServicesPage() {
  const [services, stats] = await Promise.all([
    getServices(),
    getStats()
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0 nepali-pattern opacity-10"></div>
        
        {/* Floating Elements */}
        <div className="floating-element floating-element-1"></div>
        <div className="floating-element floating-element-2"></div>
        <div className="floating-element floating-element-3"></div>
        
        <div className="container relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Our Services</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 text-balance">
              Professional <span className="text-gradient-secondary">Services</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto text-balance">
              From home cleaning to professional repairs, find the perfect service for your needs. 
              All our providers are verified and trusted. 🇳🇵
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-slate-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-slate-500">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="section-sm bg-slate-50">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for services..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-full text-slate-800 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white transition-all duration-300 shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          {services.length === 0 ? (
            // Empty state
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                No Services Available
              </h2>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
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
                <h2 className="text-4xl font-bold text-slate-800 mb-4">
                  Popular <span className="text-gradient">Services</span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto text-balance">
                  From home cleaning to professional repairs, find the perfect service for your needs
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <div key={service.slug} className="service-card group">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl group-hover:scale-110 transition-transform duration-300">
                        {/* Icon mapping - you can expand this */}
                        {service.icon === 'sparkles' && <Sparkles className="w-10 h-10 text-white" />}
                        {service.icon === 'zap' && <Star className="w-10 h-10 text-white" />}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{service.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {service.summary}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">
                          Rs. {service.startingPrice}
                        </span>
                        <span className="text-sm text-slate-500">Starting from</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span className="capitalize">{service.features.length} features</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>4.9</span>
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
      <section className="section bg-gradient-secondary relative overflow-hidden">
        <div className="absolute inset-0 nepali-pattern opacity-20"></div>
        <div className="container relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Need a Custom Service?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto text-balance">
            Don't see what you're looking for? Contact us and we'll help arrange custom services 
            from our network of professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Contact Us
            </Link>
            <Link 
              href="/contact?type=provider" 
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


