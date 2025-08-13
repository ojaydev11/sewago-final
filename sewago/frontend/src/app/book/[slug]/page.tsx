'use client';

// Force dynamic rendering to prevent build-time prerendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock service data - will be replaced with API call
const mockService = {
  name: 'House Cleaning',
  slug: 'house-cleaning',
  description: 'Professional house cleaning services including dusting, vacuuming, and sanitizing.',
  basePrice: 50,
  category: 'cleaning',
};

const steps = [
  { id: 'details', name: 'Service Details', description: 'Review service information' },
  { id: 'datetime', name: 'Date & Time', description: 'Choose your preferred schedule' },
  { id: 'address', name: 'Address', description: 'Provide service location' },
  { id: 'contact', name: 'Contact Info', description: 'Confirm your details' },
  { id: 'review', name: 'Review & Book', description: 'Final confirmation' },
];

export default function BookingWizardPage({ params }: { params: Promise<{ slug: string }> }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    scheduledAt: '',
    address: {
      line1: '',
      city: '',
    },
    notes: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Mock API call - replace with actual booking API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: 'mock-service-id', // Replace with actual service ID
          scheduledAt: formData.scheduledAt,
          address: formData.address,
          notes: formData.notes,
          priceEstimateMin: mockService.basePrice,
          priceEstimateMax: mockService.basePrice + 20,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to booking confirmation
        router.push(`/orders/${data.booking._id || 'mock-booking-id'}`);
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Service Details
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Name</label>
                  <p className="mt-1 text-sm text-gray-900">{mockService.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{mockService.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{mockService.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Base Price</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">Rs. {mockService.basePrice}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Date & Time
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date & Time
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                value={formData.scheduledAt}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Choose a date and time that works best for you. We'll confirm availability.
              </p>
            </div>
          </div>
        );

      case 2: // Address
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                id="addressLine1"
                value={formData.address.line1}
                onChange={(e) => handleInputChange('address.line1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your street address"
                required
              />
            </div>
            <div>
              <label htmlFor="addressCity" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="addressCity"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your city"
                required
              />
            </div>
          </div>
        );

      case 3: // Contact Info
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="contactEmail"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email address"
                required
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Any special requirements or instructions..."
              />
            </div>
          </div>
        );

      case 4: // Review & Book
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service:</span>
                  <span className="text-sm font-medium text-gray-900">{mockService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date & Time:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.scheduledAt ? new Date(formData.scheduledAt).toLocaleString() : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.address.line1}, {formData.address.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Contact:</span>
                  <span className="text-sm font-medium text-gray-900">{formData.contactName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium text-gray-900">{formData.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{formData.contactEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estimated Price:</span>
                  <span className="text-sm font-medium text-gray-900">
                    Rs. {mockService.basePrice} - {mockService.basePrice + 20}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book {mockService.name}</h1>
          <p className="text-gray-600">Complete the form below to schedule your service</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                  )}
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-gray-300">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        stepIdx < currentStep
                          ? 'bg-indigo-600'
                          : stepIdx === currentStep
                          ? 'bg-indigo-600'
                          : 'bg-gray-300'
                      }`}
                      aria-current={stepIdx === currentStep ? 'step' : undefined}
                    />
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 hidden sm:block">
                    <span className="text-xs font-medium text-gray-500">{step.name}</span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Back to Services */}
        <div className="text-center mt-8">
          <Link
            href="/services"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to Services
          </Link>
        </div>
      </div>
    </div>
  );
}
