'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Star, Clock, Shield, Users, Award, TrendingUp, MapPin, Phone, MessageCircle, ArrowRight, Play } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: 'Verified Providers',
      description: 'All service providers are thoroughly vetted with background checks and verified credentials.',
      color: 'text-green-500'
    },
    {
      icon: Clock,
      title: 'Same Day Service',
      description: 'Get urgent services within hours. Emergency support available 24/7.',
      color: 'text-blue-500'
    },
    {
      icon: Star,
      title: 'Quality Guaranteed',
      description: 'Satisfaction guaranteed or we\'ll make it right. Your happiness is our priority.',
      color: 'text-yellow-500'
    },
    {
      icon: Users,
      title: 'Local Experts',
      description: 'Connect with experienced professionals who know your area and local requirements.',
      color: 'text-purple-500'
    },
    {
      icon: Award,
      title: 'Best Prices',
      description: 'Transparent pricing with no hidden fees. Compare and choose the best value.',
      color: 'text-red-500'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Tracking',
      description: 'Track your service provider in real-time and get live updates on service progress.',
      color: 'text-indigo-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose SewaGo?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've built the most trusted platform for local services in Nepal, 
            with features designed to make your experience seamless and worry-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Search & Select',
      description: 'Browse services, read reviews, and choose the perfect provider for your needs.',
      icon: '🔍'
    },
    {
      number: '02',
      title: 'Book & Schedule',
      description: 'Book instantly with transparent pricing. Schedule at your convenience.',
      icon: '📅'
    },
    {
      number: '03',
      title: 'Service Delivery',
      description: 'Get professional service with real-time tracking and quality assurance.',
      icon: '✅'
    },
    {
      number: '04',
      title: 'Rate & Review',
      description: 'Share your experience and help others find great service providers.',
      icon: '⭐'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How SewaGo Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started is simple. In just four easy steps, you'll have a 
            professional at your doorstep, ready to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform translate-x-1/2"></div>
              )}
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                  {step.number}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/en/how-it-works"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Learn More
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Ram Bahadur Thapa',
      location: 'Kathmandu',
      rating: 5,
      service: 'Electrician',
      comment: 'Excellent service! The electrician arrived on time and fixed our wiring issue professionally. Highly recommended!',
      avatar: 'RT'
    },
    {
      name: 'Sita Devi Shrestha',
      location: 'Pokhara',
      rating: 5,
      service: 'House Cleaning',
      comment: 'Amazing cleaning service. My house looks brand new! The cleaner was very thorough and professional.',
      avatar: 'SS'
    },
    {
      name: 'Bikash Kumar',
      location: 'Lalitpur',
      rating: 5,
      service: 'Plumber',
      comment: 'Quick response and professional work. Fixed our plumbing issue in no time. Will definitely use again!',
      avatar: 'BK'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what thousands of satisfied 
            customers across Nepal have to say about SewaGo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-blue-200">{testimonial.location}</div>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-blue-100 mb-4 leading-relaxed">
                "{testimonial.comment}"
              </p>

              <div className="text-sm text-blue-200">
                Service: <span className="font-medium">{testimonial.service}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/en/reviews"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Read All Reviews
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ServiceHighlightsSection() {
  const services = [
    {
      icon: '⚡',
      title: 'Electrical Services',
      description: 'Professional electricians for all your electrical needs',
      features: ['Wiring & Installation', 'Repairs & Maintenance', 'Safety Inspections', 'Emergency Services'],
      price: 'From ₹500',
      providers: '2,847+'
    },
    {
      icon: '🔧',
      title: 'Plumbing Services',
      description: 'Expert plumbers for residential and commercial plumbing',
      features: ['Pipe Repairs', 'Fixture Installation', 'Drain Cleaning', 'Water Heater Service'],
      price: 'From ₹600',
      providers: '1,923+'
    },
    {
      icon: '✨',
      title: 'House Cleaning',
      description: 'Professional cleaning services for your home',
      features: ['Regular Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning', 'Post-Construction'],
      price: 'From ₹800',
      providers: '3,156+'
    },
    {
      icon: '📚',
      title: 'Home Tutoring',
      description: 'Qualified tutors for all subjects and levels',
      features: ['Academic Support', 'Test Preparation', 'Language Learning', 'Skill Development'],
      price: 'From ₹400',
      providers: '1,234+'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our most requested services with verified providers, 
            transparent pricing, and guaranteed satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="text-4xl">{service.icon}</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{service.price}</div>
                  <div className="text-sm text-gray-500">{service.providers} providers</div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {service.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/en/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                View Providers
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/en/services"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            View All Services
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Join thousands of families who trust SewaGo for their local service needs. 
          Get started today and experience the difference.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/en/services"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Browse Services
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            href="/en/auth/register"
            className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            Sign Up Free
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Call: +977-1-4XXXXXX</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Live Chat Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>25+ Cities Covered</span>
          </div>
        </div>
      </div>
    </section>
  );
}
