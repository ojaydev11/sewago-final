import { Metadata } from 'next';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
<<<<<<< HEAD
import Image from 'next/image';
=======
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
<<<<<<< HEAD
import { MapPin, Star, Clock, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { getServiceBySlug } from '@/lib/services';
=======
import { Star, Clock, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
import { formatNPR } from '@/lib/currency';
import ServicePromises from '@/components/ServicePromises';
import LateCreditCalculator from '@/components/LateCreditCalculator';

interface ServiceDetailPageProps {
<<<<<<< HEAD
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
=======
  params: Promise<{
    slug: string;
  }>;
}

export function generateMetadata({ params }: ServiceDetailPageProps): Metadata {
  const service = getMockServiceBySlug(params);
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sewago-final.vercel.app';
  
  if (!service) {
    return {
      title: 'Service Not Found - SewaGo',
      alternates: {
<<<<<<< HEAD
        canonical: `${siteUrl}/services/${params.slug}`,
=======
        canonical: `${siteUrl}/services/${params}`,
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      },
    };
  }

  return {
    title: `${service.name} Services in Nepal | SewaGo`,
<<<<<<< HEAD
    description: `${service.shortDesc} - Professional ${service.name.toLowerCase()} services available in Kathmandu, Pokhara, and across Nepal. Book verified providers with SewaGo.`,
    keywords: `${service.name}, ${service.category}, local services, ${service.category.toLowerCase()}, Nepal, Kathmandu, Pokhara`,
    alternates: {
      canonical: `${siteUrl}/services/${params.slug}`,
    },
    openGraph: {
      title: `${service.name} Services in Nepal | SewaGo`,
      description: service.shortDesc,
      url: `${siteUrl}/services/${params.slug}`,
=======
    description: `${service.description} - Professional ${service.name.toLowerCase()} services available in Kathmandu, Pokhara, and across Nepal. Book verified providers with SewaGo.`,
    keywords: `${service.name}, ${service.category}, local services, ${service.category.toLowerCase()}, Nepal, Kathmandu, Pokhara`,
    alternates: {
      canonical: `${siteUrl}/services/${params}`,
    },
    openGraph: {
      title: `${service.name} Services in Nepal | SewaGo`,
      description: service.description,
      url: `${siteUrl}/services/${params}`,
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
      type: 'website',
    },
  };
}

// Revalidate every hour
export const revalidate = 3600;

<<<<<<< HEAD
export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  let service;
  
  try {
    service = await getServiceBySlug(params.slug);
  } catch (error) {
    console.error('Error loading service:', error);
    // Render minimal above-the-fold summary on error
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Service Temporarily Unavailable
            </h1>
            <p className="text-gray-600 mb-4">
              We're experiencing technical difficulties. Please try again later.
            </p>
            <Link 
              href="/services" 
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Other Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

=======
// Mock service data for frontend-only mode
function getMockServiceBySlug(slug: any) {
  const mockServices = [
    {
      id: 1,
      name: 'House Cleaning',
      slug: 'house-cleaning',
      description: 'Professional house cleaning services for homes and offices across Nepal',
      category: 'Cleaning',
      basePrice: 1500,
      rating: 4.8,
      reviewCount: 127,
      features: ['Deep cleaning', 'Eco-friendly products', 'Flexible scheduling'],
      image: '/images/services/cleaning.jpg'
    },
    {
      id: 2,
      name: 'Plumbing',
      slug: 'plumbing',
      description: 'Expert plumbing and repair services for residential and commercial properties',
      category: 'Repair',
      basePrice: 2000,
      rating: 4.9,
      reviewCount: 89,
      features: ['24/7 emergency service', 'Licensed plumbers', 'Warranty included'],
      image: '/images/services/plumbing.jpg'
    },
    {
      id: 3,
      name: 'Electrical',
      slug: 'electrical',
      description: 'Certified electrical work and repairs by licensed professionals',
      category: 'Repair',
      basePrice: 2500,
      rating: 4.7,
      reviewCount: 156,
      features: ['Safety certified', 'Modern equipment', 'Code compliant'],
      image: '/images/services/electrical.jpg'
    }
  ];
  
  return mockServices.find(s => s.slug === slug) || mockServices[0];
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const service = getMockServiceBySlug(params);
  
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
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

<<<<<<< HEAD
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
                    {formatNPR(service.basePrice)}
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
=======
      {/* Service Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Service Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3">
                  {service.category}
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {service.name}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(service.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900 ml-2">
                    {service.rating}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({service.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    Starting from {formatNPR(service.basePrice)}
                  </div>
                  <p className="text-gray-600">Base price for standard service</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1">
                  Book Now
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  Get Quote
                </Button>
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
              </div>
            </div>

            {/* Service Image */}
<<<<<<< HEAD
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

          {/* Service Promises & Guarantees */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <ServicePromises serviceSlug={slug} />
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
                    From Rs {service.basePrice}
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

            {/* Late Credit Calculator */}
            <Card className="mt-6">
              <LateCreditCalculator 
                serviceSlug={slug} 
                basePrice={service.basePrice} 
              />
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
=======
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-6xl">{service.slug === 'house-cleaning' ? '🧹' : service.slug === 'plumbing' ? '🔧' : '⚡'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Features */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            What's Included
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {service.features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Promises */}
      <ServicePromises serviceSlug={service.slug} />

      {/* Late Credit Calculator */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <LateCreditCalculator serviceSlug={service.slug} basePrice={service.basePrice} />
>>>>>>> d7ae416fad47e198a4cbb3bc4d0928f6cb7c7245
        </div>
      </div>
    </div>
  );
}
