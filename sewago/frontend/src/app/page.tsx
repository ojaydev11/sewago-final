
import Link from 'next/link';
import { 
  CheckCircleIcon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  TruckIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const services = [
  {
    slug: 'house-cleaning',
    name: 'House Cleaning',
    icon: HomeIcon,
    description: 'Professional home cleaning services',
    price: 'From Rs. 500',
  },
  {
    slug: 'electrical-work',
    name: 'Electrical Work',
    icon: WrenchScrewdriverIcon,
    description: 'Certified electrical repairs & installations',
    price: 'From Rs. 800',
  },
  {
    slug: 'gardening',
    name: 'Gardening',
    icon: UserGroupIcon,
    description: 'Landscaping & garden maintenance',
    price: 'From Rs. 600',
  },
  {
    slug: 'moving',
    name: 'Moving Services',
    icon: TruckIcon,
    description: 'Reliable moving and transportation',
    price: 'From Rs. 1200',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Kathmandu',
    text: 'Excellent service! The cleaning team was professional and thorough.',
    rating: 5,
  },
  {
    name: 'Rajesh Thapa',
    location: 'Pokhara',
    text: 'Quick response and quality electrical work. Highly recommended.',
    rating: 5,
  },
  {
    name: 'Maya Gurung',
    location: 'Lalitpur',
    text: 'Professional gardening service transformed our backyard beautifully.',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Find Trusted
                <span className="block text-primary-300">Local Services</span>
                <span className="block text-2xl lg:text-3xl font-normal mt-4 opacity-90">
                  in Nepal
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
                Connect with verified local service providers for cleaning, electrical work, 
                gardening, and more. Quality services, trusted professionals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services" className="btn-primary text-lg px-8 py-4">
                  Explore Services
                </Link>
                <Link href="/auth/register" className="btn-outline border-white text-white hover:bg-white hover:text-slate-900 text-lg px-8 py-4">
                  Join as Provider
                </Link>
              </div>
            </div>
            
            <div className="animate-slide-up">
              <div className="card p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    Why Choose SewaGo?
                  </h3>
                  <div className="space-y-4 text-left">
                    <div className="flex items-center">
                      <StarIcon className="w-5 h-5 text-saffron mr-3" />
                      <span className="text-slate-700">Verified & Trusted Providers</span>
                    </div>
                    <div className="flex items-center">
                      <ShieldCheckIcon className="w-5 h-5 text-jade mr-3" />
                      <span className="text-slate-700">100% Secure & Reliable</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-5 h-5 text-primary mr-3" />
                      <span className="text-slate-700">Quick & Efficient Service</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Getting the service you need is simple and straightforward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Browse Services',
                description: 'Choose from our wide range of verified service providers',
                icon: UserGroupIcon,
              },
              {
                step: '2',
                title: 'Book & Schedule',
                description: 'Select your preferred time and confirm your booking',
                icon: ClockIcon,
              },
              {
                step: '3',
                title: 'Get Service',
                description: 'Professional service providers arrive at your location',
                icon: CheckCircleIcon,
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Popular Services
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From home cleaning to professional repairs, find the perfect service for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link key={index} href={`/services/${service.slug}`} className="group">
                <div className="card p-6 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <service.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                  <div className="text-primary font-semibold">{service.price}</div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/services" className="btn-primary text-lg px-8 py-4">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-saffron fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-slate-600 text-sm">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust SewaGo for their local service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-primary hover:bg-slate-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Get Started Now
            </Link>
            <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-4">SewaGo</h3>
              <p className="text-slate-400 mb-4">
                Nepal's premier platform for local services. Connecting trusted providers with customers.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/services/house-cleaning" className="hover:text-white transition-colors">House Cleaning</Link></li>
                <li><Link href="/services/electrical-work" className="hover:text-white transition-colors">Electrical Work</Link></li>
                <li><Link href="/services/gardening" className="hover:text-white transition-colors">Gardening</Link></li>
                <li><Link href="/services/moving" className="hover:text-white transition-colors">Moving</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  <span>Kathmandu, Nepal</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  <span>+977-1-4XXXXXX</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  <span>info@sewago.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 SewaGo. All rights reserved. Made with care in Nepal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
