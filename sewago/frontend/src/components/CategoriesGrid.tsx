'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNPR } from '@/lib/currency';
import { 
  Wrench, 
  Zap, 
  Droplets, 
  Home, 
  Car, 
  Leaf, 
  Shield, 
  Sparkles 
} from 'lucide-react';
import Link from 'next/link';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  slug: string;
  basePrice: number;
  responseTime: string;
  isPopular?: boolean;
  isNew?: boolean;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Expert plumbing services for homes and offices',
    icon: <Droplets className="w-8 h-8" />,
    slug: 'plumbing',
    basePrice: 599,
    responseTime: '30 min',
    isPopular: true
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Professional electrical work and safety checks',
    icon: <Zap className="w-8 h-8" />,
    slug: 'electrical',
    basePrice: 599,
    responseTime: '30 min',
    isPopular: true
  },
  {
    id: 'cleaning',
    name: 'House Cleaning',
    description: 'Deep cleaning and maintenance services',
    icon: <Home className="w-8 h-8" />,
    slug: 'house-cleaning',
    basePrice: 1999,
    responseTime: '60 min',
    isPopular: true
  },
  {
    id: 'ac-service',
    name: 'AC Service',
    description: 'AC installation, repair, and maintenance',
    icon: <Sparkles className="w-8 h-8" />,
    slug: 'ac-service',
    basePrice: 1499,
    responseTime: '45 min',
    isNew: true
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Custom woodwork and furniture repair',
    icon: <Wrench className="w-8 h-8" />,
    slug: 'carpentry',
    basePrice: 799,
    responseTime: '60 min'
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Effective pest elimination and prevention',
    icon: <Shield className="w-8 h-8" />,
    slug: 'pest-control',
    basePrice: 1999,
    responseTime: '90 min'
  },
  {
    id: 'gardening',
    name: 'Gardening',
    description: 'Landscaping and garden maintenance',
    icon: <Leaf className="w-8 h-8" />,
    slug: 'gardening',
    basePrice: 899,
    responseTime: '120 min'
  },
  {
    id: 'car-service',
    name: 'Car Service',
    description: 'Automotive maintenance and repair',
    icon: <Car className="w-8 h-8" />,
    slug: 'car-service',
    basePrice: 1299,
    responseTime: '60 min'
  }
];

export default function CategoriesGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Service Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Quick access to the most requested services in your area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceCategories.map((category) => (
            <Link key={category.id} href={`/services/${category.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300">
                <CardContent className="p-6 text-center">
                  {/* Icon */}
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>

                  {/* Category Info */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Price and Response Time */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-gray-500">From</span>
                      <span className="font-semibold text-green-600">
                        {formatNPR(category.basePrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <span>Response:</span>
                      <span className="font-medium">{category.responseTime}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex justify-center gap-2 mt-4">
                    {category.isPopular && (
                      <Badge variant="default" className="bg-orange-100 text-orange-800 text-xs">
                        Popular
                      </Badge>
                    )}
                    {category.isNew && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        New
                      </Badge>
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-blue-600 text-sm font-medium">
                      Book Now →
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Services CTA */}
        <div className="text-center mt-12">
          <Link 
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            View All Services
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
