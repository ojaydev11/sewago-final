import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Star, 
  Shield, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Heart,
  Zap,
  Award
} from 'lucide-react';

export default function HomePage() {
  const popularServices = [
    {
      name: "House Cleaning",
      description: "Professional cleaning services for your home",
      icon: "🧹",
      href: "/services/house-cleaning",
      price: "From ₹500"
    },
    {
      name: "Electrical Work",
      description: "Certified electricians for all electrical needs",
      icon: "⚡",
      href: "/services/electrical-work",
      price: "From ₹800"
    },
    {
      name: "Gardening",
      description: "Expert gardeners and landscaping services",
      icon: "🌱",
      href: "/services/gardening",
      price: "From ₹600"
    },
    {
      name: "Moving & Packing",
      description: "Reliable moving and packing services",
      icon: "📦",
      href: "/services/moving",
      price: "From ₹1500"
    },
    {
      name: "Plumbing",
      description: "Professional plumbing and repair services",
      icon: "🔧",
      href: "/services/plumbing",
      price: "From ₹700"
    },
    {
      name: "Painting",
      description: "Interior and exterior painting services",
      icon: "🎨",
      href: "/services/painting",
      price: "From ₹1000"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Search & Choose",
      description: "Browse our verified service providers and select the one that fits your needs",
      icon: Search
    },
    {
      step: "2",
      title: "Book & Schedule",
      description: "Book your preferred service and choose a convenient time slot",
      icon: Clock
    },
    {
      step: "3",
      title: "Get Service Done",
      description: "Our professionals will deliver quality service at your doorstep",
      icon: CheckCircle
    }
  ];

  const testimonials = [
    {
      name: "Ram Bahadur",
      location: "Kathmandu",
      rating: 5,
      comment: "Excellent service! The electrician was professional and completed the work quickly.",
      service: "Electrical Work"
    },
    {
      name: "Sita Devi",
      location: "Lalitpur",
      rating: 5,
      comment: "House cleaning service was outstanding. My home looks brand new!",
      service: "House Cleaning"
    },
    {
      name: "Hari Kumar",
      location: "Bhaktapur",
      rating: 5,
      comment: "Great gardening service. The team was knowledgeable and hardworking.",
      service: "Gardening"
    }
  ];

  const districts = [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Kirtipur", "Madhyapur Thimi",
    "Banepa", "Dhulikhel", "Panauti", "Dakshinkali", "Shankharapur"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Nepal's Premier Service Platform
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              Reliable Services for
              <span className="block text-accent-saffron">Every Home in Nepal</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Connect with verified local service providers for cleaning, electrical work, 
              gardening, and more. Quality services, trusted professionals.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="What service do you need?"
                    className="pl-10 h-12 text-lg border-0 shadow-lg"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Enter your district"
                    className="pl-10 h-12 text-lg border-0 shadow-lg"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="bg-accent-saffron hover:bg-accent-saffron/90 text-gray-900 h-12 px-8 text-lg">
                  Book Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/provider/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 h-12 px-8 text-lg">
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular <span className="text-primary">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most requested services from verified professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularServices.map((service) => (
              <Card key={service.name} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg font-semibold text-primary mb-4">{service.price}</p>
                  <Link href={service.href}>
                    <Button className="w-full group-hover:bg-primary group-hover:text-white">
                      Book Service
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with SewaGo in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                    {step.step}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-saffron rounded-full flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-gray-900" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our <span className="text-primary">Customers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real feedback from satisfied customers across Nepal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-gray-600 italic">
                    "{testimonial.comment}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  <Badge variant="secondary" className="mt-2">
                    {testimonial.service}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* District Coverage */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Service <span className="text-primary">Coverage</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're expanding our services across Nepal. Check if we're available in your district.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {districts.map((district) => (
              <div key={district} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-primary hover:text-white transition-colors cursor-pointer">
                <MapPin className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{district}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Don't see your district? We're expanding rapidly!
            </p>
            <Link href="/contact">
              <Button variant="outline">
                Request Coverage
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust SewaGo for their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="bg-accent-saffron hover:bg-accent-saffron/90 text-gray-900 h-12 px-8 text-lg">
                Book Your First Service
              </Button>
            </Link>
            <Link href="/provider/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 h-12 px-8 text-lg">
                Join as Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
