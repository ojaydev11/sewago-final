import { Metadata } from 'next';

// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { formatNPR } from '@/lib/currency';
import ServicePromises from '@/components/ServicePromises';
import LateCreditCalculator from '@/components/LateCreditCalculator';

interface ServiceDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateMetadata({ params }: ServiceDetailPageProps): Metadata {
  const service = getMockServiceBySlug(params);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sewago-final.vercel.app';
  
  if (!service) {
    return {
      title: 'Service Not Found - SewaGo',
      alternates: {
        canonical: `${siteUrl}/services/${params}`,
      },
    };
  }

  return {
    title: `${service.name} Services in Nepal | SewaGo`,
    description: `${service.description} - Professional ${service.name.toLowerCase()} services available in Kathmandu, Pokhara, and across Nepal. Book verified providers with SewaGo.`,
    keywords: `${service.name}, ${service.category}, local services, ${service.category.toLowerCase()}, Nepal, Kathmandu, Pokhara`,
    alternates: {
      canonical: `${siteUrl}/services/${params}`,
    },
    openGraph: {
      title: `${service.name} Services in Nepal | SewaGo`,
      description: service.description,
      url: `${siteUrl}/services/${params}`,
      type: 'website',
    },
  };
}

// Revalidate every hour
export const revalidate = 3600;

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
              </div>
            </div>

            {/* Service Image */}
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
        </div>
      </div>
    </div>
  );
}
