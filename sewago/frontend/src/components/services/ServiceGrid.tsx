'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Clock } from 'lucide-react';
import { IService } from '@/models/Service';

interface ServiceGridProps {
  services: IService[];
}

export default function ServiceGrid({ services }: ServiceGridProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No services available
        </h3>
        <p className="text-gray-600">
          Check back later for new services
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service._id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          {/* Service Image */}
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            {service.image ? (
              <Image
                src={service.image}
                alt={service.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-4xl text-gray-400">
                  {service.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                {service.category}
              </Badge>
            </div>
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {service.isVerified && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Verified
                  </Badge>
                )}
                {service.hasWarranty && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    Warranty
                  </Badge>
                )}
              </div>
              <span className="text-lg font-semibold text-primary">
                From ₹{service.basePrice}
              </span>
            </div>
            
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {service.name}
            </CardTitle>
            
            <CardDescription className="text-gray-600 line-clamp-2">
              {service.shortDesc}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Service Stats */}
            <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Available in your area</span>
              </div>
              {service.reviewStats && service.reviewStats.totalReviews > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                  <span>{service.reviewStats.averageRating.toFixed(1)}+</span>
                  <span className="ml-1">({service.reviewStats.totalReviews})</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/services/${service.slug}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
              <Link href={`/services/${service.slug}/book`} className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Book Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
