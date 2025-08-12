'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, DollarSign, CheckCircle, ArrowRight, Calendar, Phone, Mail } from 'lucide-react';

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  priceRange?: { min: number; max: number };
  isActive: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ServiceDetailClientProps {
  service: Service;
  reviews: Review[];
  averageRating: number;
}

const faqs = [
  {
    question: 'How quickly can I get service?',
    answer: 'Most services can be scheduled within 24-48 hours, depending on availability and urgency.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We currently serve major cities across Nepal including Kathmandu, Pokhara, and Lalitpur.',
  },
  {
    question: 'Are your service providers verified?',
    answer: 'Yes, all our service providers go through a thorough verification process including background checks.',
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'We offer a satisfaction guarantee. If you\'re not happy, we\'ll work to make it right.',
  },
];

export function ServiceDetailClient({ service, reviews, averageRating }: ServiceDetailClientProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <ol className="flex items-center space-x-2">
          <li><Link href="/" className="hover:text-red-500">Home</Link></li>
          <li>/</li>
          <li><Link href="/services" className="hover:text-red-500">Services</Link></li>
          <li>/</li>
          <li className="text-gray-900">{service.title}</li>
        </ol>
      </nav>

      {/* Service Header */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="md:flex">
          {/* Service Image */}
          <div className="md:w-1/3 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-8">
            {service.imageUrl ? (
              <img
                src={service.imageUrl}
                alt={service.title}
                className="h-32 w-32 object-contain"
              />
            ) : (
              <div className="text-8xl">🔧</div>
            )}
          </div>

          {/* Service Info */}
          <div className="md:w-2/3 p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {service.category}
              </span>
              {service.isActive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Available
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
            
            <p className="text-gray-600 text-lg mb-6">{service.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                {renderStars(averageRating)}
                <span className="text-lg font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">({reviews.length} reviews)</span>
            </div>

            {/* Price Range */}
            {service.priceRange && (
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold text-gray-900">
                  Rs. {service.priceRange.min.toLocaleString()} - {service.priceRange.max.toLocaleString()}
                </span>
                <span className="text-gray-500">estimated</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/book/${service.slug}`}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-center font-semibold flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Book Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-semibold flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" />
                Call Provider
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
              { id: 'faq', label: 'FAQ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">Serving all of Nepal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">24/7 availability</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">Verified providers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">Transparent pricing</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s Included</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Professional service provider</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Quality guarantee</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Customer support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">Satisfaction guarantee</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⭐</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Be the first to review this service!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="font-semibold text-gray-900">{review.user.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg">
                  <button
                    className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                  >
                    {faq.question}
                  </button>
                  <div className="px-4 pb-3">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to book this service?</h3>
        <p className="text-red-100 mb-6 max-w-2xl mx-auto">
          Get started with just a few clicks. Our team will connect you with the perfect provider.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/book/${service.slug}`}
            className="px-8 py-4 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg"
          >
            Book Now
          </Link>
          <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors text-lg">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
