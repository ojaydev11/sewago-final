'use client';

import React, { useState } from 'react';
import { ServiceBundle } from '@/models/ServiceBundle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star, CheckCircle, Gift, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { formatNPR } from '@/lib/currency';

interface ServiceBundleCardProps {
  bundle: ServiceBundle;
  onSelect?: (bundle: ServiceBundle, services: any[]) => void;
  isSelected?: boolean;
}

export default function ServiceBundleCard({ 
  bundle, 
  onSelect, 
  isSelected = false
}: ServiceBundleCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate derived values
  const savings = bundle.originalPrice - bundle.discountedPrice;
  const savingsPercentage = bundle.discountPercentage;
  const totalDuration = bundle.services.reduce((sum, service) => sum + service.estimatedDuration, 0);

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{bundle.name}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {bundle.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatNPR(bundle.discountedPrice)}
              </div>
              <div className="text-sm text-gray-500 line-through">
                {formatNPR(bundle.originalPrice)}
              </div>
              <div className="text-sm font-semibold text-green-600">
                Save {formatNPR(savings)} ({savingsPercentage}%)
              </div>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {bundle.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Services Included */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            Services Included ({bundle.services.length})
          </h4>
          <div className="space-y-2">
            {bundle.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{service.serviceName}</span>
                <span className="text-gray-500">
                  {service.estimatedDuration} min
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bundle Details */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Total Duration:</span>
              <span className="font-medium">{totalDuration} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Services:</span>
              <span className="font-medium">{bundle.services.length}</span>
            </div>
          </div>
        </div>

        {/* Bundle Benefits */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Gift className="h-4 w-4 text-green-500" />
            Bundle Benefits
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Save {savingsPercentage}% compared to individual services</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Convenient package booking</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Priority scheduling</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            onClick={() => onSelect?.(bundle, bundle.services)}
            disabled={!bundle.isActive}
          >
            {isSelected ? 'Selected' : 'Book This Bundle'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(!showDetails)}
            className="px-3"
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Additional Details (Expandable) */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium capitalize">{bundle.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">{bundle.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Bundle Details</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                This bundle includes {bundle.services.length} services with a total value of ₹{bundle.originalPrice.toLocaleString()}.
              </p>
            </div>
          </div>
        )}

        {/* Unavailable Notice */}
        {!bundle.isActive && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Bundle Unavailable</span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              This bundle is currently not available for booking.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
