import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { 
  Search, 
  Calendar, 
  CheckCircle, 
  Wrench, 
  Zap, 
  Home,
  Tree,
  Star,
  Shield,
  Clock,
  MapPin,
  ArrowRight,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react'

const Home = () => {
  const howItWorks = [
    { 
      icon: Search, 
      title: "Find Service", 
      desc: "Browse or search from our verified providers." 
    },
    { 
      icon: Calendar, 
      title: "Book Instantly", 
      desc: "Select date, time, and location." 
    },
    { 
      icon: CheckCircle, 
      title: "Get It Done", 
      desc: "Relax while our provider completes the job." 
    }
  ]

  const serviceCategories = [
    { 
      icon: Wrench, 
      title: "Plumbing", 
      desc: "Leaks, repairs, installations." 
    },
    { 
      icon: Zap, 
      title: "Electrical", 
      desc: "Wiring, lighting, repairs." 
    },
    { 
      icon: Home, 
      title: "Cleaning", 
      desc: "Home, office, and deep cleaning." 
    },
    { 
      icon: Tree, 
      title: "Gardening", 
      desc: "Lawn care, landscaping, planting." 
    }
  ]

  const whyChooseUs = [
    "Verified, trusted providers",
    "Transparent pricing",
    "Customer support 7 days/week",
    "Serving all major cities"
  ]

  const testimonials = [
    { 
      name: "Aarav S.", 
      review: "Booking was fast and easy — the plumber arrived on time and fixed everything perfectly!" 
    },
    { 
      name: "Priya T.", 
      review: "Loved the experience. Definitely using SewaGo again!" 
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="px-6 md:px-8 lg:px-12 py-16 bg-gradient-to-br from-[#0F62FE] to-[#0052CC] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl font-bold leading-tight">
                Book Reliable Services in Nepal — Anytime, Anywhere
              </h1>
              <p className="text-xl leading-relaxed text-blue-100 max-w-2xl">
                From home repairs to event planning, find trusted service providers near you with just a few clicks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/services">
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="font-semibold"
                  >
                    Book a Service
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-white hover:text-[#0F62FE] font-semibold"
                  >
                    Become a Provider
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md h-96 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Home size={48} />
                  </div>
                  <p className="text-lg font-medium">Nepal Services</p>
                  <p className="text-sm opacity-80">High-quality illustration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 md:px-8 lg:px-12 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#0B1220] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto">
              Get your services booked in just three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => {
              const IconComponent = step.icon
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#0F62FE]/10 rounded-full flex items-center justify-center group-hover:bg-[#0F62FE]/20 transition-all duration-300">
                    <IconComponent className="text-[#0F62FE]" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0B1220] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#475569] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="px-6 md:px-8 lg:px-12 py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#0B1220] mb-4">
              Popular Service Categories
            </h2>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto">
              Choose from our wide range of professional services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((service, index) => {
              const IconComponent = service.icon
              return (
                <Link key={index} to="/services" className="group">
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-0 bg-white">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 bg-[#0F62FE]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#0F62FE]/20 transition-colors">
                        <IconComponent className="text-[#0F62FE]" size={32} />
                      </div>
                      <h3 className="text-xl font-semibold text-[#0B1220] mb-3">
                        {service.title}
                      </h3>
                      <p className="text-[#475569] leading-relaxed mb-4">
                        {service.desc}
                      </p>
                      <div className="text-[#0F62FE] font-medium group-hover:text-[#0052CC] transition-colors">
                        Learn More →
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="px-6 md:px-8 lg:px-12 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#0B1220] mb-4">
              Why Choose SewaGo?
            </h2>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto">
              We're committed to providing the best service experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((point, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-[#F4AF1B]/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="text-[#F4AF1B]" size={32} />
                </div>
                <p className="text-[#0B1220] font-medium leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 md:px-8 lg:px-12 py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#0B1220] mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto">
              Real experiences from satisfied customers across Nepal
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-white shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#0F62FE]/10 rounded-full flex items-center justify-center mr-4">
                      <Star className="text-[#0F62FE]" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0B1220]">{testimonial.name}</h4>
                      <div className="flex text-[#F4AF1B]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[#475569] leading-relaxed italic">
                    "{testimonial.review}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="px-6 md:px-8 lg:px-12 py-16 bg-gradient-to-r from-[#0F62FE] to-[#0052CC] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Need help today?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Don't wait! Book a trusted service provider now and get your problems solved quickly.
          </p>
          <Link to="/services">
            <Button 
              variant="secondary"
              size="lg" 
              className="font-semibold"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1220] text-white px-6 md:px-8 lg:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/providers" className="text-gray-300 hover:text-white transition-colors">Providers</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Phone size={20} className="mr-3" />
                  <span>+977-1-4XXXXXX</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail size={20} className="mr-3" />
                  <span>info@sewago.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin size={20} className="mr-3" />
                  <span>Kathmandu, Nepal</span>
                </div>
              </div>
            </div>
            
            {/* Social Links */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-[#0F62FE] rounded-full flex items-center justify-center hover:bg-[#0052CC] transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-[#0F62FE] rounded-full flex items-center justify-center hover:bg-[#0052CC] transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-[#0F62FE] rounded-full flex items-center justify-center hover:bg-[#0052CC] transition-colors">
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SewaGo. All rights reserved. Nepal's most trusted service booking platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

