import Link from 'next/link';
import { 
  SparklesIcon, 
  StarIcon, 
  HeartIcon, 
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative">
        {/* Floating Elements */}
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
            <div className="animate-slide-in-left">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                <SparklesIcon className="w-4 h-4 mr-2" />
                <span>Nepal's Premier Service Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Find Trusted
                <span className="block text-gradient-secondary">Local Services</span>
                <span className="block text-3xl lg:text-4xl font-normal mt-4 opacity-90">
                  in Nepal 🇳🇵
                </span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Connect with verified local service providers for cleaning, electrical work, 
                gardening, and more. Quality services, trusted professionals, 
                <span className="font-semibold"> Namaste! 🙏</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services" className="btn-primary text-lg px-8 py-4">
                  Explore Services
                </Link>
                <Link href="/auth/register" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-red-600">
                  Join as Provider
                </Link>
              </div>
            </div>
            
            <div className="animate-slide-in-right">
              <div className="relative">
                <div className="card-modern p-8 bg-white/95 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <HeartIcon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Why Choose SewaGo?
                    </h3>
                    <div className="space-y-4 text-left">
                      <div className="flex items-center">
                        <StarIcon className="w-5 h-5 text-yellow-500 mr-3" />
                        <span className="text-gray-700">Verified & Trusted Providers</span>
                      </div>
                      <div className="flex items-center">
                        <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">100% Secure & Reliable</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-5 h-5 text-blue-500 mr-3" />
                        <span className="text-gray-700">Quick & Efficient Service</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our <span className="text-gradient-primary">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what makes SewaGo the most trusted platform for local services in Nepal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <UserGroupIcon className="w-12 h-12" />,
                title: "Verified Providers",
                description: "All our service providers are thoroughly verified and background-checked for your safety.",
                color: "text-blue-600"
              },
              {
                icon: <ShieldCheckIcon className="w-12 h-12" />,
                title: "Secure Payments",
                description: "Safe and secure payment processing with multiple payment options available.",
                color: "text-green-600"
              },
              {
                icon: <ClockIcon className="w-12 h-12" />,
                title: "24/7 Support",
                description: "Round-the-clock customer support to help you with any questions or issues.",
                color: "text-purple-600"
              },
              {
                icon: <MapPinIcon className="w-12 h-12" />,
                title: "Local Coverage",
                description: "Comprehensive coverage across major cities and regions in Nepal.",
                color: "text-orange-600"
              },
              {
                icon: <StarIcon className="w-12 h-12" />,
                title: "Quality Guarantee",
                description: "We guarantee the quality of all services provided through our platform.",
                color: "text-yellow-600"
              },
              {
                icon: <PhoneIcon className="w-12 h-12" />,
                title: "Easy Booking",
                description: "Simple and intuitive booking process for all your service needs.",
                color: "text-red-600"
              }
            ].map((feature, index) => (
              <div key={index} className="service-card group">
                <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Popular <span className="text-gradient-primary">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From home cleaning to professional repairs, find the perfect service for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "House Cleaning",
                icon: "🧹",
                description: "Professional home cleaning services",
                price: "From Rs. 500",
                color: "from-blue-500 to-cyan-500"
              },
              {
                name: "Electrical Work",
                icon: "⚡",
                description: "Certified electrical repairs & installations",
                price: "From Rs. 800",
                color: "from-yellow-500 to-orange-500"
              },
              {
                name: "Gardening",
                icon: "🌱",
                description: "Landscaping & garden maintenance",
                price: "From Rs. 600",
                color: "from-green-500 to-emerald-500"
              },
              {
                name: "Plumbing",
                icon: "🔧",
                description: "Expert plumbing solutions",
                price: "From Rs. 700",
                color: "from-purple-500 to-pink-500"
              }
            ].map((service, index) => (
              <div key={index} className="group">
                <div className={`bg-gradient-to-br ${service.color} p-6 rounded-2xl text-white text-center transform group-hover:scale-105 transition-all duration-300 cursor-pointer`}>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-sm opacity-90 mb-3">{service.description}</p>
                  <div className="text-lg font-semibold">{service.price}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/services" className="btn-secondary text-lg px-8 py-4">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust SewaGo for their local service needs. 
            Experience the difference today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Get Started Now
            </Link>
            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gradient-primary mb-4">SewaGo</h3>
              <p className="text-gray-400 mb-4">
                Nepal's premier platform for local services. Connecting trusted providers with customers.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🇳🇵</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services" className="hover:text-white transition-colors">House Cleaning</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Electrical Work</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Gardening</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Plumbing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p>📍 Kathmandu, Nepal</p>
                <p>📞 +977-1-4XXXXXX</p>
                <p>✉️ info@sewago.com</p>
                <p>🕒 24/7 Support</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SewaGo. All rights reserved. Made with ❤️ in Nepal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
