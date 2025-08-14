import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Shield, Clock, Users } from 'lucide-react';
import { getServices } from '@/lib/services';

export const metadata: Metadata = {
  title: 'Pricing - SewaGo',
  description: 'Transparent pricing for all our local services. No hidden fees, quality guaranteed.',
  keywords: 'pricing, service costs, transparent pricing, local services, Nepal',
};

export const revalidate = 3600; // Revalidate every hour

export default async function PricingPage() {
  const services = await getServices();

  const features = [
    'Verified service providers',
    'Quality guaranteed work',
    '24/7 customer support',
    'Secure payment processing',
    'No hidden fees',
    'Easy cancellation',
    'Professional equipment',
    'Insured services'
  ];

  const benefits = [
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'All our providers are verified and quality-checked'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your safety and security are our top priorities'
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Get service providers at your doorstep within hours'
    },
    {
      icon: Users,
      title: 'Local Experts',
      description: 'Connect with experienced local professionals'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              No hidden fees, no surprises. Get quality local services at fair, 
              transparent prices. All our providers are verified professionals.
            </p>
            
            {/* Pricing Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 mb-8">
              <span className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm">
                One-time Service
              </span>
              <span className="px-4 py-2 text-sm font-medium text-gray-500">
                Subscription Plans
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Pricing Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Service Pricing
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">
            Choose from our wide range of professional services. Prices start from the base rates shown below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service) => (
            <Card key={service._id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">{service.name.charAt(0)}</span>
                </div>
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {service.shortDesc}
                </CardDescription>
                <div className="pt-4">
                  <span className="text-3xl font-bold text-primary">
                    From ₹{service.basePrice}
                  </span>
                  <p className="text-sm text-gray-500">Starting price</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Professional service</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Quality guaranteed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Verified provider</span>
                  </div>
                  {service.hasWarranty && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{service.warrantyDays} day warranty</span>
                    </div>
                  )}
                </div>

                <Link href={`/services/${service.slug}/book`} className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Book Now
                  </Button>
                </Link>

                <Link href={`/services/${service.slug}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose SewaGo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* All Features List */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What's Included in Every Service
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Book your first service today and experience the SewaGo difference
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
                Browse All Services
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

