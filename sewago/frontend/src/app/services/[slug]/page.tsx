'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Star, 
  Clock, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  Phone,
  MessageSquare
} from 'lucide-react';

interface Service {
  _id: string;
  slug: string;
  name: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  basePrice: number;
  image?: string;
  active: boolean;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const slug = params.slug as string;

  useEffect(() => {
    fetchService();
  }, [slug]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setService(data.service);
      } else {
        setError('Service not found');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to load service');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Service Not Found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The service you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/services">
              <Button>
                Browse All Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Service Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{service.category}</Badge>
                <span className="text-sm text-gray-500">•</span>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.8+ rating</span>
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {service.name}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {service.shortDesc}
              </p>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>Available in your area</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Quick response</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Shield className="w-5 h-5 mr-2" />
                  <span>Verified providers</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/book?service=${service.slug}`}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8 text-lg">
                    Book This Service
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Service Image */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-4xl font-bold">
                        {service.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-gray-500">Service Image</p>
                  </div>
                )}
              </div>
              
              {/* Price Badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full shadow-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="text-2xl font-bold text-primary">₹{service.basePrice}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">About This Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {service.longDesc}
                    </p>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      What's Included
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Professional service delivery
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Quality assurance guarantee
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Verified and background-checked providers
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Customer support throughout the process
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/book?service=${service.slug}`}>
                    <Button className="w-full" size="lg">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full" size="lg">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask Questions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              {/* Service Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{service.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium text-primary">₹{service.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium">Within 2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className="font-medium text-green-600">Available</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Why Choose SewaGo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Choose SewaGo?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Shield className="w-4 h-4 text-green-500 mr-2" />
                    <span>Verified providers</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-400 mr-2" />
                    <span>Quality guaranteed</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <span>Quick response</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Customer support</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Book {service.name}?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get started with just a few clicks. Our verified professionals are ready to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/book?service=${service.slug}`}>
              <Button size="lg" className="bg-accent-saffron hover:bg-accent-saffron/90 text-gray-900 h-12 px-8 text-lg">
                Book Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 h-12 px-8 text-lg">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
