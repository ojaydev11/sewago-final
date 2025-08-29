import EnhancedNavbar from '@/components/EnhancedNavbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Search, Filter, Star, Clock, MapPin, Users, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const serviceCategories = [
    {
      id: 'home-services',
      name: 'Home Services',
      icon: '🏠',
      description: 'Essential services for your home maintenance and improvement',
      services: [
        { name: 'Electrician', icon: '⚡', price: 'From ₹500', rating: 4.8, providers: 2847, features: ['Wiring & Installation', 'Repairs', 'Safety Inspections'] },
        { name: 'Plumber', icon: '🔧', price: 'From ₹600', rating: 4.7, providers: 1923, features: ['Pipe Repairs', 'Fixture Installation', 'Drain Cleaning'] },
        { name: 'House Cleaner', icon: '✨', price: 'From ₹800', rating: 4.9, providers: 3156, features: ['Regular Cleaning', 'Deep Cleaning', 'Move-in/out'] },
        { name: 'Carpenter', icon: '🪚', price: 'From ₹700', rating: 4.6, providers: 892, features: ['Furniture Repair', 'Custom Work', 'Installation'] },
        { name: 'Painter', icon: '🎨', price: 'From ₹600', rating: 4.5, providers: 1567, features: ['Interior Painting', 'Exterior Painting', 'Wall Texturing'] },
        { name: 'Gardener', icon: '🌱', price: 'From ₹400', rating: 4.4, providers: 743, features: ['Lawn Care', 'Plant Maintenance', 'Landscaping'] }
      ]
    },
    {
      id: 'professional-services',
      name: 'Professional Services',
      icon: '💼',
      description: 'Specialized professional services for your business and personal needs',
      services: [
        { name: 'Home Tutor', icon: '📚', price: 'From ₹400', rating: 4.8, providers: 1234, features: ['Academic Support', 'Test Preparation', 'Language Learning'] },
        { name: 'Photographer', icon: '📸', price: 'From ₹2000', rating: 4.7, providers: 567, features: ['Portrait Photography', 'Event Coverage', 'Product Shots'] },
        { name: 'Event Planner', icon: '🎉', price: 'From ₹5000', rating: 4.6, providers: 234, features: ['Wedding Planning', 'Corporate Events', 'Birthday Parties'] },
        { name: 'Interior Designer', icon: '🏡', price: 'From ₹3000', rating: 4.5, providers: 189, features: ['Space Planning', 'Color Consultation', 'Furniture Selection'] },
        { name: 'Personal Trainer', icon: '💪', price: 'From ₹800', rating: 4.7, providers: 456, features: ['Fitness Training', 'Nutrition Guidance', 'Wellness Coaching'] },
        { name: 'Beauty Services', icon: '💄', price: 'From ₹500', rating: 4.6, providers: 678, features: ['Hair Styling', 'Makeup', 'Nail Care'] }
      ]
    },
    {
      id: 'emergency-services',
      name: 'Emergency Services',
      icon: '🚨',
      description: '24/7 emergency services for urgent situations',
      services: [
        { name: 'Emergency Electrician', icon: '⚡', price: 'From ₹800', rating: 4.9, providers: 156, features: ['24/7 Available', 'Quick Response', 'Emergency Repairs'] },
        { name: 'Emergency Plumber', icon: '🔧', price: 'From ₹1000', rating: 4.8, providers: 134, features: ['Burst Pipes', 'Blocked Drains', 'Water Leaks'] },
        { name: 'Security Services', icon: '🛡️', price: 'From ₹1500', rating: 4.7, providers: 89, features: ['Home Security', 'Event Security', 'Patrol Services'] },
        { name: 'Medical Support', icon: '🏥', price: 'From ₹2000', rating: 4.9, providers: 67, features: ['First Aid', 'Health Checkups', 'Emergency Care'] }
      ]
    },
    {
      id: 'specialty-services',
      name: 'Specialty Services',
      icon: '⭐',
      description: 'Unique and specialized services for specific needs',
      services: [
        { name: 'Pet Care', icon: '🐕', price: 'From ₹300', rating: 4.6, providers: 234, features: ['Pet Sitting', 'Dog Walking', 'Grooming'] },
        { name: 'Elderly Care', icon: '👴', price: 'From ₹600', rating: 4.8, providers: 156, features: ['Companionship', 'Personal Care', 'Medication Reminders'] },
        { name: 'Child Care', icon: '👶', price: 'From ₹400', rating: 4.7, providers: 345, features: ['Babysitting', 'Child Development', 'Educational Activities'] },
        { name: 'Computer Repair', icon: '💻', price: 'From ₹500', rating: 4.5, providers: 456, features: ['Hardware Repair', 'Software Issues', 'Virus Removal'] },
        { name: 'Appliance Repair', icon: '🔌', price: 'From ₹400', rating: 4.4, providers: 234, features: ['Refrigerator', 'Washing Machine', 'AC Repair'] },
        { name: 'Pest Control', icon: '🐜', price: 'From ₹800', rating: 4.6, providers: 123, features: ['General Pest Control', 'Termite Treatment', 'Rodent Control'] }
      ]
    }
  ];

  const popularCities = [
    'Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar', 'Dharan', 'Butwal', 'Hetauda'
  ];

  return (
    <>
      <EnhancedNavbar />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              All Services
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Discover our comprehensive range of local services. From home maintenance 
              to professional expertise, we connect you with verified providers across Nepal.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for services, providers, or locations..."
                  className="w-full pl-12 pr-4 py-4 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Stats */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>All Categories</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-700 transition-colors">
                  <Star className="w-4 h-4" />
                  <span>Top Rated</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-700 transition-colors">
                  <Clock className="w-4 h-4" />
                  <span>Same Day</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>8,000+ Providers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>25+ Cities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>4.8/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services by Category */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {serviceCategories.map((category, categoryIndex) => (
              <div key={category.id} className="mb-20">
                <div className="text-center mb-12">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {category.name}
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    {category.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.services.map((service, serviceIndex) => (
                    <div
                      key={serviceIndex}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-3xl">{service.icon}</div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">{service.price}</div>
                          <div className="text-sm text-gray-500">{service.providers} providers</div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>

                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{service.rating}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.providers.toLocaleString()}+ reviews
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        {service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={`/en/services/${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 group-hover:underline"
                      >
                        View Providers
                        <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Cities */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Services Available Across Nepal
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find trusted service providers in major cities and towns across Nepal
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {popularCities.map((city, index) => (
                <Link
                  key={index}
                  href={`/en/services?location=${city}`}
                  className="bg-gray-50 rounded-xl p-6 text-center hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-all duration-300 group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    🏙️
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {city}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.floor(Math.random() * 500) + 100}+ providers
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Contact us directly and we'll help you find the right service provider 
              for your specific needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/en/contact"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Contact Support
              </Link>
              <Link
                href="/en/support"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Live Chat
              </Link>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </>
  );
}


