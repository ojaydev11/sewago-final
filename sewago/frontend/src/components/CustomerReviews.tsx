'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Quote, ThumbsUp, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { formatNPR } from '@/lib/currency';

interface CustomerReview {
  id: string;
  customerName: string;
  customerLocation: string;
  serviceType: string;
  serviceDate: string;
  rating: number;
  review: string;
  servicePrice: number;
  providerName: string;
  isVerified: boolean;
  helpfulCount: number;
  responseCount: number;
  tags: string[];
}

interface CustomerReviewsProps {
  className?: string;
  maxReviews?: number;
  showServiceDetails?: boolean;
  autoRotate?: boolean;
}

export default function CustomerReviews({ 
  className = '', 
  maxReviews = 6,
  showServiceDetails = true,
  autoRotate = true
}: CustomerReviewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);

  const reviews: CustomerReview[] = [
    {
      id: '1',
      customerName: 'Priya Sharma',
      customerLocation: 'Thamel, Kathmandu',
      serviceType: 'House Cleaning',
      serviceDate: '2024-01-15',
      rating: 5,
      review: 'Excellent service! The cleaning team was professional, punctual, and thorough. My apartment looks spotless. Highly recommend SewaGo for anyone needing reliable cleaning services.',
      servicePrice: 1200,
      providerName: 'CleanPro Team',
      isVerified: true,
      helpfulCount: 24,
      responseCount: 2,
      tags: ['Professional', 'Punctual', 'Thorough']
    },
    {
      id: '2',
      customerName: 'Rajesh Kumar',
      customerLocation: 'Baneshwor, Kathmandu',
      serviceType: 'Electrical Work',
      serviceDate: '2024-01-14',
      rating: 5,
      review: 'Outstanding electrical repair service. The electrician was licensed, knowledgeable, and fixed our wiring issues quickly and safely. Great value for money!',
      servicePrice: 2500,
      providerName: 'ElectroTech Solutions',
      isVerified: true,
      helpfulCount: 18,
      responseCount: 1,
      tags: ['Licensed', 'Safe', 'Quick']
    },
    {
      id: '3',
      customerName: 'Sunita Tamang',
      customerLocation: 'Lalitpur',
      serviceType: 'Plumbing',
      serviceDate: '2024-01-13',
      rating: 4,
      review: 'Very good plumbing service. The plumber arrived on time and fixed our leaky faucet efficiently. Professional work and reasonable pricing.',
      servicePrice: 1800,
      providerName: 'PlumbRight Services',
      isVerified: true,
      helpfulCount: 15,
      responseCount: 0,
      tags: ['On-time', 'Efficient', 'Professional']
    },
    {
      id: '4',
      customerName: 'Amit Patel',
      customerLocation: 'Bhaktapur',
      serviceType: 'House Cleaning',
      serviceDate: '2024-01-12',
      rating: 5,
      review: 'Amazing cleaning service! The team was incredibly thorough and used eco-friendly products. My house has never looked better. Will definitely book again!',
      servicePrice: 1500,
      providerName: 'EcoClean Team',
      isVerified: true,
      helpfulCount: 31,
      responseCount: 3,
      tags: ['Eco-friendly', 'Thorough', 'Amazing']
    },
    {
      id: '5',
      customerName: 'Lakshmi Devi',
      customerLocation: 'Patan, Lalitpur',
      serviceType: 'Electrical Work',
      serviceDate: '2024-01-11',
      rating: 5,
      review: 'Exceptional electrical installation service. The electrician was professional, explained everything clearly, and completed the work perfectly. Highly satisfied!',
      servicePrice: 3200,
      providerName: 'PowerPro Electric',
      isVerified: true,
      helpfulCount: 22,
      responseCount: 1,
      tags: ['Professional', 'Clear Communication', 'Perfect']
    },
    {
      id: '6',
      customerName: 'Bikash Thapa',
      customerLocation: 'Kirtipur',
      serviceType: 'Plumbing',
      serviceDate: '2024-01-10',
      rating: 4,
      review: 'Good plumbing repair service. The plumber was skilled and fixed our drainage issue effectively. Fair pricing and good workmanship.',
      servicePrice: 2200,
      providerName: 'DrainMaster Pro',
      isVerified: true,
      helpfulCount: 12,
      responseCount: 0,
      tags: ['Skilled', 'Effective', 'Fair Pricing']
    }
  ];

  const displayedReviews = reviews.slice(0, maxReviews);

  // Auto-rotate reviews
  useEffect(() => {
    if (!isAutoRotating || displayedReviews.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (displayedReviews.length - 2));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRotating, displayedReviews.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? displayedReviews.length - 3 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev === displayedReviews.length - 3 ? 0 : prev + 1
    );
  };

  const toggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`py-12 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real reviews from real customers who have experienced our services. 
            Join thousands of satisfied customers across Nepal.
          </p>
          
          {/* Overall Rating */}
          <div className="mt-6 inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-sm">
            <div className="flex items-center gap-1">
              {renderStars(5)}
            </div>
            <span className="text-lg font-semibold text-gray-900">4.8</span>
            <span className="text-gray-600">out of 5</span>
            <Badge variant="secondary" className="ml-2">
              {reviews.length}+ Reviews
            </Badge>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedReviews.slice(currentIndex, currentIndex + 3).map((review) => (
            <Card key={review.id} className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {review.customerName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3" />
                      {review.customerLocation}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.serviceDate)}
                    </span>
                  </div>
                </div>
                
                {showServiceDetails && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium text-gray-900">{review.serviceType}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Provider:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900">{review.providerName}</span>
                        {review.isVerified && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            ✅ Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-primary">{formatNPR(review.servicePrice)}</span>
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="mb-4">
                  <Quote className="h-4 w-4 text-gray-400 mb-2" />
                  <p className="text-gray-700 leading-relaxed">{review.review}</p>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Engagement */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{review.helpfulCount}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{review.responseCount}</span>
                    </div>
                  </div>
                  <Calendar className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Controls */}
        {displayedReviews.length > 3 && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="px-4 py-2"
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(displayedReviews.length - 2) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={handleNext}
              className="px-4 py-2"
            >
              Next
            </Button>
            
            <Button
              variant="ghost"
              onClick={toggleAutoRotate}
              className="text-sm"
            >
              {isAutoRotating ? 'Pause' : 'Auto-play'}
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Ready to experience our services?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-primary hover:bg-primary/90">
              Book a Service
            </Button>
            <Button variant="outline">
              Read More Reviews
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
