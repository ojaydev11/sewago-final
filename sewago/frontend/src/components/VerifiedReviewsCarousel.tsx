'use client';

import { useState, useEffect } from 'react';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  photo?: string;
  verified: boolean;
  service: string;
  date: string;
}

export function VerifiedReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchReviews = async () => {
    try {
      setError(null);
      const response = await fetch('/api/reviews?limit=10&verified=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const result = await response.json();
      setReviews(result.data.reviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToReview = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
              <div className="h-32 bg-gray-200 rounded-lg w-full max-w-2xl mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) {
    return (
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>Unable to load reviews</p>
            <button
              onClick={fetchReviews}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verified reviews from real customers who have used our services
          </p>
        </div>

        {/* Review Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Previous review"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>

          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Next review"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>

          {/* Review Content */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center">
              {/* Rating Stars */}
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-6 w-6 ${
                      i < currentReview.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <blockquote className="text-lg md:text-xl text-gray-700 mb-6 italic">
                "{currentReview.text}"
              </blockquote>

              {/* Customer Info */}
              <div className="flex items-center justify-center space-x-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {currentReview.name.charAt(0)}
                </div>

                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">
                      {currentReview.name}
                    </h4>
                    {currentReview.verified && (
                      <CheckBadgeIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{currentReview.service}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(currentReview.date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToReview(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-blue-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>

          {/* Review Counter */}
          <div className="text-center mt-4 text-sm text-gray-500">
            {currentIndex + 1} of {reviews.length} reviews
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-6 bg-white rounded-full px-6 py-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <CheckBadgeIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Verified Reviews</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <StarIcon className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">4.8+ Rating</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Real Customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifiedReviewsCarousel;
