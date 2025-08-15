'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  getServicePromises, 
  getLateCreditPolicy, 
  getCustomerRights, 
  getQualityAssurance,
  ServicePromise 
} from '@/lib/service-promises';
import { formatNPR } from '@/lib/currency';

interface ServicePromisesProps {
  serviceSlug: string;
  className?: string;
  showLateCreditPolicy?: boolean;
  showCustomerRights?: boolean;
  showQualityAssurance?: boolean;
}

export default function ServicePromises({ 
  serviceSlug, 
  className = '',
  showLateCreditPolicy = true,
  showCustomerRights = true,
  showQualityAssurance = true
}: ServicePromisesProps) {
  const promises = getServicePromises(serviceSlug);
  const lateCreditPolicy = getLateCreditPolicy(serviceSlug);
  const customerRights = getCustomerRights(serviceSlug);
  const qualityAssurance = getQualityAssurance(serviceSlug);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'timing': return 'bg-blue-100 text-blue-800';
      case 'quality': return 'bg-green-100 text-green-800';
      case 'safety': return 'bg-orange-100 text-orange-800';
      case 'pricing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'timing': return '⏰';
      case 'quality': return '✨';
      case 'safety': return '🛡️';
      case 'pricing': return '💰';
      default: return '✅';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Service Promises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">🤝</span>
            Our Service Promises
          </CardTitle>
          <CardDescription>
            What you can expect from every SewaGo service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promises.map((promise) => (
              <div key={promise.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-2xl">{promise.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{promise.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={getCategoryColor(promise.category)}
                    >
                      {getCategoryIcon(promise.category)} {promise.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{promise.description}</p>
                  <p className="text-sm font-medium text-primary">{promise.guarantee}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Late Credit Policy */}
      {showLateCreditPolicy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">⏰</span>
              On-Time Guarantee
            </CardTitle>
            <CardDescription>
              We value your time. If we're late, you get a credit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {lateCreditPolicy.creditAmount}% Credit
                </div>
                <div className="text-blue-800">
                  If we're more than {lateCreditPolicy.thresholdMinutes} minutes late
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Maximum credit: {formatNPR(lateCreditPolicy.maxCredit)}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">How it works:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {lateCreditPolicy.conditions.map((condition, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Assurance */}
      {showQualityAssurance && qualityAssurance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">✨</span>
              Quality Assurance
            </CardTitle>
            <CardDescription>
              How we ensure the highest quality standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {qualityAssurance.map((assurance, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{assurance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Rights */}
      {showCustomerRights && customerRights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">⚖️</span>
              Your Rights
            </CardTitle>
            <CardDescription>
              What you're entitled to as a SewaGo customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customerRights.map((right, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                  <div className="text-primary font-semibold text-sm">Right {index + 1}</div>
                  <span className="text-sm text-gray-700">{right}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Indicators */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Why Choose SewaGo?
            </h3>
            <p className="text-gray-600 mb-4">
              We're committed to delivering exceptional service with complete transparency
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-1">✅</div>
                <div className="font-semibold text-gray-900">Verified</div>
                <div className="text-gray-600">Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">⏰</div>
                <div className="font-semibold text-gray-900">On-Time</div>
                <div className="text-gray-600">Guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">💰</div>
                <div className="font-semibold text-gray-900">Fair</div>
                <div className="text-gray-600">Pricing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🛡️</div>
                <div className="font-semibold text-gray-900">Safe</div>
                <div className="text-gray-600">Service</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
