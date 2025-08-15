'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Award, 
  CheckCircle, 
  Users, 
  Globe, 
  Lock, 
  Star,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';

interface TrustIndicator {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  stats?: {
    value: string;
    label: string;
  };
}

interface TrustIndicatorsProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function TrustIndicators({ 
  className = '', 
  variant = 'default' 
}: TrustIndicatorsProps) {
  const indicators: TrustIndicator[] = [
    {
      id: 'verified-providers',
      title: '100% Verified Providers',
      description: 'Every provider is background-checked, licensed, and insured',
      icon: <Shield className="h-6 w-6" />,
      color: 'text-green-600',
      badge: 'Verified',
      stats: {
        value: '500+',
        label: 'Providers'
      }
    },
    {
      id: 'safety-first',
      title: 'Safety First Policy',
      description: 'Comprehensive safety protocols and insurance coverage',
      icon: <Lock className="h-6 w-6" />,
      color: 'text-blue-600',
      badge: 'Safe',
      stats: {
        value: '100%',
        label: 'Covered'
      }
    },
    {
      id: 'quality-guarantee',
      title: 'Quality Guarantee',
      description: 'Satisfaction guaranteed or we\'ll fix it for free',
      icon: <Award className="h-6 w-6" />,
      color: 'text-yellow-600',
      badge: 'Guaranteed',
      stats: {
        value: '99%',
        label: 'Satisfaction'
      }
    },
    {
      id: 'on-time-service',
      title: 'On-Time Guarantee',
      description: 'We value your time with our punctuality commitment',
      icon: <Clock className="h-6 w-6" />,
      color: 'text-orange-600',
      badge: 'On-Time',
      stats: {
        value: '95%',
        label: 'On-Time'
      }
    },
    {
      id: 'customer-support',
      title: '24/7 Support',
      description: 'Round-the-clock customer support and emergency services',
      icon: <Users className="h-6 w-6" />,
      color: 'text-purple-600',
      badge: '24/7',
      stats: {
        value: '<15min',
        label: 'Response'
      }
    },
    {
      id: 'nepal-wide',
      title: 'Nepal-Wide Coverage',
      description: 'Serving customers across all major cities and districts',
      icon: <Globe className="h-6 w-6" />,
      color: 'text-emerald-600',
      badge: 'Nationwide',
      stats: {
        value: '15+',
        label: 'Cities'
      }
    }
  ];

  const renderCompact = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {indicators.map((indicator) => (
        <Card key={indicator.id} className="text-center hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className={`mx-auto mb-2 ${indicator.color}`}>
              {indicator.icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {indicator.title}
            </h3>
            {indicator.badge && (
              <Badge variant="secondary" className="text-xs">
                {indicator.badge}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDefault = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {indicators.map((indicator) => (
        <Card key={indicator.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`${indicator.color} flex-shrink-0`}>
                {indicator.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {indicator.title}
                  </h3>
                  {indicator.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {indicator.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-3">
                  {indicator.description}
                </p>
                {indicator.stats && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-primary">
                      {indicator.stats.value}
                    </span>
                    <span className="text-gray-500">
                      {indicator.stats.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDetailed = () => (
    <div className="space-y-8">
      {indicators.map((indicator) => (
        <Card key={indicator.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className={`${indicator.color} flex-shrink-0`}>
                {indicator.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {indicator.title}
                  </h3>
                  {indicator.badge && (
                    <Badge variant="secondary" className="px-3 py-1">
                      {indicator.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  {indicator.description}
                </p>
                {indicator.stats && (
                  <div className="bg-gray-50 rounded-lg p-4 inline-block">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {indicator.stats.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {indicator.stats.label}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Trust SewaGo?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've built our reputation on trust, safety, and quality. 
            Here's what makes us the most trusted service platform in Nepal.
          </p>
        </div>

        {/* Trust Indicators */}
        {variant === 'compact' && renderCompact()}
        {variant === 'default' && renderDefault()}
        {variant === 'detailed' && renderDetailed()}

        {/* Additional Trust Elements */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted by Leading Organizations
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We partner with government agencies, insurance companies, and leading 
              businesses to ensure the highest standards of service and safety.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">Government</div>
                <div className="text-xs text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">Insurance</div>
                <div className="text-xs text-gray-600">Covered</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">Quality</div>
                <div className="text-xs text-gray-600">Certified</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">Growth</div>
                <div className="text-xs text-gray-600">Partner</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                🏛️ Government Approved
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                🛡️ Fully Insured
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                ✅ Quality Certified
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                📈 Growing Partner
              </Badge>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 mb-4">
            Experience the SewaGo difference today
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              ⚡ Quick Booking
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              💰 Transparent Pricing
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              🛡️ Safety Guaranteed
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              ⏰ On-Time Service
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
