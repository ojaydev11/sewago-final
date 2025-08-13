'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, MapPinIcon, UserIcon, DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline';

const bookingSchema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  city: z.string().min(1, 'City is required'),
  hours: z.number().min(1, 'Hours must be at least 1').max(24, 'Hours cannot exceed 24'),
  extras: z.array(z.string()).optional(),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingWizardProps {
  service: any;
}

const steps = [
  { id: 'details', label: 'Service Details', icon: DocumentTextIcon },
  { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
  { id: 'address', label: 'Address', icon: MapPinIcon },
  { id: 'contact', label: 'Contact', icon: UserIcon },
  { id: 'review', label: 'Review', icon: CheckIcon },
];

export default function BookingWizard({ service }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimate, setEstimate] = useState<{ min: number; max: number } | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Update form data when form values change
  React.useEffect(() => {
    setFormData(watchedValues);
  }, [watchedValues]);

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

  const getEstimate = async () => {
    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: formData.serviceType,
          city: formData.city,
          hours: formData.hours,
          extras: formData.extras || [],
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setEstimate(data);
      }
    } catch (error) {
      console.error('Failed to get estimate:', error);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          scheduledAt: new Date(`${data.scheduledDate}T${data.scheduledTime}`).toISOString(),
          priceEstimateMin: estimate?.min || 1000,
          priceEstimateMax: estimate?.max || 5000,
          addressId: 'temp', // Will be created in the API
          notes: data.notes,
          // Address and user details
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: 'Nepal',
          },
          user: {
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
        }),
      });

      if (response.ok) {
        const booking = await response.json();
        router.push(`/orders/${booking.id}`);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Service Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                {...register('serviceType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select service type</option>
                <option value="basic">Basic Service</option>
                <option value="standard">Standard Service</option>
                <option value="premium">Premium Service</option>
              </select>
              {errors.serviceType && (
                <p className="text-red-500 text-sm mt-1">{errors.serviceType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                {...register('city')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your city"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                {...register('hours', { valueAsNumber: true })}
                min="1"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter estimated hours"
              />
              {errors.hours && (
                <p className="text-red-500 text-sm mt-1">{errors.hours.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Services
              </label>
              <div className="space-y-2">
                {['Emergency Service', 'Weekend Service', 'Extended Warranty', 'Premium Materials'].map((extra) => (
                  <label key={extra} className="flex items-center">
                    <input
                      type="checkbox"
                      value={extra}
                      {...register('extras')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{extra}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={getEstimate}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Get Estimate
            </button>

            {estimate && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">Price Estimate</h4>
                <p className="text-blue-700">
                  Rs. {estimate.min} - Rs. {estimate.max}
                </p>
              </div>
            )}
          </div>
        );

      case 1: // Schedule
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                {...register('scheduledDate')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.scheduledDate && (
                <p className="text-red-500 text-sm mt-1">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              <select
                {...register('scheduledTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
              {errors.scheduledTime && (
                <p className="text-red-500 text-sm mt-1">{errors.scheduledTime.message}</p>
              )}
            </div>
          </div>
        );

      case 2: // Address
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                {...register('street')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your street address"
              />
              {errors.street && (
                <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  {...register('state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                {...register('postalCode')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter postal code"
              />
              {errors.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
        );

      case 3: // Contact
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special instructions or requirements?"
              />
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-3">Service Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Service:</strong> {service.title}</p>
                <p><strong>Type:</strong> {formData.serviceType}</p>
                <p><strong>City:</strong> {formData.city}</p>
                <p><strong>Hours:</strong> {formData.hours}</p>
                {formData.extras && formData.extras.length > 0 && (
                  <p><strong>Extras:</strong> {formData.extras.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-3">Schedule</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Date:</strong> {formData.scheduledDate}</p>
                <p><strong>Time:</strong> {formData.scheduledTime}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-3">Address</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{formData.street}</p>
                <p>{formData.city}, {formData.state} {formData.postalCode}</p>
                <p>Nepal</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                {formData.notes && (
                  <p><strong>Notes:</strong> {formData.notes}</p>
                )}
              </div>
            </div>

            {estimate && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">Price Estimate</h4>
                <p className="text-blue-700 text-lg font-semibold">
                  Rs. {estimate.min} - Rs. {estimate.max}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Progress Steps */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'border-blue-500 text-blue-500'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isValid}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
