"use client";
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  StarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const services = [
  {
    id: 1,
    name: "House Cleaning",
    slug: "house-cleaning",
    description: "Professional home cleaning services including deep cleaning, regular maintenance, and post-construction cleanup.",
    icon: "🧹",
    category: "cleaning",
    basePrice: 500,
    rating: 4.8,
    reviews: 127,
    features: ["Eco-friendly products", "Flexible scheduling", "Satisfaction guaranteed"],
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    id: 2,
    name: "Electrical Work",
    slug: "electrical-work",
    description: "Certified electrical repairs, installations, and maintenance by licensed professionals.",
    icon: "⚡",
    category: "electrical",
    basePrice: 800,
    rating: 4.9,
    reviews: 89,
    features: ["Licensed electricians", "24/7 emergency service", "Warranty included"],
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  {
    id: 3,
    name: "Gardening & Landscaping",
    slug: "gardening",
    description: "Beautiful garden design, maintenance, and landscaping services for your outdoor space.",
    icon: "🌱",
    category: "gardening",
    basePrice: 600,
    rating: 4.7,
    reviews: 156,
    features: ["Design consultation", "Seasonal maintenance", "Plant care"],
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    id: 4,
    name: "Plumbing Services",
    slug: "plumbing",
    description: "Expert plumbing solutions for residential and commercial properties.",
    icon: "🔧",
    category: "plumbing",
    basePrice: 700,
    rating: 4.8,
    reviews: 203,
    features: ["Emergency repairs", "Installation services", "Preventive maintenance"],
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    id: 5,
    name: "Carpentry Work",
    slug: "carpentry",
    description: "Custom woodwork, furniture repair, and carpentry services by skilled craftsmen.",
    icon: "🪚",
    category: "carpentry",
    basePrice: 900,
    rating: 4.9,
    reviews: 78,
    features: ["Custom designs", "Quality materials", "Expert craftsmanship"],
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  {
    id: 6,
    name: "Painting Services",
    slug: "painting",
    description: "Interior and exterior painting services with premium quality materials.",
    icon: "🎨",
    category: "painting",
    basePrice: 400,
    rating: 4.6,
    reviews: 134,
    features: ["Color consultation", "Premium paints", "Clean finish"],
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200"
  },
  {
    id: 7,
    name: "Moving & Packing",
    slug: "moving",
    description: "Professional moving services with careful packing and safe transportation.",
    icon: "📦",
    category: "moving",
    basePrice: 1200,
    rating: 4.8,
    reviews: 92,
    features: ["Full packing service", "Insurance coverage", "Timely delivery"],
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  {
    id: 8,
    name: "Appliance Repair",
    slug: "appliance-repair",
    description: "Repair and maintenance services for all types of home appliances.",
    icon: "🔌",
    category: "appliance",
    basePrice: 600,
    rating: 4.7,
    reviews: 167,
    features: ["Same-day service", "Genuine parts", "Extended warranty"],
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  }
];

const categories = [
  { name: "All", value: "all", color: "from-red-500 to-orange-500" },
  { name: "Cleaning", value: "cleaning", color: "from-blue-500 to-cyan-500" },
  { name: "Electrical", value: "electrical", color: "from-yellow-500 to-orange-500" },
  { name: "Gardening", value: "gardening", color: "from-green-500 to-emerald-500" },
  { name: "Plumbing", value: "plumbing", color: "from-purple-500 to-pink-500" },
  { name: "Carpentry", value: "carpentry", color: "from-amber-500 to-orange-500" },
  { name: "Painting", value: "painting", color: "from-pink-500 to-rose-500" },
  { name: "Moving", value: "moving", color: "from-indigo-500 to-blue-500" },
  { name: "Appliance", value: "appliance", color: "from-red-500 to-pink-500" }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4 mr-2" />
              <span>Professional Services</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Our <span className="text-gradient-secondary">Services</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Discover a wide range of professional services delivered by verified experts. 
              Quality guaranteed, satisfaction assured! 🇳🇵
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-red-600"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.value}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  category.value === 'all'
                    ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`service-card group ${service.bgColor} ${service.borderColor} animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Service Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-3xl mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                
                {/* Service Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors duration-300">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {service.description}
                  </p>
                </div>
                
                {/* Features */}
                <div className="mb-6">
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full mr-3`}></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price and Rating */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <CurrencyRupeeIcon className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-800">
                      {service.basePrice}
                    </span>
                    <span className="text-sm text-gray-500">starting</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{service.rating}</span>
                    <span className="text-xs text-gray-500">({service.reviews})</span>
                  </div>
                </div>
                
                {/* Book Button */}
                <Link
                  href={`/book/${service.slug}`}
                  className={`w-full bg-gradient-to-r ${service.color} text-white py-3 px-6 rounded-xl font-semibold text-center block transform group-hover:scale-105 transition-all duration-300 hover:shadow-lg`}
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            We're constantly expanding our service offerings. Contact us to request a custom service 
            or let us know what you need!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Request Custom Service
            </Link>
            <Link href="/provider/register" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose <span className="text-gradient-primary">SewaGo</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the best service experience in Nepal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <StarIcon className="w-12 h-12" />,
                title: "Verified Providers",
                description: "All our service providers undergo thorough background checks and verification processes.",
                color: "text-yellow-600"
              },
              {
                icon: <ClockIcon className="w-12 h-12" />,
                title: "Quick Service",
                description: "Get services delivered within hours, not days. We value your time.",
                color: "text-blue-600"
              },
              {
                icon: <MapPinIcon className="w-12 h-12" />,
                title: "Local Coverage",
                description: "Comprehensive coverage across major cities and regions in Nepal.",
                color: "text-green-600"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


