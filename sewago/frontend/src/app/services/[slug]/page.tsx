import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star, Clock, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { getServiceBySlug } from '@/lib/services';

interface ServiceDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  
  if (!service) {
    return {
      title: 'Service Not Found - SewaGo',
    };
  }

  return {
    title: `${service.name} - SewaGo`,
    description: service.shortDesc,
    keywords: `${service.name}, ${service.category}, local services, ${service.category.toLowerCase()}`,
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/services" 
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary">{service.category}</Badge>
                    {service.isVerified && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Verified Service
                      </Badge>
                    )}
                    {service.hasWarranty && (
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {service.warrantyDays} Day Warranty
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h1>
                  <p className="text-xl text-gray-600">
                    {service.shortDesc}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary mb-1">
                    From ₹{service.basePrice}
                  </div>
                  <div className="text-sm text-gray-500">Starting price</div>
                </div>
              </div>

              {/* Service Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {service.reviewStats?.averageRating?.toFixed(1) || '4.8'}
                  </div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {service.reviewStats?.totalReviews || '50+'}
                  </div>
                  <div className="text-sm text-gray-500">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24h</div>
                  <div className="text-sm text-gray-500">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-500">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Service Image */}
            {service.image && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="relative h-96 overflow-hidden rounded-lg">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Service Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                About This Service
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {service.longDesc}
                </p>
              </div>
            </div>

            {/* Service Features */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What's Included
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Professional service provider</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Quality guaranteed work</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">On-time service delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Customer support</span>
                </div>
                {service.hasWarranty && (
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">{service.warrantyDays} day warranty</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Book This Service</CardTitle>
                <CardDescription>
                  Get started with your booking in just a few steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    From ₹{service.basePrice}
                  </div>
                  <div className="text-sm text-gray-500">Starting price</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Quick booking process</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Available in your area</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Star className="h-4 w-4" />
                    <span>Verified professionals</span>
                  </div>
                </div>

                <Link href={`/services/${service.slug}/book`} className="w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-lg py-3">
                    Book Now
                  </Button>
                </Link>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    No booking fees • Cancel anytime • Secure payment
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
                <CardDescription>
                  Have questions about this service?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/contact" className="w-full">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
