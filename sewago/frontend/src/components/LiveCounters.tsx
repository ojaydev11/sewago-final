'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Star, MapPin, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface CounterMetric {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

interface LiveCountersProps {
  className?: string;
  showAnimation?: boolean;
}

export default function LiveCounters({ className = '', showAnimation = true }: LiveCountersProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isVisible, setIsVisible] = useState(false);

  const metrics: CounterMetric[] = useMemo(() => [
    {
      id: 'totalServices',
      label: 'Services Completed',
      value: 15420,
      suffix: '+',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      description: 'Professional services delivered'
    },
    {
      id: 'happyCustomers',
      label: 'Happy Customers',
      value: 12850,
      suffix: '+',
      icon: <Users className="h-6 w-6" />,
      color: 'text-blue-600',
      description: 'Satisfied customers served'
    },
    {
      id: 'averageRating',
      label: 'Average Rating',
      value: 48,
      suffix: '/5',
      icon: <Star className="h-6 w-6" />,
      color: 'text-yellow-600',
      description: 'Customer satisfaction score'
    },
    {
      id: 'citiesServed',
      label: 'Cities Served',
      value: 15,
      suffix: '+',
      icon: <MapPin className="h-6 w-6" />,
      color: 'text-purple-600',
      description: 'Nepal-wide coverage'
    },
    {
      id: 'responseTime',
      label: 'Response Time',
      value: 15,
      suffix: ' min',
      icon: <Clock className="h-6 w-6" />,
      color: 'text-orange-600',
      description: 'Average response time'
    },
    {
      id: 'growthRate',
      label: 'Monthly Growth',
      value: 25,
      suffix: '%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-emerald-600',
      description: 'Platform expansion rate'
    }
  ], []);

  // Intersection Observer to trigger animation when component is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('live-counters');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Animate counters when visible
  useEffect(() => {
    if (!isVisible || !showAnimation) return;

    const duration = 2000; // 2 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;

    const animations = metrics.map((metric) => {
      const targetValue = metric.value;
      const increment = targetValue / steps;
      let currentValue = 0;

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(timer);
        }

        setCounts(prev => ({
          ...prev,
          [metric.id]: Math.floor(currentValue)
        }));
      }, interval);

      return timer;
    });

    return () => {
      animations.forEach(timer => clearInterval(timer));
    };
  }, [isVisible, showAnimation, metrics]);

  // Initialize counts if no animation
  useEffect(() => {
    if (!showAnimation) {
      const initialCounts = metrics.reduce((acc, metric) => {
        acc[metric.id] = metric.value;
        return acc;
      }, {} as Record<string, number>);
      setCounts(initialCounts);
    }
  }, [showAnimation, metrics]);

  return (
    <div id="live-counters" className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands Across Nepal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our numbers speak for themselves. Join thousands of satisfied customers 
            who trust SewaGo for their home and office service needs.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.id} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className={`mx-auto mb-3 ${metric.color}`}>
                  {metric.icon}
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {metric.prefix || ''}
                    {counts[metric.id] || 0}
                    {metric.suffix || ''}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {metric.label}
                </h3>
                {metric.description && (
                  <p className="text-xs text-gray-500">
                    {metric.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 bg-white rounded-full px-8 py-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Updates</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Real-time Data</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Verified Metrics</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-600 mb-4">
            Join our growing community of satisfied customers
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              ✅ 100% Verified Providers
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              ⏰ On-Time Guarantee
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              💰 Transparent Pricing
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              🛡️ Safety First
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
