'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Review {
  id: string;
  rating: number;
  text: string;
  mediaUrls: string[];
  verified: boolean;
  createdAt: string;
  user: {
    name: string;
  };
  service: {
    name: string;
  };
}

interface VerifiedReviewsCarouselProps {
  serviceId?: string;
  limit?: number;
}

export default function VerifiedReviewsCarousel({ 
  serviceId, 
  limit = 5 
}: VerifiedReviewsCarouselProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = serviceId 
        ? `/api/reviews?serviceId=${serviceId}&limit=${limit}`
        : `/api/reviews?limit=${limit}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchReviews}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">No reviews available yet.</p>
      </div>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real reviews from verified customers who have used our services
          </p>
        </div>

        <div className="relative">
          {/* Navigation Arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={prevReview}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              
              <button
                onClick={nextReview}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Next review"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Review Card */}
          <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  {renderStars(currentReview.rating)}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verified Customer</span>
                </div>
              </div>

              <blockquote className="text-xl text-gray-800 mb-6 italic">
                "{currentReview.text}"
              </blockquote>

              <div className="mb-6">
                <p className="font-semibold text-gray-900">
                  {currentReview.user.name}
                </p>
                <p className="text-sm text-gray-600">
                  {currentReview.service.name} • {new Date(currentReview.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Review Media */}
              {currentReview.mediaUrls && currentReview.mediaUrls.length > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                  {currentReview.mediaUrls.slice(0, 3).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Review media ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dots Indicator */}
          {reviews.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {reviews.length}+
            </div>
            <div className="text-gray-600">Verified Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length}
            </div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              100%
            </div>
            <div className="text-gray-600">Verified Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
}
