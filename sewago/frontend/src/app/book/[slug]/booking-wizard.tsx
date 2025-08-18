'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, Clock, User, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceRange?: { min: number; max: number };
}

interface BookingWizardProps {
  service: Service;
}

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
});

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  notes: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;
type ContactFormData = z.infer<typeof contactSchema>;

const steps = [
  { id: 'details', title: 'Service Details', icon: FileText },
  { id: 'schedule', title: 'Schedule', icon: Calendar },
  { id: 'address', title: 'Address', icon: MapPin },
  { id: 'contact', title: 'Contact', icon: User },
  { id: 'review', title: 'Review', icon: CheckCircle },
];

export function BookingWizard({ service }: BookingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    serviceDetails: {
      serviceId: service.id,
      extras: [] as string[],
      estimatedHours: 2,
    },
    schedule: {
      date: '',
      time: '',
      urgency: 'normal' as 'low' | 'normal' | 'high',
    },
    address: {} as AddressFormData,
    contact: {} as ContactFormData,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimate, setEstimate] = useState<{ min: number; max: number } | null>(null);

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const extras = [
    { id: 'emergency', label: 'Emergency Service', price: 500 },
    { id: 'weekend', label: 'Weekend Service', price: 300 },
    { id: 'after-hours', label: 'After Hours', price: 400 },
    { id: 'materials', label: 'Materials Included', price: 200 },
  ];

  const urgencyOptions = [
    { value: 'low' as const, label: 'Low Priority', description: 'Within 1 week' },
    { value: 'normal' as const, label: 'Normal Priority', description: 'Within 2-3 days' },
    { value: 'high' as const, label: 'High Priority', description: 'Within 24 hours' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceDetailsUpdate = (updates: Partial<typeof formData.serviceDetails>) => {
    setFormData(prev => ({
      ...prev,
      serviceDetails: { ...prev.serviceDetails, ...updates },
    }));
  };

  const handleScheduleUpdate = (updates: Partial<typeof formData.schedule>) => {
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, ...updates },
    }));
  };

  const handleAddressSubmit = (data: AddressFormData) => {
    setFormData(prev => ({ ...prev, address: data }));
    handleNext();
  };

  const handleContactSubmit = (data: ContactFormData) => {
    setFormData(prev => ({ ...prev, contact: data }));
    handleNext();
  };

  const getEstimate = async () => {
    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: service.category,
          hours: formData.serviceDetails.estimatedHours,
          extras: formData.serviceDetails.extras,
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: formData.serviceDetails.serviceId,
          scheduledAt: new Date(`${formData.schedule.date}T${formData.schedule.time}`).toISOString(),
          address: `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.postalCode}`,
          notes: formData.contact.notes,
        }),
      });

      if (response.ok) {
        const { booking } = await response.json();
        router.push(`/orders/${booking.id}`);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Service Details
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Service Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{service.category}</span>
                </div>
                {service.priceRange && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium">
                      Rs. {service.priceRange.min.toLocaleString()} - {service.priceRange.max.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Estimated Duration</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hours"
                    value="1"
                    checked={formData.serviceDetails.estimatedHours === 1}
                    onChange={(e) => handleServiceDetailsUpdate({ estimatedHours: parseInt(e.target.value) })}
                    className="text-red-500"
                  />
                  1 hour
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hours"
                    value="2"
                    checked={formData.serviceDetails.estimatedHours === 2}
                    onChange={(e) => handleServiceDetailsUpdate({ estimatedHours: parseInt(e.target.value) })}
                    className="text-red-500"
                  />
                  2 hours
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hours"
                    value="4"
                    checked={formData.serviceDetails.estimatedHours === 4}
                    onChange={(e) => handleServiceDetailsUpdate({ estimatedHours: parseInt(e.target.value) })}
                    className="text-red-500"
                  />
                  4+ hours
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {extras.map((extra) => (
                  <label key={extra.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.serviceDetails.extras.includes(extra.id)}
                      onChange={(e) => {
                        const newExtras = e.target.checked
                          ? [...formData.serviceDetails.extras, extra.id]
                          : formData.serviceDetails.extras.filter(id => id !== extra.id);
                        handleServiceDetailsUpdate({ extras: newExtras });
                      }}
                      className="text-red-500"
                    />
                    <div>
                      <div className="font-medium">{extra.label}</div>
                      <div className="text-sm text-gray-600">+Rs. {extra.price}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                getEstimate();
                handleNext();
              }}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              Get Estimate & Continue
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        );

      case 1: // Schedule
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">When do you need the service?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={formData.schedule.date}
                    onChange={(e) => handleScheduleUpdate({ date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text.sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <input
                    type="time"
                    value={formData.schedule.time}
                    onChange={(e) => handleScheduleUpdate({ time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Urgency Level</h3>
              <div className="space-y-3">
                {urgencyOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={formData.schedule.urgency === option.value}
                      onChange={(e) => handleScheduleUpdate({ urgency: e.target.value as 'low' | 'normal' | 'high' })}
                      className="text-red-500"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {estimate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Price Estimate</h4>
                <p className="text-green-700">
                  Estimated cost: Rs. {estimate.min.toLocaleString()} - {estimate.max.toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={!formData.schedule.date || !formData.schedule.time}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        );

      case 2: // Address
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Service Address</h3>
            <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  {...addressForm.register('street')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
                {addressForm.formState.errors.street && (
                  <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    {...addressForm.register('city')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Kathmandu"
                  />
                  {addressForm.formState.errors.city && (
                    <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text.sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    {...addressForm.register('state')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Bagmati"
                  />
                  {addressForm.formState.errors.state && (
                    <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.state.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    {...addressForm.register('postalCode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="44600"
                  />
                  {addressForm.formState.errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{addressForm.formState.errors.postalCode.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Previous
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        );

      case 3: // Contact
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <form onSubmit={contactForm.handleSubmit(handleContactSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  {...contactForm.register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="John Doe"
                />
                {contactForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{contactForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    {...contactForm.register('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                  {contactForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{contactForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    {...contactForm.register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="+977 1234567890"
                  />
                  {contactForm.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{contactForm.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                <textarea
                  {...contactForm.register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Any special requirements or instructions..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Previous
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review Your Booking</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Service Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{formData.serviceDetails.estimatedHours} hours</span>
                  </div>
                  {formData.serviceDetails.extras.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extras:</span>
                      <span className="font-medium">
                        {formData.serviceDetails.extras.map(id => 
                          extras.find(e => e.id === id)?.label
                        ).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Schedule</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formData.schedule.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formData.schedule.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className="font-medium capitalize">{formData.schedule.urgency}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                <div className="text-sm text-gray-700">
                  {formData.address.street}<br />
                  {formData.address.city}, {formData.address.state} {formData.address.postalCode}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.contact.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.contact.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{formData.contact.phone}</span>
                  </div>
                </div>
              </div>

              {estimate && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Price Estimate</h4>
                  <div className="text-lg font-bold text-green-600">
                    Rs. {estimate.min.toLocaleString()} - {estimate.max.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book {service.name}</h1>
        <p className="text-gray-600">Complete the form below to schedule your service</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-red-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <p>Need help? Contact us at support@sewago.com or call +977 1234567890</p>
      </div>
    </div>
  );
}